<?php
// api-messages.php - Håndterer meldinger og varslinger
session_start();
header('Content-Type: application/json');
require_once 'database/Database.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

// 1. HENT MELDINGER (Brukes av både Admin og Kunde)
if ($action === 'get_messages') {
    $clientId = (int)$_GET['client_id'];
    
    // Hvis det er ADMIN som henter meldinger, marker kundens meldinger som LEST
    if (isset($_SESSION['admin_logged_in'])) {
        $conn->query("UPDATE client_messages SET is_read = 1 WHERE client_id = $clientId AND sender_type = 'client'");
    }

    $stmt = $conn->prepare("SELECT * FROM client_messages WHERE client_id = ? ORDER BY created_at ASC");
    $stmt->bind_param("i", $clientId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $msgs = [];
    while ($row = $result->fetch_assoc()) {
        $msgs[] = $row;
    }
    echo json_encode(['success' => true, 'messages' => $msgs]);
    exit;
}

// 2. SEND MELDING FRA KUNDE
if ($action === 'send_client') {
    // Sjekk login
    if (!isset($_SESSION['client_logged_in'])) { echo json_encode(['error' => 'Logg inn']); exit; }
    
    $cid = $_SESSION['client_id'];
    $msg = $input['message'];
    
    // is_read = 0 betyr ULEST for admin
    $stmt = $conn->prepare("INSERT INTO client_messages (client_id, message, sender_type, is_read) VALUES (?, ?, 'client', 0)");
    $stmt->bind_param("is", $cid, $msg);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

// 3. SEND MELDING FRA ADMIN (Svar)
if ($action === 'send_admin' || $action === 'send_reply') {
    if (!isset($_SESSION['admin_logged_in'])) { echo json_encode(['error' => 'Auth required']); exit; }
    
    $cid = $input['client_id'];
    $msg = $input['message'];
    
    // Lagre i database
    $stmt = $conn->prepare("INSERT INTO client_messages (client_id, message, sender_type, is_read) VALUES (?, ?, 'admin', 1)");
    $stmt->bind_param("is", $cid, $msg);
    $stmt->execute();

    // Send E-post varsel til kunden (valgfritt, men lurt)
    $cRes = $conn->query("SELECT email, name FROM crm_contacts WHERE id = $cid");
    $client = $cRes->fetch_assoc();
    if ($client && !empty($client['email'])) {
        $headers = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: Pinoso Eco Life <post@pinosoecolife.com>";
        $html = "<h3>Hei {$client['name']}</h3><p>Du har fått et svar fra din rådgiver:</p><p><i>" . htmlspecialchars($msg) . "</i></p><p><a href='https://pinosoecolife.com/client-login.php'>Gå til Min Side</a></p>";
        mail($client['email'], "Ny melding fra Pinoso Eco Life", $html, $headers);
    }

    echo json_encode(['success' => true]);
    exit;
}

// 4. SJEKK VARSLINGER (Denne manglet hos deg!)
if ($action === 'check_notifications') {
    if (!isset($_SESSION['admin_logged_in'])) exit;
    
    // Tell antall meldinger fra 'client' som IKKE er lest (is_read = 0)
    $res = $conn->query("SELECT COUNT(*) as unread FROM client_messages WHERE sender_type = 'client' AND is_read = 0");
    $row = $res->fetch_assoc();
    
    echo json_encode(['unread_count' => (int)$row['unread']]);
    exit;
}
?>