<?php
// automator.php - Markedsføringsroboten
require_once 'database/Database.php';
$db = new Database();
$conn = $db->getConnection();

echo "<h2>Kjører Zen Eco Automator...</h2>";

// 1. Send e-post til leads som er eldre enn 3 dager og status = 'new'
$res = $conn->query("SELECT * FROM crm_contacts WHERE status='new' AND created_at < DATE_SUB(NOW(), INTERVAL 3 DAY) AND (last_interaction IS NULL OR last_interaction < DATE_SUB(NOW(), INTERVAL 3 DAY)) LIMIT 5");

while($lead = $res->fetch_assoc()) {
    $to = $lead['email'];
    $subject = "Drømmen om Costa Blanca";
    $msg = "Hei {$lead['name']},\n\nHar du sett våre nyeste villaer i Altea? Det har kommet inn flere spennende prosjekter denne uken.\n\nSe mer på pinosoecolife.com\n\nMvh,\nTeam Zen Eco";
    $headers = "From: post@pinosoecolife.com";
    
    mail($to, $subject, $msg, $headers);
    
    // Oppdater for å unngå spam
    $conn->query("UPDATE crm_contacts SET last_interaction = NOW() WHERE id = " . $lead['id']);
    echo "Sendt e-post til: $to <br>";
}

echo "Ferdig.";
?>