<?php
declare(strict_types=1);

const CREOTOPI_STORAGE = __DIR__ . '/storage';
const CREOTOPI_ADMIN_FILE = CREOTOPI_STORAGE . '/admin.json';
const CREOTOPI_CONTENT_FILE = CREOTOPI_STORAGE . '/content.json';

$creotopiConfig = __DIR__ . '/config.php';
if (is_file($creotopiConfig)) {
    require_once $creotopiConfig;
}

function creotopi_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    ini_set('session.use_strict_mode', '1');
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('creotopi_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function creotopi_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function creotopi_read_json_input(): array
{
    $decoded = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($decoded)) {
        creotopi_json(['error' => 'Invalid JSON request.'], 400);
    }
    return $decoded;
}

function creotopi_read_json_file(string $path): ?array
{
    if (!is_file($path)) {
        return null;
    }
    $decoded = json_decode(file_get_contents($path) ?: '', true);
    return is_array($decoded) ? $decoded : null;
}

function creotopi_save_json_file(string $path, array $data): bool
{
    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($encoded === false) {
        return false;
    }

    $temporaryPath = tempnam(dirname($path), 'creotopi-');
    if ($temporaryPath === false) {
        return false;
    }

    $written = file_put_contents($temporaryPath, $encoded . "\n", LOCK_EX);
    if ($written === false || !rename($temporaryPath, $path)) {
        @unlink($temporaryPath);
        return false;
    }
    return true;
}

function creotopi_require_admin(): void
{
    if (empty($_SESSION['admin_authenticated'])) {
        creotopi_json(['error' => 'Please sign in again.'], 401);
    }
}

function creotopi_require_csrf(): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['csrf_token'] ?? '';
    if (!is_string($provided) || !is_string($expected) || $expected === '' || !hash_equals($expected, $provided)) {
        creotopi_json(['error' => 'Your session expired. Sign in again and retry.'], 403);
    }
}

function creotopi_valid_web_url(string $url): bool
{
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }
    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    return in_array($scheme, ['http', 'https'], true);
}
