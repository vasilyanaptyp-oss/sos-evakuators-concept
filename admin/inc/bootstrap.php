<?php
declare(strict_types=1);

define('CMS_ROOT', dirname(__DIR__, 2));
define('CMS_ADMIN_ROOT', dirname(__DIR__));
define('CMS_STORAGE', CMS_ADMIN_ROOT . DIRECTORY_SEPARATOR . 'storage');
define('CMS_UPLOADS', CMS_ROOT . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'uploads');
define('CMS_REQUEST_STARTED', microtime(true));

if (!is_dir(CMS_STORAGE)) {
    @mkdir(CMS_STORAGE, 0750, true);
}
if (!is_dir(CMS_UPLOADS)) {
    @mkdir(CMS_UPLOADS, 0755, true);
}

function cms_is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
}

function cms_send_security_headers(bool $json = false): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: no-referrer');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    header('X-Robots-Tag: noindex, nofollow, noarchive');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'");
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
    }
}

function cms_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('autopalidziba_cms');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/admin/',
        'secure' => cms_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function cms_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function cms_read_json(string $path, array $fallback = []): array
{
    if (!is_file($path)) {
        return $fallback;
    }
    $raw = @file_get_contents($path);
    if ($raw === false || $raw === '') {
        return $fallback;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function cms_write_json(string $path, array $data): void
{
    $directory = dirname($path);
    if (!is_dir($directory) && !@mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('Neizdevās izveidot datu mapi.');
    }
    $temporary = $path . '.tmp-' . bin2hex(random_bytes(5));
    $payload = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payload === false || @file_put_contents($temporary, $payload . PHP_EOL, LOCK_EX) === false) {
        throw new RuntimeException('Neizdevās saglabāt datus.');
    }
    @chmod($temporary, 0640);
    if (!@rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('Neizdevās pabeigt saglabāšanu.');
    }
}

function cms_auth_config(): array
{
    return cms_read_json(CMS_STORAGE . DIRECTORY_SEPARATOR . 'auth.json');
}

function cms_auth_users(array $config): array
{
    if (isset($config['users']) && is_array($config['users'])) {
        return $config['users'];
    }

    // Backwards compatibility with the original single-user config.
    if (!empty($config['username'])) {
        return [(string) $config['username'] => $config];
    }

    return [];
}

function cms_is_authenticated(): bool
{
    return !empty($_SESSION['cms_authenticated'])
        && !empty($_SESSION['cms_last_seen'])
        && (time() - (int) $_SESSION['cms_last_seen']) < 28800;
}

function cms_touch_session(): void
{
    $_SESSION['cms_last_seen'] = time();
}

function cms_client_key(): string
{
    $ip = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : 'unknown';
    return hash('sha256', $ip);
}

function cms_login_is_blocked(): array
{
    $path = CMS_STORAGE . DIRECTORY_SEPARATOR . 'login-attempts.json';
    $attempts = cms_read_json($path);
    $key = cms_client_key();
    $entry = isset($attempts[$key]) && is_array($attempts[$key]) ? $attempts[$key] : ['count' => 0, 'first' => time()];
    if ((time() - (int) ($entry['first'] ?? 0)) > 900) {
        unset($attempts[$key]);
        cms_write_json($path, $attempts);
        return [false, 0];
    }
    $count = (int) ($entry['count'] ?? 0);
    $remaining = max(0, 900 - (time() - (int) ($entry['first'] ?? time())));
    return [$count >= 7, $remaining];
}

function cms_record_login_failure(): void
{
    $path = CMS_STORAGE . DIRECTORY_SEPARATOR . 'login-attempts.json';
    $attempts = cms_read_json($path);
    $key = cms_client_key();
    $entry = isset($attempts[$key]) && is_array($attempts[$key]) ? $attempts[$key] : ['count' => 0, 'first' => time()];
    if ((time() - (int) ($entry['first'] ?? 0)) > 900) {
        $entry = ['count' => 0, 'first' => time()];
    }
    $entry['count'] = (int) ($entry['count'] ?? 0) + 1;
    $attempts[$key] = $entry;
    cms_write_json($path, $attempts);
}

function cms_clear_login_failures(): void
{
    $path = CMS_STORAGE . DIRECTORY_SEPARATOR . 'login-attempts.json';
    $attempts = cms_read_json($path);
    unset($attempts[cms_client_key()]);
    cms_write_json($path, $attempts);
}

function cms_verify_password(string $password, array $config): bool
{
    $salt = (string) ($config['salt'] ?? '');
    $iterations = (int) ($config['iterations'] ?? 210000);
    $expected = (string) ($config['hash'] ?? '');
    if ($salt === '' || $expected === '' || $iterations < 100000) {
        return false;
    }
    $actual = hash_pbkdf2('sha256', $password, $salt, $iterations, 64, false);
    return hash_equals($expected, $actual);
}

function cms_login(string $username, string $password): bool
{
    [$blocked] = cms_login_is_blocked();
    if ($blocked) {
        return false;
    }
    $config = cms_auth_config();
    $submittedUsername = trim($username);
    $matchedUsername = '';
    $matchedConfig = null;
    foreach (cms_auth_users($config) as $storedUsername => $storedConfig) {
        if (is_array($storedConfig) && hash_equals((string) $storedUsername, $submittedUsername)) {
            $matchedUsername = (string) $storedUsername;
            $matchedConfig = $storedConfig;
        }
    }

    // Verify a dummy hash for unknown users so username checks do not become a
    // cheap account-enumeration oracle.
    $verifyConfig = $matchedConfig ?? [
        'salt' => 'c29zLWV2YWt1YXRvcnMtZHVtbXktc2FsdA',
        'iterations' => 210000,
        'hash' => 'fe9cbc1f7a77e2bf5becedbc6c43cb916220f391b8cc0ac1a49749657b1aad85',
    ];
    if ($matchedConfig === null || !cms_verify_password($password, $verifyConfig)) {
        cms_record_login_failure();
        usleep(350000);
        return false;
    }
    cms_clear_login_failures();
    session_regenerate_id(true);
    $_SESSION['cms_authenticated'] = true;
    $_SESSION['cms_user'] = $matchedUsername;
    $_SESSION['cms_last_seen'] = time();
    $_SESSION['cms_csrf'] = bin2hex(random_bytes(24));
    return true;
}

function cms_logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
    }
    session_destroy();
}

