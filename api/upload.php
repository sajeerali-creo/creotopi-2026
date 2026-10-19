<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
creotopi_start_session();
creotopi_require_admin();
creotopi_require_csrf();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    creotopi_json(['error' => 'Method not allowed.'], 405);
}

$file = $_FILES['image'] ?? null;
if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    creotopi_json(['error' => 'Choose an image to upload.'], 422);
}
if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
    creotopi_json(['error' => 'Images must be 5 MB or smaller.'], 413);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file((string) $file['tmp_name']);
$extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
if (!isset($extensions[$mime])) {
    creotopi_json(['error' => 'Use a JPG, PNG, or WebP image.'], 415);
}

$uploadDirectory = dirname(__DIR__) . '/assets/uploads';
if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
    creotopi_json(['error' => 'Could not create the image folder. Check folder permissions.'], 500);
}

$filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
$destination = $uploadDirectory . '/' . $filename;
if (!move_uploaded_file((string) $file['tmp_name'], $destination)) {
    creotopi_json(['error' => 'Could not save the image. Check folder permissions.'], 500);
}

creotopi_json(['url' => 'assets/uploads/' . $filename]);
