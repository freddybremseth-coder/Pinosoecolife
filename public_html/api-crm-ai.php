<?php
// api-crm-ai.php - AI Salgsassistent for Pinoso Eco Life
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
    $leadId = $input['lead_id'] ?? 0;

    $db = new Database();
    $conn = $db->getConnection();

    // 1. Hent kundeinfo
    $stmt = $conn->prepare("SELECT * FROM crm_contacts WHERE id = ?");
    $stmt->bind_param("i", $leadId);
    $stmt->execute();
    $lead = $stmt->get_result()->fetch_assoc();

    if (!$lead) throw new Exception("Kunde ikke funnet.");

    // 2. Finn relevante boliger i databasen (Enkel matching)
    // Vi prøver å finne boliger som matcher budsjett og område
    $budget = (int)preg_replace('/[^0-9]/', '', $lead['budget'] ?? '999999999');
    if ($budget == 0) $budget = 10000000; // Hvis budsjett ikke er satt, vis alt
    
    $area = $lead['preferred_area'] ?? '';
    $beds = (int)($lead['bedrooms_req'] ?? 0);

    // Bygg SQL for å finne kandidater
    $sql = "SELECT id, title, price, location, bedrooms, type FROM properties WHERE price <= $budget";
    if (!empty($area)) $sql .= " AND (location LIKE '%$area%' OR region LIKE '%$area%')";
    if ($beds > 0) $sql .= " AND bedrooms >= $beds";
    $sql .= " LIMIT 10"; // Hent topp 10 kandidater

    $propsResult = $conn->query($sql);
    $properties = [];
    while($p = $propsResult->fetch_assoc()) {
        $properties[] = $p;
    }

    // Hvis ingen treff, hent tilfeldige nyheter (fallback)
    if (empty($properties)) {
        $res = $conn->query("SELECT id, title, price, location, bedrooms, type FROM properties ORDER BY created_at DESC LIMIT 5");
        while($p = $res->fetch_assoc()) $properties[] = $p;
    }

    // 3. Send til AI (Gemini)
    $propsJson = json_encode($properties);
    $leadJson = json_encode($lead);

// ... (koden før er lik) ...

    $systemPrompt = "
    Du er Freddy Bremseth, en erfaren eiendomsrådgiver for Pinoso Eco Life.
    Du skriver personlig, hyggelig og profesjonelt til potensielle boligkjøpere.
    
    KUNDEINFO: $leadJson
    TILGJENGELIGE BOLIGER: $propsJson
    
    OPPGAVE:
    1. Analyser kunden.
    2. Velg ut de 2 beste boligene fra listen over som matcher budsjett og område.
    3. Skriv et utkast til en e-post fra Freddy til kunden.
       - Signatur: Freddy Bremseth, Pinoso Eco Life, +47 96009965.
       - Tone: Hjelpsom, ikke masete. 'Jeg fant disse og tenkte på deg'.

    RETURNER KUN JSON:
    {
        \"analysis\": \"Kort analyse...\",
        \"email_draft\": \"Hei [Navn],\n\nJeg så gjennom ønskene dine... [resten av e-posten]\",
        \"recommended_property_ids\": [1, 2]
    }";

    // ... (resten av koden er lik) ...

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

    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $cleanedText = preg_replace('/^```json|```$/m', '', trim($rawText));
    
    $aiData = json_decode($cleanedText, true);

    echo json_encode(['success' => true, 'data' => $aiData]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>