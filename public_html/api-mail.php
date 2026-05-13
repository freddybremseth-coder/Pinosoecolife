<?php
// api-mail.php - Henter e-post via IMAP og kjører AI-analyse

session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['admin_logged_in'])) exit;

require_once 'database/Database.php';
$db = new Database(); $conn = $db->getConnection();

// Hjelpefunksjon for Innstillinger
function getSet($k, $c) { $r=$c->query("SELECT setting_value FROM settings WHERE setting_key='$k'"); return $r->fetch_row()[0]??''; }
$host = getSet('mail_host', $conn);
$user = getSet('mail_user', $conn);
$pass = getSet('mail_pass', $conn);

if(empty($user) || empty($pass)) { echo json_encode(['error'=>'Mangler e-post innstillinger']); exit; }

$mbox = @imap_open("{{$host}:993/imap/ssl}INBOX", $user, $pass);
if(!$mbox) { echo json_encode(['error'=>'Kunne ikke koble til e-post: ' . imap_last_error()]); exit; }

// --- AI ANALYSE MOCK ---
// Ekte implementasjon må inkludere et kall til Gemini/AI API
function runAiAnalysis($subject, $body) {
    // Dette er en MOCK for å teste UI. Erstatt med ekte API-kall.
    $category = 'Info';
    if (strpos(strtolower($subject), 'bud') !== false || strpos(strtolower($body), 'deal') !== false) {
        $category = 'Deal';
    } elseif (rand(0, 100) > 70) {
        $category = 'Oppfølging';
    }
    return ['category' => $category, 'priority' => (rand(0, 10) > 8 ? 'High' : 'Low')];
}
// --- SLUTT AI ANALYSE MOCK ---

$emails = [];
$mc = imap_check($mbox);
$result = imap_fetch_overview($mbox, "1:{$mc->Nmsgs}", 0);

$limit = 20; // Øk grensen for mer data å leke med
$count = 0;

foreach(array_reverse($result) as $overview) {
    if($count++ >= $limit) break;
    
    $structure = imap_fetchstructure($mbox, $overview->msgno);
    $msgBody = imap_fetchbody($mbox, $overview->msgno, 1);
    
    // Robust dekoding
    if (isset($structure->parts[0]) && $structure->parts[0]->encoding == 3) { // Base64
        $msgBody = base64_decode($msgBody);
    } elseif (isset($structure->parts[0]) && $structure->parts[0]->encoding == 4) { // Quoted-Printable
        $msgBody = quoted_printable_decode($msgBody);
    }
    
    // Strip tags og fjerne linjeskift for ren tekst
    $cleanBody = strip_tags($msgBody);
    
    $ai_data = runAiAnalysis($overview->subject, $cleanBody);
    
    $emails[] = [
        'id' => $overview->msgno,
        'subject' => $overview->subject ?? '(Ingen emne)',
        'from' => $overview->from,
        'date' => $overview->date,
        'seen' => $overview->seen, // 0 for ulest, 1 for lest
        'body' => $cleanBody, // Full body for AI-analyse i frontend
        'preview' => mb_strimwidth($cleanBody, 0, 80, '...'), // Kortere forhåndsvisning
        'category' => $ai_data['category'],
        'priority' => $ai_data['priority']
    ];
}
imap_close($mbox);

echo json_encode(['success'=>true, 'emails'=>$emails]);
?>