<?php
if (session_status() === PHP_SESSION_NONE) { session_start(); }
?>
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pinoso Eco Life | Din partner i Spania</title>
    <meta name="description" content="Trygg bolighandel i Spania. Vi hjelper deg med moderne boliger, store tomter og kjøpsprosessen i Pinoso-regionen.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

<header class="zen-header">
    <a href="index.php" class="logo">Pinoso<span>Eco</span>Life</a>
    
    <nav class="nav-links">
        <a href="eiendommer.php">Boliger</a>
        <a href="tomter.php">Tomter</a>
        <a href="areas.php">Områder</a>
        <a href="buying-process.php">Kjøpsprosessen</a>
        <a href="blog.php">Magasin</a>
        <a href="index.php#kontakt">Kontakt</a>
        <?php if(isset($_SESSION['client_logged_in'])): ?>
            <a href="client-portal.php" style="color:var(--zen-gold);"><i class="fas fa-user"></i> Min Side</a>
        <?php else: ?>
            <a href="client-login.php" class="btn-outline" style="padding: 8px 20px; font-size: 12px;">Logg inn</a>
        <?php endif; ?>
    </nav>
</header>
