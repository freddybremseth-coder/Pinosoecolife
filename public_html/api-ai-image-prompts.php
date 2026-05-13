<?php
// api-ai-image-prompts.php - Genererer 5 bilde-prompts basert på artikkelinnhold
session_start();
header('Content-Type: application/json');
set_time_limit(120);

if (!isset($_SESSION['admin_logged_in'])) { echo json_encode(['success'=>false, 'error'=>'Ikke logget inn']); exit; }

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $input = json_decode(file_get_contents('php://input'), true);
    // Vi kan enten ta imot en ID (hvis lagret) eller råtekst (hvis du skriver nå)
    $title = $input['title'] ?? '';
    $content = $input['content'] ?? '';

    if (empty($content)) throw new Exception("Mangler innhold å analysere.");

    // PROMPT TIL AI
    $systemPrompt = "
    Du er en ekspert på 'Prompt Engineering' for AI-bildegenerering (Stable Diffusion, Midjourney, Nano Banana).
    
    OPPGAVE:
    Les følgende artikkeltekst (som er på norsk).
    Forstå essensen, stemningen og hovedmotivet.
    Lag 5 FORSKJELLIGE bilde-prompts på ENGELSK som passer til denne artikkelen.
    
    ARTIKKEL TITTEL: $title
    ARTIKKEL INNHOLD (Utdrag): " . substr($content, 0, 3000) . "
    
    KRAV TIL PROMPTS:
    1. Alle prompts må være på ENGELSK.
    2. Lag 5 varianter med ulik stil:
       - Variant 1: Photorealistic / High-end Real Estate Photography (Lys, luksus, vidvinkel).
       - Variant 2: Cinematic / Golden Hour (Varmt lys, stemningsfullt, dybdeskarphet).
       - Variant 3: Modern / Architectural Digest Style (Interiørfokus, rene linjer).
       - Variant 4: Lifestyle / Candid (Folk som nyter livet, uskarp bakgrunn).
       - Variant 5: Artistic / Conceptual (Litt mer abstrakt eller kunstnerisk tolkning).
    
    RETURNER KUN JSON PÅ DETTE FORMATET:
    [
        {\"style\": \"Photorealistic\", \"prompt\": \"Modern luxury villa in Spain...\"},
        {\"style\": \"Cinematic\", \"prompt\": \"...\"},
        ...
    ]
    ";

    $ch = curl_init('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . $apiKey);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["contents" => [["parts" => [["text" => $systemPrompt]]]]]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) throw new Exception("AI Feil: Kode $httpCode");
    
    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Vask JSON (Fjern markdown)
    $cleanText = preg_replace('/^```json|```$/m', '', trim($rawText));
    $prompts = json_decode($cleanText, true);

    if (!$prompts) throw new Exception("Klarte ikke tolke AI-svaret. Rådata: $rawText");

    echo json_encode(['success' => true, 'prompts' => $prompts]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>