<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
creotopi_start_session();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    creotopi_json([
        'setupRequired' => !is_file(CREOTOPI_ADMIN_FILE),
        'setupConfigured' => defined('CREOTOPI_SETUP_KEY')
            && strlen((string) CREOTOPI_SETUP_KEY) >= 32
            && !str_contains((string) CREOTOPI_SETUP_KEY, 'REPLACE_'),
        'authenticated' => !empty($_SESSION['admin_authenticated']),
        'csrfToken' => $_SESSION['csrf_token'] ?? '',
    ]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: GET, POST');
    creotopi_json(['error' => 'Method not allowed.'], 405);
}

$request = creotopi_read_json_input();
$action = (string) ($request['action'] ?? '');

if ($action === 'setup') {
    if (is_file(CREOTOPI_ADMIN_FILE)) {
        creotopi_json(['error' => 'Admin setup is already complete.'], 409);
    }

    $password = (string) ($request['password'] ?? '');
    if (strlen($password) < 12) {
        creotopi_json(['error' => 'Choose a password with at least 12 characters.'], 422);
    }

    $setupKey = (string) ($request['setupKey'] ?? '');
    $expectedSetupKey = defined('CREOTOPI_SETUP_KEY') ? (string) CREOTOPI_SETUP_KEY : '';
    if (strlen($expectedSetupKey) < 32 || str_contains($expectedSetupKey, 'REPLACE_')) {
        creotopi_json(['error' => 'Add your private setup key in api/config.php first.'], 503);
    }
    if (!hash_equals($expectedSetupKey, $setupKey)) {
        creotopi_json(['error' => 'The setup key did not match api/config.php.'], 403);
    }

    if (!creotopi_save_json_file(CREOTOPI_ADMIN_FILE, ['passwordHash' => password_hash($password, PASSWORD_DEFAULT)])) {
        creotopi_json(['error' => 'Could not save admin access. Check folder permissions.'], 500);
    }

    session_regenerate_id(true);
    $_SESSION['admin_authenticated'] = true;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    creotopi_json(['authenticated' => true, 'csrfToken' => $_SESSION['csrf_token']]);
}

if ($action === 'login') {
    if (!is_file(CREOTOPI_ADMIN_FILE)) {
        creotopi_json(['error' => 'Create the admin password first.'], 409);
    }

    $now = time();
    $attempts = array_filter($_SESSION['login_attempts'] ?? [], static fn($time) => is_int($time) && $time > $now - 900);
    if (count($attempts) >= 8) {
        creotopi_json(['error' => 'Too many attempts. Wait 15 minutes and try again.'], 429);
    }

    $admin = creotopi_read_json_file(CREOTOPI_ADMIN_FILE);
    $password = (string) ($request['password'] ?? '');
    if (!$admin || !password_verify($password, (string) ($admin['passwordHash'] ?? ''))) {
        $attempts[] = $now;
        $_SESSION['login_attempts'] = array_values($attempts);
        creotopi_json(['error' => 'That password did not match.'], 401);
    }

    session_regenerate_id(true);
    unset($_SESSION['login_attempts']);
    $_SESSION['admin_authenticated'] = true;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    creotopi_json(['authenticated' => true, 'csrfToken' => $_SESSION['csrf_token']]);
}

if ($action === 'logout') {
    creotopi_require_admin();
    creotopi_require_csrf();
    $_SESSION = [];
    session_destroy();
    creotopi_json(['authenticated' => false]);
}

creotopi_json(['error' => 'Unknown action.'], 400);
