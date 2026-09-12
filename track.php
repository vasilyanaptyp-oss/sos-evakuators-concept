<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo '{"ok":false}';
    exit;
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength < 2 || $contentLength > 4096) {
    http_response_code(413);
    echo '{"ok":false}';
    exit;
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo '{"ok":false}';
    exit;
}

// Crawlers, headless browsers and command-line clients are not customers.
$agent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
if ($agent === '' || preg_match('/bot|crawl|spider|slurp|headless|playwright|puppeteer|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl\/|wget|python|httpclient|phantom|selenium|facebookexternalhit|preview/i', $agent)) {
    http_response_code(204);
    exit;
}

$event = strtolower(trim((string) ($input['event'] ?? '')));
$sessionId = strtolower(trim((string) ($input['session'] ?? '')));
$visitorId = strtolower(trim((string) ($input['visitor'] ?? '')));
if (!preg_match('/^[a-f0-9-]{16,64}$/', $visitorId)) {
    $visitorId = $sessionId;
}
$allowedEvents = [
    'page_view',
    'heartbeat',
    'phone_primary',
    'phone_secondary',
    'whatsapp_open',
    'location_open',
    'request_prepared',
    'sms_open',
];
if (!in_array($event, $allowedEvents, true) || !preg_match('/^[a-f0-9-]{16,64}$/', $sessionId)) {
    http_response_code(422);
    echo '{"ok":false}';
    exit;
}

$path = trim((string) ($input['path'] ?? '/'));
$path = preg_replace('/[?#].*$/', '', $path);
$path = '/' . ltrim((string) preg_replace('#[^A-Za-z0-9_./-]#', '', $path), '/');
$path = substr($path, 0, 140);
// Only real pages count: the admin area, previews and 404s (e.g. /adm/) are ignored.
if (preg_match('#^/(admin|adm)(/|$)#', $path) || ($path !== '/' && !is_file(__DIR__ . rtrim($path, '/') . '/index.html'))) {
    http_response_code(204);
    exit;
}
$language = strtolower((string) ($input['language'] ?? 'lv'));
$language = in_array($language, ['lv', 'ru', 'en'], true) ? $language : 'lv';
$device = strtolower((string) ($input['device'] ?? 'desktop'));
$device = in_array($device, ['mobile', 'tablet', 'desktop'], true) ? $device : 'desktop';
$source = strtolower((string) ($input['source'] ?? 'direct'));
$source = in_array($source, ['direct', 'google', 'bing', 'facebook', 'instagram', 'whatsapp', 'other'], true) ? $source : 'other';

$root = __DIR__;
$storage = $root . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'storage';
$directory = $storage . DIRECTORY_SEPARATOR . 'analytics';
if (!is_dir($directory) && !@mkdir($directory, 0750, true) && !is_dir($directory)) {
    http_response_code(503);
    echo '{"ok":false}';
    exit;
}

function analytics_read_json(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $decoded = json_decode((string) @file_get_contents($path), true);
    return is_array($decoded) ? $decoded : [];
}

function analytics_write_json(string $path, array $data): bool
{
    $temporary = $path . '.tmp-' . bin2hex(random_bytes(4));
    $payload = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payload === false || @file_put_contents($temporary, $payload, LOCK_EX) === false) {
        @unlink($temporary);
        return false;
    }
    @chmod($temporary, 0640);
    if (!@rename($temporary, $path)) {
        @unlink($temporary);
        return false;
    }
    return true;
}

