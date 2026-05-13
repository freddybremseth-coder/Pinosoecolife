<?php
// api-ai-scrape-article.php - Henter innhold fra URL og strukturerer med AI
session_start();
header('Content-Type: application/json');

// Øk tid/minne
set_time_limit(120);
ini_set('memory_limit', '256M');

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Ikke autorisert']); exit;
}

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $input = json_decode(file_get_contents('php://input'), true);
    $url = $input['url'] ?? '';

    if (!filter_var($url, FILTER_VALIDATE_URL)) throw new Exception("Ugyldig URL");

    // 1. Hent HTML fra URL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (ZenEcoBot)');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $html = curl_exec($ch);
    curl_close($ch);

    if (!$html) throw new Exception("Kunne ikke lese nettsiden.");

    // Rens HTML for å spare tokens (fjerner script, style, svg)
    $cleanHtml = preg_replace('/<(script|style|svg)[^>]*>.*?<\/\1>/si', '', $html);
    $cleanHtml = strip_tags($cleanHtml, '<h1><h2><h3><p><img><div><article>'); // Behold kun viktig struktur
    $cleanHtml = substr($cleanHtml, 0, 30000); // Begrens lengden for AI

    // 2. Send til AI
    $prompt = "
    Du er en innholds-ekspert. Jeg gir deg HTML-koden fra en bloggpost.
    Din oppgave er å trekke ut selve artikkelen og ignorere menyer, footere og reklame.
    
    HTML KODE:
    $cleanHtml
    
    RETURNER KUN JSON med følgende format:
    {
        \"title\": \"Artikkelens overskrift\",
        \"meta_description\": \"En kort, fengende oppsummering (maks 150 tegn)\",
        \"content\": \"Artikkelteksten formatert med Markdown (bruk ## for overskrifter, avsnitt osv). Ikke ta med datoer eller forfatternavn.\",
        \"image_url\": \"URL til hovedbildet/toppbildet i artikkelen (hvis du finner det)\"
    }";

    $apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . trim($apiKey);
    $postData = ["contents" => [["parts" => [["text" => $prompt]]]]];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) throw new Exception("AI Error");

    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $cleanedText = preg_replace('/^```json|```$/m', '', trim($rawText));
    $aiData = json_decode($cleanedText, true);

    if (!$aiData) throw new Exception("Klarte ikke tolke AI-data.");

    // 3. Lagre i Database
    $db = new Database();
    $conn = $db->getConnection();

    // Konverter markdown content til JSON-struktur for din database
    // (Vi jukser litt og legger alt i en tekstblokk for enkelhets skyld nå)
    $contentJson = json_encode([
        ['type' => 'text', 'content' => $aiData['content']]
    ]);

    $stmt = $conn->prepare("INSERT INTO articles (title, meta_description, content_json, image_path_1, category, is_published, created_at) VALUES (?, ?, ?, ?, 'Inspirasjon', 1, NOW())");
    
    // NB: Bildet lagres som en ekstern URL. 
    // For optimal ytelse burde vi lastet det ned, men dette fungerer umiddelbart.
    $stmt->bind_param("ssss", $aiData['title'], $aiData['meta_description'], $contentJson, $aiData['image_url']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => "Importert: " . $aiData['title']]);
    } else {
        throw new Exception("Databasefeil: " . $stmt->error);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>