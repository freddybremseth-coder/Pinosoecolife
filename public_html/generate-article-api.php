<?php
// generate-article-api.php - Pinoso Eco Life "Expert Engine" (HTML Version)
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Ikke autorisert.']);
    exit;
}

try {
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    if (empty($apiKey)) throw new Exception("Mangler API-nøkkel.");

    $input = json_decode(file_get_contents('php://input'), true);
    $topic = $input['topic'] ?? '';
    $audience = $input['audience'] ?? 'Norske boligkjøpere';
    $style = $input['style'] ?? 'Profesjonell og tillitvekkende';
    $length = $input['length'] ?? 'medium';

    // --- PROMPT MED HTML-INSTRUKSJONER ---
    $systemPrompt = "
    Du er en Senior Eiendomsrådgiver for 'Pinoso Eco Life' på Costa Blanca.
    Skriv en artikkel som oser av kunnskap (E-E-A-T) og skaper tillit.

    MÅLGRUPPE: {$audience}
    TEMA: {$topic}
    TONE: {$style}
    LENGDE: {$length}

    VIKTIGE FORMATERINGSREGLER (STRENGT):
    1.  **IKKE BRUK MARKDOWN:** Du får IKKE lov til å bruke ## for overskrifter eller ** for fet tekst.
    2.  **BRUK HTML:** - Bruk `<h3>` rundt alle mellomoverskrifter (Eks: `<h3>Hvorfor velge Altea?</h3>`).
        - Bruk `<strong>` rundt viktig tekst du vil utheve.
        - Bruk `<p>` rundt alle avsnitt.
        - Bruk `<ul>` og `<li>` hvis du lager lister.
    
    INNHOLDSREGLER:
    1.  Vær direkte og varm. Unngå 'AI-språk' som 'i denne artikkelen skal vi se på'. Gå rett på sak.
    2.  Avslutt med en Call to Action (CTA) som ber leseren kontakte Pinoso Eco Life for en prat.
    
    RETURFORMAT (JSON):
    Returner KUN gyldig JSON:
    {
        \"headline_options\": [\"Overskrift 1\", \"Overskrift 2\"],
        \"meta_description\": \"Kort selgende tekst for Google (under 160 tegn).\",
        \"content_sections\": [
            { \"type\": \"text\", \"content\": \"<p>Innledning her...</p>\" },
            { \"type\": \"image_prompt\", \"prompt\": \"Beskrivelse av bilde...\" },
            { \"type\": \"text\", \"content\": \"<h3>Mellomoverskrift</h3><p>Tekst...</p>\" }
        ]
    }";

    $url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . trim($apiKey);
    $postData = ["contents" => [["parts" => [["text" => $systemPrompt]]]]];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) throw new Exception("API Error ($httpCode)");

    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $cleanedText = preg_replace('/^```json|```$/m', '', trim($rawText));
    $generatedData = json_decode($cleanedText, true);

    if (!$generatedData) throw new Exception("AI data feil. Prøv igjen.");

    // Placeholder bilder
    $keywords = urlencode($topic . ' spain luxury modern');
    $images = [
        "https://source.unsplash.com/800x600/?{$keywords}&sig=1",
        "https://source.unsplash.com/800x600/?{$keywords}&sig=2"
    ];

    echo json_encode(['success' => true, 'generated_data' => $generatedData, 'images' => $images]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>