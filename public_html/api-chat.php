<?php
// api-chat.php - AI Assistenten i Backend
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in'])) {
    echo json_encode(['reply' => 'Vennligst logg inn.']);
    exit;
}

require_once __DIR__ . '/ZenithCore.php';
$config = [];
if (file_exists(__DIR__ . '/config.php')) $config = require __DIR__ . '/config.php';

// Initier Zenith AI
$zenith = new ZenithCore(
    $config['db_host']??'localhost', 
    $config['db_name']??'', 
    $config['db_user']??'', 
    $config['db_pass']??'', 
    $config['gemini_api_key']??''
);

$input = json_decode(file_get_contents('php://input'), true);
$msg = $input['message'] ?? '';
$history = $input['history'] ?? [];

if (empty($msg)) { echo json_encode(['reply' => '...']); exit; }

// Enkel logikk for å sende til Gemini via ZenithCore
// Vi legger til litt system-instruksjoner
$systemPrompt = "Du er Zenith, en hjelpsom AI for Pinoso Eco Life. Svar kort og presist på norsk.";
$fullPrompt = $systemPrompt . "\nBruker sier: " . $msg;

$reply = $zenith->callGemini($fullPrompt);

echo json_encode(['reply' => $reply]);
?>