function analytics_daily_backup(string $storage, string $date): void
{
    $directory = $storage . DIRECTORY_SEPARATOR . 'backups';
    $path = $directory . DIRECTORY_SEPARATOR . $date . '.json';
    if (is_file($path)) {
        return;
    }
    $live = $storage . DIRECTORY_SEPARATOR . 'live.json';
    if (!is_file($live)) {
        return;
    }
    if (!is_dir($directory)) {
        @mkdir($directory, 0750, true);
    }
    $state = analytics_read_json($live);
    if (!$state) {
        return;
    }
    $state['backup'] = ['id' => $date, 'created_at' => date(DATE_ATOM), 'type' => 'daily-live-state'];
    analytics_write_json($path, $state);
    $files = glob($directory . DIRECTORY_SEPARATOR . '*.json') ?: [];
    rsort($files, SORT_STRING);
    foreach (array_slice($files, 30) as $old) {
        @unlink($old);
    }
}

$lock = @fopen($directory . DIRECTORY_SEPARATOR . 'analytics.lock', 'c+');
if (!$lock || !@flock($lock, LOCK_EX)) {
    http_response_code(503);
    echo '{"ok":false}';
    exit;
}

try {
    $now = time();
    $date = date('Y-m-d', $now);
    $sessionKey = hash('sha256', $sessionId);
    $visitorKey = hash('sha256', $visitorId);
    $activePath = $directory . DIRECTORY_SEPARATOR . 'active.json';
    $active = analytics_read_json($activePath);
    foreach ($active as $key => $row) {
        if (!is_array($row) || ($now - (int) ($row['last_seen'] ?? 0)) > 900) {
            unset($active[$key]);
        }
    }

    $previous = isset($active[$sessionKey]) && is_array($active[$sessionKey]) ? $active[$sessionKey] : [];
    $lastEvent = isset($previous['last_event']) && is_array($previous['last_event']) ? $previous['last_event'] : [];
    $lastEventAt = (int) ($lastEvent[$event] ?? 0);
    $minimumGap = $event === 'heartbeat' ? 40 : 2;
    $duplicate = ($now - $lastEventAt) < $minimumGap;
    $lastEvent[$event] = $now;
    $active[$sessionKey] = [
        'last_seen' => $now,
        'path' => $path,
        'language' => $language,
        'device' => $device,
        'last_event' => array_slice($lastEvent, -12, null, true),
    ];
    if (count($active) > 2500) {
        uasort($active, static function (array $a, array $b): int {
            return ((int) ($b['last_seen'] ?? 0)) <=> ((int) ($a['last_seen'] ?? 0));
        });
        $active = array_slice($active, 0, 2000, true);
    }
    analytics_write_json($activePath, $active);

    if (!$duplicate && $event !== 'heartbeat') {
        $dailyPath = $directory . DIRECTORY_SEPARATOR . $date . '.json';
        $daily = analytics_read_json($dailyPath);
        if (!$daily) {
            $daily = [
                'date' => $date,
                'totals' => [],
                'visitors' => [],
                'pages' => [],
                'languages' => [],
                'devices' => [],
                'sources' => [],
            ];
        }
        $daily['totals'][$event] = min(1000000, (int) ($daily['totals'][$event] ?? 0) + 1);
        if (!isset($daily['visitors'][$visitorKey]) && count((array) $daily['visitors']) < 10000) {
            $daily['visitors'][$visitorKey] = 1;
        }
        if (!isset($daily['pages'][$path]) && count((array) $daily['pages']) < 300) {
            $daily['pages'][$path] = [];
        }
        if (isset($daily['pages'][$path])) {
            $daily['pages'][$path][$event] = min(1000000, (int) ($daily['pages'][$path][$event] ?? 0) + 1);
        }
        if ($event === 'page_view') {
            foreach (['languages' => $language, 'devices' => $device, 'sources' => $source] as $bucket => $label) {
                $daily[$bucket][$label] = min(1000000, (int) ($daily[$bucket][$label] ?? 0) + 1);
            }
        }
        $daily['updated_at'] = date(DATE_ATOM, $now);
        analytics_write_json($dailyPath, $daily);
        analytics_daily_backup($storage, $date);
    }
} finally {
    @flock($lock, LOCK_UN);
    @fclose($lock);
}

http_response_code(204);
