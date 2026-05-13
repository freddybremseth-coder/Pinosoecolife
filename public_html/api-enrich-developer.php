<?php
// api-enrich-developer.php - Finner info om utbyggere via AI
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Ikke autorisert']); exit;
}

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $input = json_decode(file_get_contents('php://input'), true);
    $devId = $input['id'] ?? 0;
    $devName = $input['name'] ?? '';

    if (!$devId || !$devName) throw new Exception("Mangler ID eller Navn");

    // 1. Spør AI (Gemini)
    $prompt = "
    Du er en ekspert på det spanske eiendomsmarkedet.
    Finn offentlig tilgjengelig kontaktinfo og firmainformasjon for utbyggeren: '$devName' (Spania).
    
    Returner KUN gyldig JSON med disse feltene (hvis du ikke finner info, la feltet være tomt streng):
    {
        \"website\": \"URL til nettsiden\",
        \"email\": \"E-postadresse (hvis tilgjengelig)\",
        \"phone\": \"Telefonnummer (hvis tilgjengelig)\",
        \"description\": \"Kort beskrivelse av utbyggeren på Norsk. Nevn gjerne hva slags boliger de er kjent for, eller kjente tidligere prosjekter.\"
    }";

    $url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . trim($apiKey);
    $postData = ["contents" => [["parts" => [["text" => $prompt]]]]];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) throw new Exception("AI Error: $httpCode");

    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $cleanedText = preg_replace('/^```json|```$/m', '', trim($rawText)); // Rens markdown
    
    $aiData = json_decode($cleanedText, true);
    if (!$aiData) throw new Exception("Klarte ikke tolke AI-svar");

    // 2. Oppdater Databasen
    $db = new Database();
    $conn = $db->getConnection();

    // Vi oppdaterer KUN felter som er tomme i databasen fra før (for ikke å overskrive dine manuelle data),
    // eller vi kan velge å overskrive alt. Her velger jeg å oppdatere det AI finner.
    
    $sql = "UPDATE developers SET 
            website = COALESCE(NULLIF(website, ''), ?),
            email = COALESCE(NULLIF(email, ''), ?),
            phone = COALESCE(NULLIF(phone, ''), ?),
            description = ?
            WHERE id = ?";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", 
        $aiData['website'], 
        $aiData['email'], 
        $aiData['phone'], 
        $aiData['description'],
        $devId
    );
    $stmt->execute();

    echo json_encode(['success' => true, 'data' => $aiData]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>