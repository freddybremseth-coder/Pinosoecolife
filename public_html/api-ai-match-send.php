<?php
// api-ai-match-send.php - Modus: 'preview' (vis antall/liste) eller 'send' (epost)
session_start();
header('Content-Type: application/json');
set_time_limit(180);

if (!isset($_SESSION['admin_logged_in'])) { echo json_encode(['success'=>false, 'error'=>'Ikke autorisert']); exit; }

try {
    require_once __DIR__ . '/database/Database.php';
    $config = require __DIR__ . '/config.php';
    $apiKey = $config['gemini_api_key'] ?? '';
    
    $input = json_decode(file_get_contents('php://input'), true);
    $clientId = $input['client_id'] ?? 0;
    $mode = $input['mode'] ?? 'send'; // 'preview' eller 'send'

    $db = new Database();
    $conn = $db->getConnection();

    // 1. Hent Kunde
    $stmt = $conn->prepare("SELECT * FROM crm_contacts WHERE id = ?");
    $stmt->bind_param("i", $clientId);
    $stmt->execute();
    $client = $stmt->get_result()->fetch_assoc();
    if (!$client) throw new Exception("Kunde ikke funnet");

    // Preferanser
    $budget = (int)preg_replace('/[^0-9]/', '', $client['budget'] ?? '10000000');
    if ($budget < 10000) $budget = 10000000;
    $area = $client['preferred_area'] ?? '';
    $beds = (int)($client['bedrooms_req'] ?? 0);
    $type = $client['property_type_req'] ?? '';

    // 2. SQL Søk
    $sql = "SELECT p.id, p.title, p.price, p.location, p.bedrooms, p.type, p.image_path, p.description 
            FROM properties p
            WHERE p.price <= ? AND p.bedrooms >= ?
            AND p.id NOT IN (SELECT property_id FROM client_matches WHERE client_id = ?)";
    
    if (!empty($area)) $sql .= " AND (p.location LIKE '%$area%' OR p.region LIKE '%$area%')";
    if (!empty($type)) $sql .= " AND p.type LIKE '%$type%'";

    $sql .= " ORDER BY p.created_at DESC LIMIT 5";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $budget, $beds, $clientId);
    $stmt->execute();
    $props = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // --- MODUS: PREVIEW ---
    if ($mode === 'preview') {
        echo json_encode([
            'success' => true, 
            'count' => count($props), 
            'props' => $props // Sender listen tilbake til backend for visning
        ]);
        exit;
    }

    // --- MODUS: SEND (E-post + AI) ---
    if (empty($props)) {
        echo json_encode(['success' => false, 'error' => 'Ingen nye boliger å sende.']);
        exit;
    }

    // AI Teasere
    $propsForAi = [];
    foreach($props as $p) {
        $propsForAi[] = ['id'=>$p['id'], 'title'=>$p['title'], 'desc'=>substr(strip_tags($p['description']),0,200)];
    }
    
    // Forenklet prompt for hastighet
    $prompt = "Skriv en kort teaser (maks 2 setninger) for disse boligene til kunden {$client['name']}. Returner JSON: {\"id\": \"tekst\"}. Boliger: " . json_encode($propsForAi);
    
    // (AI kall kode - forkortet her, men bruk samme som før)
    $ch = curl_init('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' . $apiKey);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["contents" => [["parts" => [["text" => $prompt]]]]]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $aiRes = json_decode(curl_exec($ch), true);
    curl_close($ch);
    $teasers = json_decode(preg_replace('/^```json|```$/m', '', trim($aiRes['candidates'][0]['content']['parts'][0]['text'] ?? '{}')), true);

    // Bygg E-post
    $emailBody = "<html><body style='font-family:sans-serif; color:#333;'><h2>Hei {$client['name']}</h2><p>Her er 5 utvalgte boliger:</p>";
    
    foreach ($props as $p) {
        $teaser = $teasers[$p['id']] ?? "Passer dine kriterier.";
        // SIKRER RIKTIG TITTEL
        $realTitle = htmlspecialchars($p['title']); 
        $link = "https://new.pinosoecolife.com/property.php?id=" . $p['id'];
        
        $emailBody .= "<div style='margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;'>
            <h3><a href='$link'>$realTitle</a></h3>
            <p><strong>Pris:</strong> € " . number_format($p['price'], 0, ',', ' ') . "</p>
            <p><i>$teaser</i></p>
            <a href='$link' style='background:#C5A059; color:white; padding:5px 10px; text-decoration:none;'>Se Bolig</a>
        </div>";

        // Lagre i DB
        $conn->query("INSERT INTO client_matches (client_id, property_id, ai_teaser, is_emailed) VALUES ($clientId, {$p['id']}, '" . $conn->real_escape_string($teaser) . "', 1)");
    }
    
    // Send
    $headers = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: Freddy <freddy@pinosoecolife.com>";
    if(!empty($client['email'])) mail($client['email'], "Dine Boligforslag", $emailBody, $headers);

    echo json_encode(['success' => true, 'count' => count($props)]);

} catch (Exception $e) { echo json_encode(['success' => false, 'error' => $e->getMessage()]); }
?>