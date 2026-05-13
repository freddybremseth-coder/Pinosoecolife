<?php
// api-ai-seo.php - Analyserer og forbedrer artikler for Google (SEO)
session_start();
header('Content-Type: application/json');
set_time_limit(180); // Gi AI tid til å tenke

if (!isset($_SESSION['admin_logged_in'])) { echo json_encode(['success'=>false, 'error'=>'Ikke logget inn']); exit; }

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $input = json_decode(file_get_contents('php://input'), true);
    $title = $input['title'] ?? '';
    $content = $input['content'] ?? '';

    if (empty($title) || empty($content)) throw new Exception("Mangler innhold å analysere.");

    // PROMPT TIL AI (SEO EKSPERT)
    $prompt = "
    Du er en verdensledende SEO-ekspert og tekstforfatter for eiendomsbransjen i Spania.
    Oppgave: Analyser og optimaliser følgende artikkel for Google (E-E-A-T prinsipper).
    
    TITTEL: $title
    INNHOLD: $content
    
    Gjør følgende:
    1. Forbedre TITTELEN (gjør den klikkvennlig og inkluder nøkkelord).
    2. Skriv en optimal META-BESKRIVELSE (maks 160 tegn).
    3. Forbedre INNHOLDET: 
       - Bruk Markdown.
       - Gjør språket mer selgende og tillitvekkende.
       - Del opp lange avsnitt.
       - Legg til relevante H2 (##) og H3 (###) overskrifter.
       - Sørg for at 'bolig i Spania', 'Costa Blanca' og 'investering' flettes naturlig inn der det passer.
    
    RETURNER KUN JSON:
    {
        \"title\": \"Ny optimalisert tittel\",
        \"meta\": \"Ny meta beskrivelse\",
        \"content\": \"Hele den nye teksten i Markdown format...\",
        \"changes\": \"Kort liste over hva du forbedret (f.eks: 'Bedre overskrift, rettet skrivefeil, la til nøkkelord')\"
    }
    ";

    $ch = curl_init('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . $apiKey);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["contents" => [["parts" => [["text" => $prompt]]]]]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($httpCode !== 200) throw new Exception("AI Feil: " . $response);
    
    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Vask JSON
    $cleanText = preg_replace('/^```json|```$/m', '', trim($rawText));
    $aiData = json_decode($cleanText, true);

    if (!$aiData) throw new Exception("Klarte ikke tolke AI-svaret.");

    echo json_encode(['success' => true, 'data' => $aiData]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>