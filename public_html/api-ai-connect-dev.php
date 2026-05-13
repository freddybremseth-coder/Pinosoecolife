<?php
// api-ai-connect-dev.php - Smart AI som kobler Ref/Beskrivelse til Utbygger
session_start();
header('Content-Type: application/json');

// Øk tidsgrense og minne for tunge AI-jobber
set_time_limit(120); 
ini_set('memory_limit', '256M');

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['success' => false, 'error' => 'Ikke autorisert']); exit;
}

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $db = new Database();
    $conn = $db->getConnection();

    // 1. Hent ALLE utbyggere fra databasen (Listen din)
    $devs = [];
    $res = $conn->query("SELECT id, name FROM developers");
    while($row = $res->fetch_assoc()) {
        $devs[] = $row['name'] . " (ID: " . $row['id'] . ")";
    }
    // Gjør listen om til en tekstblokk for AI
    $devListString = implode(", ", $devs);

    // 2. Hent 15 boliger som MANGLER utbygger (developer_id er 0 eller NULL)
    $props = [];
    $sql = "SELECT id, title, description, external_id, type, location FROM properties WHERE developer_id IS NULL OR developer_id = 0 LIMIT 15";
    $res = $conn->query($sql);
    
    while($row = $res->fetch_assoc()) {
        // Vi sender kun de første 400 tegnene av beskrivelsen for å spare AI-kapasitet
        $shortDesc = substr(strip_tags($row['description']), 0, 400);
        $props[] = [
            'property_id' => $row['id'],
            'info' => "REF: {$row['external_id']} | TITLE: {$row['title']} | LOC: {$row['location']} | DESC: {$shortDesc}"
        ];
    }

    if (empty($props)) {
        echo json_encode(['success' => true, 'message' => 'Fant ingen ukoblede boliger! Godt jobbet.', 'updated_count' => 0]);
        exit;
    }

    // 3. Bygg Prompten til Gemini
    $propsJson = json_encode($props);
    
    $prompt = "
    Du er en eiendoms-detektiv. Din oppgave er å koble boliger til riktig Utbygger.
    
    HER ER LISTEN OVER KJENTE UTBYGGERE (Navn og ID):
    [$devListString]
    
    HER ER BOLIGENE SOM TRENGER KOBLING:
    $propsJson
    
    INSTRUKSER:
    1. Les 'DESC' (beskrivelsen) og 'TITLE' nøye. Se etter utbyggernavn (f.eks 'TM', 'Aedas', 'Orbesol', 'Euromarina').
    2. Hvis du finner en match i Utbygger-listen, koble dem sammen.
    3. Hvis du ser referanser som ligner (f.eks 'Residencial Greta' som du vet tilhører en utbygger), koble dem.
    4. Hvis du er VELDIG usikker, ikke gjett (la være å ta med i svaret).
    
    RETURNER KUN JSON PÅ DETTE FORMATET (Array av matcher):
    [
        {\"property_id\": 123, \"developer_id\": 45, \"reason\": \"Fant navnet i teksten\"},
        ...
    ]
    ";

    // 4. Kall AI API
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

    if ($httpCode !== 200) throw new Exception("AI Error: $response");

    $jsonResponse = json_decode($response, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Rens markdown (```json ... ```)
    $cleanedText = preg_replace('/^```json|```$/m', '', trim($rawText));
    $matches = json_decode($cleanedText, true);
    
    // 5. Oppdater Databasen
    $updated = 0;
    if (is_array($matches)) {
        foreach ($matches as $match) {
            $devId = (int)($match['developer_id'] ?? 0);
            $propId = (int)($match['property_id'] ?? 0);
            
            if ($devId > 0 && $propId > 0) {
                // Oppdater properties-tabellen med developer_id
                $conn->query("UPDATE properties SET developer_id = $devId WHERE id = $propId");
                $updated++;
            }
        }
    }

    echo json_encode([
        'success' => true, 
        'message' => "AI analyserte " . count($props) . " boliger og koblet $updated av dem til utbyggere.", 
        'updated_count' => $updated,
        'debug_matches' => $matches // For debugging hvis du vil se hva den fant
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>