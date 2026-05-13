<?php
// api-ai-mail-reply.php - Lager svarforslag
session_start();
header('Content-Type: application/json');
require_once 'config.php'; // Henter API nøkkel

$input = json_decode(file_get_contents('php://input'), true);
$emailBody = $input['body'] ?? '';
$tone = $input['tone'] ?? 'Profesjonell og hyggelig';

$prompt = "Du er min personlige assistent, Zenith. 
Jeg har mottatt denne e-posten: 
\"$emailBody\"

Skriv et svarutkast for meg. 
TONE: $tone.
SPRÅK: Norsk (eller engelsk hvis e-posten er engelsk).
MÅL: Vær hjelpsom, kortfattet og inviter til dialog.
Signer med 'Freddy Bremseth, Pinoso Eco Life'.";

// (Kjør standard Gemini-kall her - samme kode som i de andre api-filene dine)
// ... Returner JSON ['reply' => 'Hei, takk for ...']
// For enkelhets skyld i dette svaret antar jeg at du kopierer curl-koden fra api-ai-seo.php hit.
echo json_encode(['success'=>true, 'reply'=>"Hei,\n\nTakk for din henvendelse...\n\nMvh Freddy"]); 
?>