<?php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo "Kun admin kan kjøre RealtyFlow-synk.";
    exit;
}

require_once __DIR__ . '/database/Database.php';

$config = require __DIR__ . '/config.php';
$endpoint = $config['realtyflow_properties_endpoint'] ?? '';

if (!$endpoint || !function_exists('curl_init')) {
    http_response_code(500);
    echo "RealtyFlow-endepunkt eller cURL mangler.";
    exit;
}

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);
$raw = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error || $status >= 400) {
    http_response_code(502);
    echo "Kunne ikke hente boliger fra RealtyFlow. HTTP $status $error";
    exit;
}

$items = json_decode($raw, true);
if (!is_array($items)) {
    http_response_code(500);
    echo "Uventet svar fra RealtyFlow.";
    exit;
}

$db = new Database();
$conn = $db->getConnection();

function ensurePropertyColumn($conn, $column, $definition) {
    $safeColumn = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM properties LIKE '$safeColumn'");
    if ($result && $result->num_rows === 0) {
        $conn->query("ALTER TABLE properties ADD COLUMN $column $definition");
    }
}

ensurePropertyColumn($conn, 'images_json', 'LONGTEXT NULL');
ensurePropertyColumn($conn, 'region', 'VARCHAR(255) NULL');
ensurePropertyColumn($conn, 'last_imported_at', 'DATETIME NULL');
ensurePropertyColumn($conn, 'source_feed', 'VARCHAR(80) NULL');

$inserted = 0;
$updated = 0;
$skipped = 0;

foreach ($items as $item) {
    if (!is_array($item)) {
        $skipped++;
        continue;
    }

    $ref = (string)($item['ref'] ?? $item['external_id'] ?? $item['id'] ?? '');
    if ($ref === '') {
        $skipped++;
        continue;
    }

    $title = (string)($item['title_no'] ?? $item['title'] ?? $item['title_en'] ?? 'Nybygg i Spania');
    $description = (string)($item['description_no'] ?? $item['description'] ?? $item['description_en'] ?? '');
    $price = (int)round((float)($item['price'] ?? 0));
    $location = (string)($item['location'] ?? $item['town'] ?? '');
    $type = (string)($item['property_type'] ?? $item['type'] ?? 'Villa');
    $bedrooms = (int)($item['bedrooms'] ?? 0);
    $bathrooms = (int)($item['bathrooms'] ?? 0);
    $area = (int)round((float)($item['built_area'] ?? $item['area'] ?? 0));
    $region = (string)($item['region'] ?? '');
    $image = (string)($item['primary_image'] ?? $item['image_path'] ?? '');
    $gallery = $item['gallery'] ?? $item['images_json'] ?? [];
    $imagesJson = is_string($gallery) ? $gallery : json_encode(array_values(array_filter((array)$gallery)));

    $check = $conn->prepare("SELECT id FROM properties WHERE external_id = ? LIMIT 1");
    $check->bind_param("s", $ref);
    $check->execute();
    $existing = $check->get_result()->fetch_assoc();

    if ($existing) {
        $stmt = $conn->prepare("
            UPDATE properties
            SET title=?, price=?, location=?, type=?, bedrooms=?, bathrooms=?, area=?, description=?, region=?, image_path=?, images_json=?, last_imported_at=NOW(), source_feed='RealtyFlow'
            WHERE id=?
        ");
        $stmt->bind_param("sissiiissssi", $title, $price, $location, $type, $bedrooms, $bathrooms, $area, $description, $region, $image, $imagesJson, $existing['id']);
        $stmt->execute();
        $updated++;
    } else {
        $stmt = $conn->prepare("
            INSERT INTO properties (external_id, title, price, location, type, bedrooms, bathrooms, area, description, region, image_path, images_json, created_at, last_imported_at, source_feed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'RealtyFlow')
        ");
        $stmt->bind_param("ssissiiissss", $ref, $title, $price, $location, $type, $bedrooms, $bathrooms, $area, $description, $region, $image, $imagesJson);
        $stmt->execute();
        $inserted++;
    }
}

header('Content-Type: text/plain; charset=utf-8');
echo "RealtyFlow-synk ferdig\n";
echo "Nye boliger: $inserted\n";
echo "Oppdaterte boliger: $updated\n";
echo "Hoppet over: $skipped\n";
