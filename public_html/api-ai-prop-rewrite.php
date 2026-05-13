<?php
// api-ai-prop-rewrite.php - Skriver om boligannonser med HTML og NORSKE skriveregler
session_start();
header('Content-Type: application/json');
set_time_limit(180); 

if (!isset($_SESSION['admin_logged_in'])) { echo json_encode(['success'=>false, 'error'=>'Ikke logget inn']); exit; }

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $input = json_decode(file_get_contents('php://input'), true);
    $propId = $input['id'] ?? 0;

    if (!$propId) throw new Exception("Mangler ID");

    // 1. Hent data
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT * FROM properties WHERE id = ?");
    $stmt->bind_param("i", $propId);
    $stmt->execute();
    $p = $stmt->get_result()->fetch_assoc();
    if (!$p) throw new Exception("Bolig ikke funnet");
    
    $conn->close(); 

    // 2. AI Prompt
    $info = "Type: {$p['type']}. Sted: {$p['location']} ({$p['region']}). 
             Pris: €{$p['price']}. Soverom: {$p['bedrooms']}. Bad: {$p['bathrooms']}. 
             Areal: {$p['area']}m2. Tomt: {$p['plot_size']}m2. 
             Nåværende beskrivelse: " . strip_tags($p['description']);

    $prompt = "
    DU ER: En norsk eiendomsmegler og tekstforfatter i verdensklasse med 26 års erfaring fra luksusmarkedet på Costa Blanca. 
    Du er kjent for å skrive tekster som selger en livsstil, ikke bare murstein.
    
    MÅLGRUPPE: Nordmenn som drømmer om det gode liv i Spania.
    
    OPPGAVE: Skriv en ny, uimotståelig salgstekst for denne boligen.
    
    DATA OM BOLIGEN:
    $info
    
    RETNINGSLINJER FOR TEKSTEN:
    1. **OVERSKRIFT:** Må være 'click-bait' men sannferdig. Bruk emosjonelle ord.
    2. **INNLEDNING:** Start med en følelse eller en scene. Dra leseren inn umiddelbart.
    3. **BRØDTEKST:** - Bruk 'Storytelling'. 
       - Flett fakta inn i historien ('Med tre soverom er det plass til...').
       - Bruk sanseord (duften av sitrus, varmen fra solen).
    4. **FORMATERING:** - Bruk KUN HTML-tags (<h3>, <p>, <strong>, <ul>, <li>).
       - IKKE bruk Markdown (###, **).
    5. **GRAMMATIKK OG RETTSKRIVING (VIKTIG!):**
       - Følg norske skriveregler strengt.
       - Bruk stor bokstav KUN i starten av setninger og ved egennavn (f.eks. 'Spania', 'Alicante').
       - Ord som 'villa', 'terrasse', 'basseng', 'leilighet', 'kjøkken' skal skrives med LITEN bokstav inne i setninger.
       - I overskrifter: Bruk kun stor bokstav på første ord (ikke 'Title Case' som på engelsk).
    
    RETURNER KUN JSON:
    {
        \"title\": \"Den nye overskriften (kun stor forbokstav)\",
        \"description\": \"Hele den nye salgsteksten formattert med HTML-tags\"
    }
    ";

    // 3. Kall AI
    $ch = curl_init('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . $apiKey);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["contents" => [["parts" => [["text" => $prompt]]]]]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) throw new Exception("AI feilet (Kode: $httpCode)");

    $jsonResponse = json_decode($res, true);
    $rawText = $jsonResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';

    // 4. Kirurgisk JSON-uttrekk
    $start = strpos($rawText, '{');
    $end = strrpos($rawText, '}');
    
    if ($start !== false && $end !== false) {
        $jsonString = substr($rawText, $start, $end - $start + 1);
        $aiData = json_decode($jsonString, true);
    } else {
        $aiData = null;
    }

    if (!$aiData) {
        // Fallback
        $cleanText = preg_replace('/^```json|```$/m', '', trim($rawText));
        $aiData = json_decode($cleanText, true);
        if (!$aiData) throw new Exception("Klarte ikke tolke AI-svaret.");
    }

    // 5. Reconnect Database & Lagre
    $db = new Database();
    $conn = $db->getConnection();
    if (!$conn->ping()) $conn = $db->getConnection();

    $stmt = $conn->prepare("UPDATE properties SET title = ?, description = ? WHERE id = ?");
    $stmt->bind_param("ssi", $aiData['title'], $aiData['description'], $propId);
    
    if($stmt->execute()) {
        echo json_encode(['success' => true, 'title' => $aiData['title'], 'id' => $propId]);
    } else {
        throw new Exception("Databasefeil: " . $stmt->error);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage(), 'id' => $propId]);
}
?>