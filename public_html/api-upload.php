<?php
// api-upload.php - Håndterer opplasting av filer OG lagring av AI-bilder
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['admin_logged_in'])) { 
    echo json_encode(['success' => false, 'error' => 'Ikke logget inn']); exit; 
}

$targetDir = "assets/uploads/";
if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

// 1. HÅNDTER AI-BILDE (URL)
$input = json_decode(file_get_contents('php://input'), true);
if (isset($input['imageUrl'])) {
    $url = $input['imageUrl'];
    $imgData = @file_get_contents($url);
    
    if ($imgData) {
        $fileName = "ai_" . time() . "_" . rand(100,999) . ".jpg";
        $targetFilePath = $targetDir . $fileName;
        if (file_put_contents($targetFilePath, $imgData)) {
            echo json_encode(['success' => true, 'url' => $targetFilePath]);
            exit;
        }
    }
    echo json_encode(['success' => false, 'error' => 'Kunne ikke lagre AI-bildet.']);
    exit;
}

// 2. HÅNDTER VANLIG FILOPPLASTING
if (!empty($_FILES['file']['name'])) {
    $fileName = time() . "_" . basename($_FILES['file']['name']);
    $targetFilePath = $targetDir . $fileName;
    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
    
    if(in_array($fileType, ['jpg','png','jpeg','gif','webp'])){
        if(move_uploaded_file($_FILES['file']['tmp_name'], $targetFilePath)){
            echo json_encode(['success' => true, 'url' => $targetFilePath]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Serverfeil ved lagring.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Kun JPG, PNG, GIF, WEBP.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Ingen data mottatt.']);
}
?>