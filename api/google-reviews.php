<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$content = creotopi_read_json_file(CREOTOPI_CONTENT_FILE);
$reviewSettings = $content['googleReviews'] ?? [];
$placeId = trim((string) ($reviewSettings['placeId'] ?? ''));
$apiKey = defined('CREOTOPI_GOOGLE_API_KEY') ? trim((string) CREOTOPI_GOOGLE_API_KEY) : '';

if ($placeId === '' || !preg_match('/^[A-Za-z0-9_-]{10,255}$/', $placeId)) {
    creotopi_json(['error' => 'Add a valid Google Place ID in the admin.'], 400);
}
if ($apiKey === '' || str_contains($apiKey, 'REPLACE_')) {
    creotopi_json(['error' => 'Google Places API is not configured on the server.'], 503);
}

$cachePath = CREOTOPI_STORAGE . '/google-reviews-cache.json';
$cached = creotopi_read_json_file($cachePath);
if ($cached
    && ($cached['placeId'] ?? '') === $placeId
    && (int) ($cached['expiresAt'] ?? 0) > time()
    && is_array($cached['payload'] ?? null)) {
    creotopi_json($cached['payload']);
}

$endpoint = 'https://places.googleapis.com/v1/places/' . rawurlencode($placeId);
$headers = [
    'Accept: application/json',
    'X-Goog-Api-Key: ' . $apiKey,
    'X-Goog-FieldMask: displayName,rating,userRatingCount,reviews',
];
$responseBody = false;
$statusCode = 0;

if (function_exists('curl_init')) {
    $curl = curl_init($endpoint);
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
    ]);
    $responseBody = curl_exec($curl);
    $statusCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);
} else {
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers),
            'timeout' => 12,
            'ignore_errors' => true,
        ],
    ]);
    $responseBody = @file_get_contents($endpoint, false, $context);
    foreach ($http_response_header ?? [] as $header) {
        if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $header, $matches)) {
            $statusCode = (int) $matches[1];
        }
    }
}

$googleData = is_string($responseBody) ? json_decode($responseBody, true) : null;
if ($statusCode < 200 || $statusCode >= 300 || !is_array($googleData)) {
    if ($cached && ($cached['placeId'] ?? '') === $placeId && is_array($cached['payload'] ?? null)) {
        creotopi_json($cached['payload']);
    }
    error_log('Google Places request failed with HTTP status ' . $statusCode . '.');
    creotopi_json(['error' => 'Google could not load reviews. Check the Place ID, API key, and Places API billing.'], 502);
}

$items = [];
foreach (array_slice($googleData['reviews'] ?? [], 0, 5) as $review) {
    if (!is_array($review)) {
        continue;
    }
    $author = trim((string) ($review['authorAttribution']['displayName'] ?? ''));
    $text = trim((string) ($review['text']['text'] ?? ''));
    if ($author === '' || $text === '') {
        continue;
    }
    $items[] = [
        'author' => $author,
        'role' => 'Google review',
        'avatar' => (string) ($review['authorAttribution']['photoUri'] ?? ''),
        'rating' => (int) ($review['rating'] ?? 5),
        'time' => (string) ($review['relativePublishTimeDescription'] ?? 'Recently'),
        'text' => $text,
    ];
}

$payload = [
    'source' => 'google',
    'rating' => (float) ($googleData['rating'] ?? $reviewSettings['rating'] ?? 0),
    'totalReviews' => (int) ($googleData['userRatingCount'] ?? $reviewSettings['totalReviews'] ?? 0),
    'items' => $items,
];
$cache = [
    'placeId' => $placeId,
    'expiresAt' => time() + 3600,
    'payload' => $payload,
];
creotopi_save_json_file($cachePath, $cache);

creotopi_json($payload);