function cms_csrf_token(): string
{
    if (empty($_SESSION['cms_csrf'])) {
        $_SESSION['cms_csrf'] = bin2hex(random_bytes(24));
    }
    return (string) $_SESSION['cms_csrf'];
}

function cms_require_auth(bool $json = false): void
{
    if (!cms_is_authenticated()) {
        if ($json) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Sesija beigusies. Ieejiet vēlreiz.'], JSON_UNESCAPED_UNICODE);
        } else {
            header('Location: /admin/');
        }
        exit;
    }
    cms_touch_session();
}

function cms_require_csrf(): void
{
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf'] ?? '');
    if (!is_string($token) || !hash_equals(cms_csrf_token(), $token)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Drošības pārbaude neizdevās. Pārlādējiet lapu.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function cms_json_input(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function cms_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function cms_normalize_page(string $page): string
{
    $page = str_replace('\\', '/', trim($page));
    $page = ltrim($page, '/');
    if ($page === '' || strpos($page, "\0") !== false || preg_match('#(^|/)\.\.(/|$)#', $page)) {
        throw new InvalidArgumentException('Nederīgs lapas ceļš.');
    }
    if (!preg_match('/\.html$/i', $page) || strpos($page, 'admin/') === 0) {
        throw new InvalidArgumentException('Var rediģēt tikai vietnes HTML lapas.');
    }
    $candidate = CMS_ROOT . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $page);
    if (!is_file($candidate)) {
        throw new InvalidArgumentException('Lapa nav atrasta.');
    }
    $root = realpath(CMS_ROOT);
    $real = realpath($candidate);
    if ($root === false || $real === false || strpos($real, $root . DIRECTORY_SEPARATOR) !== 0) {
        throw new InvalidArgumentException('Nederīgs lapas ceļš.');
    }
    return $page;
}

cms_start_session();
