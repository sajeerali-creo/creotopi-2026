<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') {
    $content = creotopi_read_json_file(CREOTOPI_CONTENT_FILE);
    if (!$content || !isset($content['projects'], $content['googleReviews'])) {
        creotopi_json(['error' => 'Content data is not available.'], 503);
    }
    creotopi_json([
        'projects' => $content['projects'],
        'googleReviews' => $content['googleReviews'],
    ]);
}

creotopi_start_session();
if ($method !== 'POST') {
    header('Allow: GET, POST');
    creotopi_json(['error' => 'Method not allowed.'], 405);
}

creotopi_require_admin();
creotopi_require_csrf();
$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 2_000_000) {
    creotopi_json(['error' => 'The content is too large to save.'], 413);
}

$request = creotopi_read_json_input();
$projects = $request['projects'] ?? null;
$reviews = $request['googleReviews'] ?? null;
$validTags = ['Branding', 'UI/UX', 'Web', 'Social'];

if (!is_array($projects) || count($projects) > 100 || !is_array($reviews) || !is_array($reviews['items'] ?? null)) {
    creotopi_json(['error' => 'Project or review data is invalid.'], 422);
}

foreach ($projects as $project) {
    if (!is_array($project)
        || trim((string) ($project['title'] ?? '')) === ''
        || strlen((string) $project['title']) > 200
        || !in_array($project['tag'] ?? '', $validTags, true)
        || !creotopi_valid_web_url((string) ($project['url'] ?? ''))) {
        creotopi_json(['error' => 'Each project needs a title, category, and valid Behance link.'], 422);
    }

    $cover = (string) ($project['cover'] ?? '');
    $isLocalImage = preg_match('#^assets/[A-Za-z0-9_./-]+$#', $cover) === 1 && !str_contains($cover, '..');
    if (!$isLocalImage && !creotopi_valid_web_url($cover)) {
        creotopi_json(['error' => 'Each project needs a valid image path or HTTPS image URL.'], 422);
    }
}

$rating = filter_var($reviews['rating'] ?? null, FILTER_VALIDATE_FLOAT);
$totalReviews = filter_var($reviews['totalReviews'] ?? null, FILTER_VALIDATE_INT);
if ($rating === false || $rating < 0 || $rating > 5 || $totalReviews === false || $totalReviews < 0 || $totalReviews > 100000000) {
    creotopi_json(['error' => 'Review rating or review count is invalid.'], 422);
}
if (count($reviews['items']) > 200) {
    creotopi_json(['error' => 'There are too many review entries.'], 422);
}

foreach (['writeReviewUrl'] as $urlField) {
    $url = trim((string) ($reviews[$urlField] ?? ''));
    if ($url !== '' && !creotopi_valid_web_url($url)) {
        creotopi_json(['error' => 'Google review links must use a valid HTTP or HTTPS URL.'], 422);
    }
}

foreach ($reviews['items'] as $review) {
    if (!is_array($review)) {
        creotopi_json(['error' => 'Each review entry must be an object.'], 422);
    }
    $reviewRating = filter_var($review['rating'] ?? null, FILTER_VALIDATE_INT);
    if (trim((string) ($review['author'] ?? '')) === ''
        || trim((string) ($review['text'] ?? '')) === ''
        || $reviewRating === false || $reviewRating < 1 || $reviewRating > 5) {
        creotopi_json(['error' => 'Each review needs an author, review text, and a rating from 1 to 5.'], 422);
    }
}

$next = [
    'projects' => array_values($projects),
    'googleReviews' => [
        'writeReviewUrl' => trim((string) ($reviews['writeReviewUrl'] ?? '')),
        'rating' => $rating,
        'totalReviews' => $totalReviews,
        'items' => array_values($reviews['items']),
    ],
];

if (!creotopi_save_json_file(CREOTOPI_CONTENT_FILE, $next)) {
    creotopi_json(['error' => 'Could not save content. Check folder permissions.'], 500);
}

creotopi_json(['saved' => true]);
