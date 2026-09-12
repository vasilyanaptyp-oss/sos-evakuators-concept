<?php
/**
 * Lead intake for the request form: stores a copy of every request on the server
 * and notifies the dispatcher, so nothing is lost when a visitor closes WhatsApp.
 * Stores: name, phone, issue, details (may contain a map link), page, language.
 * Never stores: IP addresses (only a salted hash for rate limiting), photos, user agents.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');

function lead_fail(int $status, string $error): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    header('Allow: POST');
    lead_fail(405, 'method');
}
$length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($length < 2 || $length > 8192) {
    lead_fail(413, 'size');
}
$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    lead_fail(400, 'json');
}
// Honeypot: real visitors never see this field.
if (trim((string) ($input['company'] ?? '')) !== '') {
    http_response_code(204);
    exit;
}

$clean = static function ($value, int $max): string {
    $value = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string) $value) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
};
$name = $clean($input['name'] ?? '', 80);
$phone = $clean($input['phone'] ?? '', 32);
$issue = $clean($input['issue'] ?? '', 120);
$details = $clean($input['details'] ?? '', 600);
$page = $clean($input['page'] ?? '/', 140);
$language = strtolower($clean($input['language'] ?? 'lv', 2));
$language = in_array($language, ['lv', 'ru', 'en'], true) ? $language : 'lv';
$digits = preg_replace('/\D/', '', $phone) ?? '';
if ($name === '' || strlen($digits) < 7 || strlen($digits) > 15 || !preg_match('/^\+?[\d\s().-]+$/', $phone)) {
    lead_fail(422, 'phone');
}
$page = '/' . ltrim((string) preg_replace('#[^A-Za-z0-9_./-]#', '', $page), '/');

$storage = __DIR__ . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'storage';
$directory = $storage . DIRECTORY_SEPARATOR . 'leads';
if (!is_dir($directory) && !@mkdir($directory, 0750, true) && !is_dir($directory)) {
    lead_fail(503, 'storage');
}

// Rate limit: 8 requests per hour per address (address kept only as a salted hash).
$saltFile = $directory . DIRECTORY_SEPARATOR . '.salt';
$salt = is_file($saltFile) ? (string) @file_get_contents($saltFile) : '';
if ($salt === '') {
    $salt = bin2hex(random_bytes(16));
    @file_put_contents($saltFile, $salt, LOCK_EX);
    @chmod($saltFile, 0640);
}
$addressKey = hash('sha256', $salt . (string) ($_SERVER['REMOTE_ADDR'] ?? ''));
$limitFile = $directory . DIRECTORY_SEPARATOR . '.ratelimit.json';
$limits = json_decode((string) @file_get_contents($limitFile), true);
$limits = is_array($limits) ? $limits : [];
$now = time();
foreach ($limits as $key => $stamps) {
    $limits[$key] = array_values(array_filter((array) $stamps, static fn ($t) => ($now - (int) $t) < 3600));
    if (!$limits[$key]) {
        unset($limits[$key]);
    }
}
if (count($limits[$addressKey] ?? []) >= 8) {
    lead_fail(429, 'rate');
}
$limits[$addressKey][] = $now;
@file_put_contents($limitFile, json_encode($limits), LOCK_EX);
@chmod($limitFile, 0640);

$id = date('Ymd-His', $now) . '-' . bin2hex(random_bytes(3));
$mapLink = null;
if (preg_match('#https://maps\.google\.com/\?q=-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?#', $details, $m)) {
    $mapLink = $m[0];
}
$lead = [
    'id' => $id,
    'at' => date(DATE_ATOM, $now),
    'status' => 'new',
    'name' => $name,
    'phone' => $phone,
    'phone_tel' => '+' . ltrim($digits, '0'),
    'issue' => $issue,
    'details' => $details,
    'map' => $mapLink,
    'page' => $page,
    'language' => $language,
];
$payload = json_encode($lead, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$path = $directory . DIRECTORY_SEPARATOR . $id . '.json';
if ($payload === false || @file_put_contents($path, $payload . PHP_EOL, LOCK_EX) === false) {
    lead_fail(503, 'write');
}
@chmod($path, 0640);

// ---------- notifications (best effort, never block the visitor) ----------
$notify = json_decode((string) @file_get_contents($storage . DIRECTORY_SEPARATOR . 'notify.json'), true);
$notify = is_array($notify) ? $notify : [];
$live = json_decode((string) @file_get_contents($storage . DIRECTORY_SEPARATOR . 'live.json'), true);
$email = trim((string) ($notify['email'] ?? ''));
if ($email === '' && is_array($live)) {
    $email = trim((string) ($live['global']['email'] ?? ''));
}
$lines = [
    'Jauns pieteikums no autopalidziba.lv',
    '',
    'Vārds: ' . $name,
    'Tālrunis: ' . $phone,
    'Situācija: ' . ($issue !== '' ? $issue : '—'),
    'Vieta / apraksts: ' . ($details !== '' ? $details : '—'),
    'Karte: ' . ($mapLink ?? '—'),
    'Lapa: https://autopalidziba.lv' . $page . ' (' . $language . ')',
    'Laiks: ' . date('d.m.Y H:i', $now),
    '',
    'Zvanīt: tel:' . $lead['phone_tel'],
    'Visi pieteikumi: https://autopalidziba.lv/admin/',
];
$text = implode("\n", $lines);
$sent = ['email' => false, 'telegram' => false];
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) && ($notify['email_enabled'] ?? true)) {
    $subject = '=?UTF-8?B?' . base64_encode('Pieteikums: ' . $name . ' · ' . $phone) . '?=';
    $headers = "From: SOS Evakuators <no-reply@autopalidziba.lv>\r\nReply-To: no-reply@autopalidziba.lv\r\nContent-Type: text/plain; charset=UTF-8\r\nX-Mailer: autopalidziba-leads";
    $sent['email'] = @mail($email, $subject, $text, $headers);
}
$token = trim((string) ($notify['telegram_token'] ?? ''));
$chat = trim((string) ($notify['telegram_chat'] ?? ''));
if ($token !== '' && $chat !== '' && preg_match('/^\d+:[A-Za-z0-9_-]{20,}$/', $token) && preg_match('/^-?\d+$/', $chat)) {
    $body = http_build_query(['chat_id' => $chat, 'text' => $text, 'disable_web_page_preview' => 'true']);
    $url = 'https://api.telegram.org/bot' . $token . '/sendMessage';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6]);
        $response = curl_exec($ch);
        $sent['telegram'] = is_string($response) && strpos($response, '"ok":true') !== false;
        curl_close($ch);
    } else {
        $context = stream_context_create(['http' => ['method' => 'POST', 'header' => "Content-Type: application/x-www-form-urlencoded\r\n", 'content' => $body, 'timeout' => 6]]);
        $response = @file_get_contents($url, false, $context);
        $sent['telegram'] = is_string($response) && strpos($response, '"ok":true') !== false;
    }
}
$lead['notified'] = $sent;
@file_put_contents($path, json_encode($lead, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL, LOCK_EX);

echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
