<?php
/**
 * backend.php - Pinoso Eco Life OS (Delete & Draft Edition)
 */
session_start();
ini_set('display_errors', 1); error_reporting(E_ALL);

// --- 1. SIKKERHET ---
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) { header('Location: login.php'); exit; }
if (isset($_GET['logout'])) { session_destroy(); header('Location: login.php'); exit; }

// --- 2. SYSTEM ---
require_once __DIR__ . '/database/Database.php';
require_once __DIR__ . '/ZenithCore.php';

$db = new Database(); 
$conn = $db->getConnection();
$config = []; if (file_exists(__DIR__ . '/config.php')) $config = require __DIR__ . '/config.php';

$zenith = new ZenithCore($config['db_host']??'localhost', $config['db_name']??'', $config['db_user']??'', $config['db_pass']??'', $config['gemini_api_key']??'');

$tab = $_GET['tab'] ?? 'dashboard';
$msg = $_GET['msg'] ?? '';
$err = $_GET['error'] ?? '';

// --- HJELPEFUNKSJONER ---
function readDocx($filename) {
    if (!class_exists('ZipArchive')) return "FEIL: Serveren mangler ZipArchive for å lese Word-filer. Vennligst lim inn teksten manuelt.";
    $content = '';
    $zip = new ZipArchive;
    if ($zip->open($filename) === TRUE) {
        if (($index = $zip->locateName('word/document.xml')) !== false) {
            $xml = $zip->getFromIndex($index);
            $content = strip_tags(str_replace('</w:p>', "\n\n", $xml));
        }
        $zip->close();
    }
    return $content;
}

// --- 3. POST HANDLERS ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // A. SLETT ARTIKKEL (NY!)
    if (isset($_POST['action']) && $_POST['action'] === 'delete_article') {
        $id = (int)$_POST['id'];
        // Slett artikkelen
        $stmt = $conn->prepare("DELETE FROM articles WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if($stmt->execute()) {
            header("Location: backend.php?tab=articles&msg=Artikkel slettet"); exit;
        } else {
            header("Location: backend.php?tab=articles&error=Kunne ikke slette artikkel"); exit;
        }
    }

    // B. AI OMSKRIVER (GHOSTWRITER)
    if (isset($_POST['action']) && $_POST['action'] === 'rewrite_article_style') {
        $sourceText = $_POST['source_text'] ?? '';
        
        if (!empty($_FILES['source_file']['name'])) {
            $ext = strtolower(pathinfo($_FILES['source_file']['name'], PATHINFO_EXTENSION));
            if ($ext === 'docx') $sourceText = readDocx($_FILES['source_file']['tmp_name']);
            elseif ($ext === 'txt') $sourceText = file_get_contents($_FILES['source_file']['tmp_name']);
        }

        if (strlen($sourceText) < 10) {
            header("Location: backend.php?tab=articles&error=Kunne ikke lese tekst. Lim inn teksten hvis filopplasting feiler."); exit;
        }

        $prompt = "
        Du er en profesjonell tekstforfatter for Pinoso Eco Life (Eiendomsformidling i Spania for Nordmenn).
        Din stil er: Tillitvekkende, varm, kunnskapsrik, og selgende uten å være masete.
        
        VIKTIG OM OVERSKRIFTER PÅ NORSK:
        Bruk kun stor forbokstav i det aller første ordet (og i egennavn). 
        RIKTIG: 'Drømmen om et hus i Spania'
        FEIL: 'Drømmen Om Et Hus I Spania'
        
        OPPGAVE:
        Skriv om følgende tekst fullstendig til din stil.
        Bruk HTML (h2, h3, p).
        
        TEKST:
        " . substr($sourceText, 0, 8000);
        
        $newContent = $zenith->callGemini($prompt);
        
        $title = "Omskrevet: " . substr(strip_tags($sourceText), 0, 20) . "...";
        $stmt = $conn->prepare("INSERT INTO articles (title, content_json, created_at, is_published) VALUES (?, ?, NOW(), 0)");
        $json = json_encode([['type'=>'text', 'content'=>$newContent]]);
        $stmt->execute([$title, $json]);

        header("Location: backend.php?tab=articles&msg=Tekst omskrevet! Ligger nå i listen."); exit;
    }

    // C. GENERER ARTIKKEL (FRA TEMA)
    if (isset($_POST['action']) && $_POST['action'] === 'generate_article_ai') {
        $res = $zenith->draftArticle($_POST['topic'], $_POST['audience']);
        header("Location: backend.php?tab=articles&msg=" . urlencode($res)); exit;
    }

    // D. LAGRE ARTIKKEL (REDIGERING)
    if (isset($_POST['action']) && $_POST['action'] === 'save_article_content') {
        $id = $_POST['id'];
        $title = $_POST['title'];
        $content = $_POST['content'];
        $status = $_POST['status'];
        $isPub = ($status === 'published') ? 1 : 0;
        
        // Håndter bilde
        $imgPath = $_POST['current_image_path'] ?? ''; 
        if (!empty($_FILES['cover_image']['name'])) {
            $target = "assets/" . time() . "_" . basename($_FILES['cover_image']['name']);
            if (!is_dir("assets")) mkdir("assets");
            if (move_uploaded_file($_FILES['cover_image']['tmp_name'], $target)) $imgPath = $target;
        }

        $contentJson = json_encode([['type'=>'text', 'content'=>$content]]);
        $stmt = $conn->prepare("UPDATE articles SET title=?, content_json=?, image_path_1=?, is_published=? WHERE id=?");
        $stmt->bind_param("sssii", $title, $contentJson, $imgPath, $isPub, $id);
        $stmt->execute();
        header("Location: backend.php?tab=articles&msg=Artikkel lagret"); exit;
    }

    // E. LAGRE KUNDE
    if (isset($_POST['action']) && $_POST['action'] === 'save_contact_detailed') {
        $plot = isset($_POST['plot_features']) ? implode(', ', $_POST['plot_features']) : '';
        $area = ($_POST['preferred_area'] === 'Annet') ? $_POST['preferred_area_custom'] : $_POST['preferred_area'];
        $stmt = $conn->prepare("UPDATE crm_contacts SET name=?, email=?, phone=?, preferred_area=?, property_type_req=?, budget=?, bedrooms_req=?, plot_req=?, notes=?, pipeline_stage=?, last_activity=NOW() WHERE id=?");
        $stmt->bind_param("ssssssisssi", $_POST['name'], $_POST['email'], $_POST['phone'], $area, $_POST['property_type'], $_POST['budget'], $_POST['bedrooms'], $plot, $_POST['notes'], $_POST['pipeline_stage'], $_POST['id']);
        $stmt->execute(); header("Location: backend.php?tab=crm&msg=Kunde oppdatert"); exit;
    }
    
    // F. STATUS DRAG & DROP
    if (isset($_POST['action']) && $_POST['action'] === 'update_lead_status_ajax') {
        $stmt = $conn->prepare("UPDATE crm_contacts SET pipeline_stage = ?, last_activity=NOW() WHERE id = ?");
        $stmt->bind_param("si", $_POST['pipeline_stage'], $_POST['id']);
        $stmt->execute(); exit;
    }
    
    // G. EIENDOM
    if (isset($_POST['action']) && $_POST['action'] === 'save_property') {
        $id = $_POST['id'] ?? null; $ref = $_POST['external_id']; $title = $_POST['title']; $price = (int)$_POST['price']; 
        $loc = $_POST['location']; $type = $_POST['type']; $area = (int)$_POST['area']; $desc = $_POST['description'];
        $beds = (int)$_POST['bedrooms']; $baths = (int)$_POST['bathrooms'];
        $imgPath = $_POST['current_image'] ?? '';
        if (!empty($_FILES['image']['name'])) {
            $target = "assets/" . time() . "_" . basename($_FILES['image']['name']); if (!is_dir("assets")) mkdir("assets");
            if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) $imgPath = $target;
        }
        if ($id) { $stmt = $conn->prepare("UPDATE properties SET title=?, external_id=?, price=?, location=?, type=?, area=?, description=?, bedrooms=?, bathrooms=?, image_path=? WHERE id=?"); $stmt->bind_param("ssisssiiisi", $title, $ref, $price, $loc, $type, $area, $desc, $beds, $baths, $imgPath, $id); } 
        else { $stmt = $conn->prepare("INSERT INTO properties (title, external_id, price, location, type, area, description, bedrooms, bathrooms, image_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"); $stmt->bind_param("ssisssiiis", $title, $ref, $price, $loc, $type, $area, $desc, $beds, $baths, $imgPath); }
        $stmt->execute(); header("Location: backend.php?tab=properties&msg=Bolig lagret"); exit;
    }
    
    // H. UTBYGGER
    if (isset($_POST['action']) && $_POST['action'] === 'save_developer') {
        $id = $_POST['id'] ?? null; $name = $_POST['name']; $contact = $_POST['contact_person']; $email = $_POST['email']; $phone = $_POST['phone']; $notes = $_POST['notes'];
        if ($id) { $stmt = $conn->prepare("UPDATE developers SET name=?, contact_person=?, email=?, phone=?, notes=? WHERE id=?"); $stmt->bind_param("sssssi", $name, $contact, $email, $phone, $notes, $id); } 
        else { $stmt = $conn->prepare("INSERT INTO developers (name, contact_person, email, phone, notes) VALUES (?, ?, ?, ?, ?)"); $stmt->bind_param("sssss", $name, $contact, $email, $phone, $notes); }
        $stmt->execute(); header("Location: backend.php?tab=developers&msg=Utbygger lagret"); exit;
    }
}
?>
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <title>Zenith OS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
    <style>
        :root { --primary: #1A2530; --accent: #C5A059; --bg: #f8fafc; --surface: #ffffff; --text: #334155; --border: #e2e8f0; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); margin: 0; display: flex; height: 100vh; overflow: hidden; }
        .sidebar { width: 260px; background: var(--primary); color: white; display: flex; flex-direction: column; padding: 20px 0; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 25px; color: #94a3b8; text-decoration: none; font-weight:500; }
        .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.05); color: white; border-right: 3px solid var(--accent); }
        .badge { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; position: absolute; right: 20px; display: none; font-weight: bold; }
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .top-bar { background: var(--surface); padding: 15px 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .content { flex: 1; padding: 30px; overflow-y: auto; }
        .card { background: var(--surface); border-radius: 12px; border: 1px solid var(--border); padding: 25px; margin-bottom: 25px; }
        .btn { padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-gold { background: var(--accent); color: white; }
        .btn-ai { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:5px; }
        
        /* Status Badge */
        .status-badge { padding:4px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold; color:white; }
        .status-pub { background:#10b981; }
        .status-draft { background:#94a3b8; }

        /* Elements */
        .pipeline-wrap { display: flex; gap: 20px; overflow-x: auto; height: 100%; padding-bottom: 10px; }
        .pipeline-col { min-width: 280px; background: #e2e8f0; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; }
        .lead-card { background: white; padding: 15px; border-radius: 6px; margin-bottom: 10px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .prop-table { width:100%; border-collapse:collapse; } .prop-table td, .prop-table th { padding:12px; border-bottom:1px solid #eee; text-align:left; }
        input, select, textarea { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 15px; box-sizing: border-box; }
        
        /* Chat & Modal */
        #z-widget { position: fixed; bottom: 30px; right: 30px; z-index: 9999; }
        #z-window { display: none; width: 380px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); flex-direction: column; border: 1px solid var(--border); overflow: hidden; }
        .z-msg { padding: 10px 14px; border-radius: 10px; margin-bottom: 10px; max-width: 85%; font-size: 0.9rem; }
        .z-bot { background: #f1f5f9; align-self: flex-start; } .z-user { background: var(--accent); color: white; align-self: flex-end; }
        .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items:center; justify-content:center; }
        .modal-content { background: white; width: 90%; max-width: 1000px; height: 90vh; border-radius: 12px; display: flex; overflow: hidden; position: relative; }
        .close-modal { position: absolute; top: 15px; right: 20px; font-size: 1.8rem; cursor: pointer; color: #94a3b8; background: none; border: none; z-index: 10; }
        
        #ai-image-preview { margin-top:15px; text-align:center; display:none; background:#f1f5f9; padding:15px; border-radius:8px; }
        #ai-image-preview img { max-width:100%; max-height:300px; border-radius:8px; border:2px solid var(--accent); }
    </style>
</head>
<body>

<nav class="sidebar">
    <div style="padding:0 25px 30px; font-size:1.4rem; font-weight:700; color:white;">Zen<span style="color:var(--accent);">Eco</span></div>
    <a href="?tab=dashboard" class="nav-item <?= $tab=='dashboard'?'active':'' ?>"><i class="fas fa-chart-pie"></i> Dashboard</a>
    <a href="?tab=zenith_hq" class="nav-item <?= $tab=='zenith_hq'?'active':'' ?>"><i class="fas fa-brain"></i> Zenith HQ</a>
    <a href="?tab=crm" class="nav-item <?= $tab=='crm'?'active':'' ?>"><i class="fas fa-users"></i> Kunder <span id="nav-badge" class="badge">0</span></a>
    <a href="?tab=properties" class="nav-item <?= $tab=='properties'?'active':'' ?>"><i class="fas fa-building"></i> Eiendommer</a>
    <a href="sync-realtyflow.php" class="nav-item"><i class="fas fa-sync-alt"></i> Synk RealtyFlow</a>
    <a href="?tab=developers" class="nav-item <?= $tab=='developers'?'active':'' ?>"><i class="fas fa-hard-hat"></i> Utbyggere</a>
    <a href="?tab=articles" class="nav-item <?= $tab=='articles'?'active':'' ?>"><i class="fas fa-newspaper"></i> Magasin</a>
    <a href="?logout" class="nav-item" style="margin-top:auto;"><i class="fas fa-sign-out-alt"></i> Logg ut</a>
</nav>

<div class="main">
    <div class="top-bar">
        <h3><?= ucfirst($tab) ?></h3>
        <div id="top-notification" style="display:none; color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.location.href='?tab=crm'">
            <i class="fas fa-envelope"></i> <span id="notif-count">0</span> nye meldinger!
        </div>
    </div>
    <div class="content">
        <?php if($msg): ?><div style="background:#dcfce7; color:#166534; padding:15px; border-radius:8px; margin-bottom:20px;"><?= htmlspecialchars($msg) ?></div><?php endif; ?>
        <?php if($err): ?><div style="background:#fee2e2; color:#b91c1c; padding:15px; border-radius:8px; margin-bottom:20px;"><?= htmlspecialchars($err) ?></div><?php endif; ?>

        <?php if($tab === 'dashboard'): ?>
            <div class="grid-4">
                <div class="card" onclick="window.location.href='?tab=crm'"><h3>Nye Leads</h3><h1><?= $conn->query("SELECT COUNT(*) FROM crm_contacts WHERE status='new'")->fetch_row()[0] ?></h1></div>
                <div class="card" onclick="window.location.href='?tab=properties'"><h3>Boliger</h3><h1><?= $conn->query("SELECT COUNT(*) FROM properties")->fetch_row()[0] ?></h1></div>
            </div>
            <div class="card"><h3>Siste Aktivitet</h3><?php if(method_exists($zenith, 'getActivityFeed')) { $acts = $zenith->getActivityFeed(); if($acts) foreach($acts as $a) echo "<div style='padding:10px; border-bottom:1px solid #eee;'><span>{$a['title']}</span> <small style='color:#999'>".date('H:i', strtotime($a['time']))."</small></div>"; } ?></div>

        <?php elseif($tab === 'crm'): ?>
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h2>Pipeline</h2><button class="btn btn-primary" onclick="openModal({})">+ Ny Kunde</button></div>
            <div class="pipeline-wrap">
                <?php $stages=['new'=>'Nye','dialog'=>'Dialog','viewing'=>'Visning','offer'=>'Bud','sold'=>'Solgt']; 
                $leads=[]; $res=$conn->query("SELECT * FROM crm_contacts ORDER BY created_at DESC"); while($r=$res->fetch_assoc()) $leads[$r['pipeline_stage']?:'new'][]=$r;
                foreach($stages as $k=>$v): ?>
                <div class="pipeline-col"><strong><?= $v ?></strong><div class="sortable-list" data-stage="<?= $k ?>" style="min-height:100px;"><?php if(isset($leads[$k])) foreach($leads[$k] as $l): ?><div class="lead-card" onclick='openModal(<?= json_encode($l) ?>)'><div style="font-weight:600; display:flex; justify-content:space-between;"><?= $l['name'] ?> <i class="fas fa-comment-dots" style="color:var(--accent);" onclick="event.stopPropagation(); openChat(<?= $l['id'] ?>, '<?= $l['name'] ?>')"></i></div><small><?= $l['preferred_area'] ?></small></div><?php endforeach; ?></div></div>
                <?php endforeach; ?>
            </div>
            <div id="crmModal" class="modal"><div class="modal-content"><button class="close-modal" onclick="document.getElementById('crmModal').style.display='none'">&times;</button><form method="post" style="flex:1.5; padding:30px; overflow-y:auto; border-right:1px solid #eee;"><input type="hidden" name="action" value="save_contact_detailed"><input type="hidden" name="id" id="m_id"><div style="display:flex; justify-content:space-between;"><h3>Profil</h3><select name="pipeline_stage" id="m_stage" style="width:auto;"><option value="new">Nye</option><option value="dialog">Dialog</option><option value="viewing">Visning</option><option value="offer">Bud</option><option value="sold">Solgt</option></select></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"><input type="text" name="name" id="m_name" placeholder="Navn"><input type="text" name="phone" id="m_phone" placeholder="Tlf"></div><input type="email" name="email" id="m_email" placeholder="E-post"><div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;"><select name="preferred_area" id="m_area"><option value="">Sted...</option><option value="Annet">Annet</option></select><select name="budget" id="m_budget"><option value="">Budsjett...</option><option value="0-150k">0-150k</option><option value="150k-300k">150k-300k</option><option value="300k-500k">300k-500k</option><option value="500k+">500k+</option></select></div><input type="text" name="preferred_area_custom" id="custom_area" style="display:none;" placeholder="Område..."><textarea name="notes" id="m_notes" rows="3" placeholder="Notater"></textarea><button class="btn btn-primary" style="width:100%;">Lagre</button></form><div style="flex:1; padding:20px; background:#f8fafc;"><button class="btn btn-gold" style="width:100%;" onclick="openChat(document.getElementById('m_id').value, document.getElementById('m_name').value)">Chat</button></div></div></div>

        <?php elseif($tab === 'properties'): ?>
            <h2>Eiendommer</h2><div class="card"><form method="GET"><input type="hidden" name="tab" value="properties"><input type="text" name="q" placeholder="Søk..." style="width:300px;"><button class="btn btn-primary">Søk</button></form><button class="btn btn-gold" style="float:right;" onclick="openPropertyModal({})">+ Ny</button></div>
            <div class="card"><table class="prop-table"><tr><th>Ref</th><th>Tittel</th><th>Pris</th><th>Valg</th></tr><?php $sql="SELECT * FROM properties WHERE 1=1"; if(!empty($_GET['q'])) $sql.=" AND (title LIKE '%{$_GET['q']}%' OR external_id LIKE '%{$_GET['q']}%')"; $props=$conn->query($sql." ORDER BY created_at DESC LIMIT 50"); while($p=$props->fetch_assoc()) echo "<tr><td>{$p['external_id']}</td><td>{$p['title']}</td><td>{$p['price']}</td><td><button class='btn btn-primary' onclick='openPropertyModal(".json_encode($p).")'>Rediger</button></td></tr>"; ?></table></div>
            <div id="propModal" class="modal"><div class="modal-content"><button class="close-modal" onclick="document.getElementById('propModal').style.display='none'">&times;</button><form method="post" enctype="multipart/form-data" style="padding:30px; width:100%; overflow-y:auto;"><input type="hidden" name="action" value="save_property"><input type="hidden" name="id" id="p_id"><div style="display:grid; grid-template-columns:1fr 2fr; gap:10px;"><input type="text" name="external_id" id="p_ref" placeholder="Ref"><input type="text" name="title" id="p_title" placeholder="Tittel"></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><input type="number" name="price" id="p_price" placeholder="Pris"><input type="text" name="location" id="p_loc" placeholder="Sted"></div><div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;"><select name="type" id="p_type"><option>Villa</option><option>Leilighet</option></select><input type="number" name="bedrooms" id="p_beds" placeholder="Sov"><input type="number" name="bathrooms" id="p_baths" placeholder="Bad"></div><textarea name="description" id="p_desc" rows="4"></textarea><input type="file" name="image"><button class="btn btn-primary" style="width:100%;">Lagre</button></form></div></div>

        <?php elseif($tab === 'developers'): ?>
            <h2>Utbyggere</h2><div class="card"><button class="btn btn-gold" onclick="openDeveloperModal({})">+ Ny</button></div>
            <div class="card"><table class="prop-table"><tr><th>Navn</th><th>Kontakt</th><th>Epost</th><th>Valg</th></tr><?php $devs=$conn->query("SELECT * FROM developers"); while($d=$devs->fetch_assoc()) echo "<tr><td>{$d['name']}</td><td>{$d['contact_person']}</td><td>{$d['email']}</td><td><button class='btn btn-primary' onclick='openDeveloperModal(".json_encode($d).")'>Rediger</button></td></tr>"; ?></table></div>
            <div id="devModal" class="modal"><div class="modal-content"><button class="close-modal" onclick="document.getElementById('devModal').style.display='none'">&times;</button><form method="post" style="padding:30px; width:100%;"><input type="hidden" name="action" value="save_developer"><input type="hidden" name="id" id="d_id"><input type="text" name="name" id="d_name" placeholder="Navn"><input type="text" name="contact_person" id="d_contact" placeholder="Kontakt"><input type="email" name="email" id="d_email" placeholder="Epost"><input type="text" name="phone" id="d_phone" placeholder="Tlf"><textarea name="notes" id="d_notes" rows="3"></textarea><button class="btn btn-primary" style="width:100%;">Lagre</button></form></div></div>

        <?php elseif($tab === 'articles'): ?>
            <h2>Magasin</h2>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                <div class="card" style="background:#f0fdf4; border-color:#bbf7d0; margin:0;">
                    <h3 style="color:#166534;"><i class="fas fa-magic"></i> AI Forfatter</h3>
                    <form method="post" style="display:flex; flex-direction:column; gap:10px;"><input type="hidden" name="action" value="generate_article_ai"><input type="text" name="topic" placeholder="Hva skal artikkelen handle om?" required style="background:white;"><input type="text" name="audience" placeholder="Målgruppe (eks: Barnefamilier)" style="background:white;"><button class="btn btn-gold">Generer Utkast</button></form>
                </div>
                <div class="card" style="background:#fff7ed; border-color:#fed7aa; margin:0;">
                    <h3 style="color:#9a3412;"><i class="fas fa-pen-nib"></i> Omskriver / Ghostwriter</h3>
                    <form method="post" enctype="multipart/form-data" style="display:flex; flex-direction:column; gap:10px;">
                        <input type="hidden" name="action" value="rewrite_article_style">
                        <textarea name="source_text" placeholder="Lim inn tekst her (eller last opp fil)" rows="4" style="background:white; font-size:0.9rem;"></textarea>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <input type="file" name="source_file" style="font-size:0.8rem; width:60%;">
                            <button type="submit" class="btn btn-primary">Omskriv</button>
                        </div>
                        <small style="color:#666;">Støtter Word (.docx) og tekst.</small>
                    </form>
                </div>
            </div>

            <div class="card">
                <table class="prop-table">
                    <tr><th>Tittel</th><th>Status</th><th>Handling</th></tr>
                    <?php 
                    $arts = $conn->query("SELECT * FROM articles ORDER BY created_at DESC");
                    while($a=$arts->fetch_assoc()): 
                        $statusClass = $a['is_published'] ? 'status-pub' : 'status-draft';
                        $statusText = $a['is_published'] ? 'Publisert' : 'Utkast';
                    ?>
                    <tr>
                        <td><b><?= htmlspecialchars($a['title']) ?></b></td>
                        <td><span class="status-badge <?= $statusClass ?>"><?= $statusText ?></span></td>
                        <td style="display:flex; gap:10px;">
                            <button class='btn btn-primary' onclick='openArticleModal(<?= json_encode($a) ?>)'>Rediger</button>
                            <form method="POST" onsubmit="return confirm('Er du sikker på at du vil slette denne artikkelen?');" style="margin:0;">
                                <input type="hidden" name="action" value="delete_article">
                                <input type="hidden" name="id" value="<?= $a['id'] ?>">
                                <button class="btn" style="background:#ef4444; color:white;">Slett</button>
                            </form>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                </table>
            </div>
            
            <div id="articleModal" class="modal"><div class="modal-content" style="position:relative;">
                <button class="close-modal" onclick="document.getElementById('articleModal').style.display='none'">&times;</button>
                <div style="padding:30px; overflow-y:auto; width:100%;">
                    <h3>Rediger Artikkel</h3>
                    <form method="post" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="save_article_content">
                        <input type="hidden" name="id" id="a_id">
                        
                        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px; padding:15px; background:#f8fafc; border-radius:8px; align-items:center;">
                            <strong style="color:#64748b;">AI Verktøy:</strong>
                            <button type="button" class="btn btn-ai" onclick="startChat('Optimaliser denne tittelen for SEO: ' + document.getElementById('a_title').value)">✨ SEO</button>
                            <button type="button" class="btn btn-ai" onclick="generateAiImage()">🎨 Generer Bilde</button>
                            <button type="button" class="btn btn-ai" onclick="startChat('Korrekturles denne teksten: ' + document.getElementById('a_content').value)">📝 Korrektur</button>
                        </div>

                        <div id="ai-image-preview">
                            <p style="margin-bottom:10px;"><strong>AI Bilde Preview:</strong></p>
                            <div id="ai-img-container"></div>
                            <div style="margin-top:10px; display:flex; gap:10px; justify-content:center;">
                                <button type="button" class="btn btn-gold" onclick="useAiImageAsCover()">Bruk som Hovedbilde</button>
                                <button type="button" class="btn btn-primary" onclick="insertAiImageToContent()">Sett inn i Tekst</button>
                            </div>
                            <input type="hidden" id="generated-img-url">
                        </div>

                        <label>Tittel</label><input type="text" name="title" id="a_title">
                        <label>Innhold</label><textarea name="content" id="a_content" rows="15"></textarea>
                        
                        <label>Hovedbilde</label>
                        <input type="hidden" name="current_image_path" id="current_image_path">
                        <input type="file" name="cover_image">
                        <div id="current-img-preview" style="margin-top:5px; font-size:0.8rem; color:#666;"></div>

                        <label>Status</label>
                        <select name="status" id="a_status" style="font-weight:bold;">
                            <option value="draft">Utkast (Skjult)</option>
                            <option value="published">Publisert (Synlig)</option>
                        </select>
                        
                        <button class="btn btn-primary" style="width:100%; margin-top:20px;">Lagre Artikkel</button>
                    </form>
                </div>
            </div></div>
        <?php endif; ?>
    </div>
</div>

<div id="clientChatModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:2000; align-items:center; justify-content:center;"><div style="background:white; width:500px; height:600px; display:flex; flex-direction:column; border-radius:10px; position:relative;"><button class="close-modal" onclick="document.getElementById('clientChatModal').style.display='none'">&times;</button><div style="padding:15px; border-bottom:1px solid #eee;"><strong id="chat-client-name">Kunde</strong></div><div id="client-msgs" style="flex:1; padding:20px; overflow-y:auto; background:#f9f9f9;"></div><div style="padding:15px; border-top:1px solid #eee; display:flex; gap:10px;"><input type="hidden" id="chat-client-id"><input type="text" id="client-input" style="flex:1; padding:10px; border:1px solid #ddd;" placeholder="Svar..."><button onclick="sendClientReply()" class="btn btn-primary">Send</button></div></div></div>
<div id="z-widget"><div id="z-window"><div style="background:#1A2530; color:white; padding:15px;">Zenith AI <span onclick="toggleZenith()" style="float:right; cursor:pointer;">&times;</span></div><div id="z-messages" style="flex:1; padding:15px; overflow-y:auto;"></div><div style="padding:10px; border-top:1px solid #eee;"><input type="text" id="z-input" style="width:100%; padding:8px;" placeholder="Spør..." onkeypress="if(event.key==='Enter') sendZenith()"></div></div><button onclick="toggleZenith()" style="width:60px; height:60px; border-radius:50%; background:#1A2530; color:white; border:none; font-size:1.5rem; cursor:pointer;"><i class="fas fa-robot"></i></button></div>

<script>
// --- VARSLING ---
function checkNotifications() { fetch('api-messages.php?action=check_notifications').then(r=>r.json()).then(d=>{ const c=d.unread_count||0; document.getElementById('nav-badge').innerText=c; document.getElementById('nav-badge').style.display=c>0?'inline-block':'none'; if(c>0){document.getElementById('top-notification').style.display='block'; document.getElementById('notif-count').innerText=c;}else{document.getElementById('top-notification').style.display='none';} }); } setInterval(checkNotifications, 3000); checkNotifications();

// --- MODALS & LOGIC ---
function openModal(d) { document.getElementById('crmModal').style.display='flex'; document.getElementById('m_id').value=d.id||''; document.getElementById('m_name').value=d.name||''; document.getElementById('m_email').value=d.email||''; document.getElementById('m_phone').value=d.phone||''; document.getElementById('m_notes').value=d.notes||''; document.getElementById('m_stage').value=d.pipeline_stage||'new'; }
function openArticleModal(a) { 
    document.getElementById('articleModal').style.display='flex'; 
    document.getElementById('a_id').value=a.id; 
    document.getElementById('a_title').value=a.title; 
    document.getElementById('a_status').value = a.is_published ? 'published' : 'draft';
    document.getElementById('current_image_path').value = a.image_path_1 || '';
    document.getElementById('current-img-preview').innerText = a.image_path_1 ? "Nåværende bilde: " + a.image_path_1 : "";
    document.getElementById('ai-image-preview').style.display='none'; 
    
    try{let c=JSON.parse(a.content_json); document.getElementById('a_content').value=c[0].content;}
    catch(e){document.getElementById('a_content').value=a.content_json||'';} 
}

// --- BILDE GENERATOR ---
async function generateAiImage() {
    const title = document.getElementById('a_title').value;
    const content = document.getElementById('a_content').value.substring(0, 500);
    
    if(!title) { alert("Skriv en tittel først!"); return; }
    
    const btn = document.querySelector('.btn-ai');
    const originalText = btn.innerText;
    btn.innerText = "Tenker...";
    
    // 1. Få Prompt fra Zenith AI
    const promptReq = "Lag en detaljert bilde-prompt på engelsk for en realistisk, høykvalitets eiendomsartikkel. Tittel: " + title + ". Innhold: " + content + ". Returner KUN prompten, ingen annen tekst.";
    
    const res = await fetch('api-chat.php', { method:'POST', body:JSON.stringify({message: promptReq}) });
    const data = await res.json();
    const imagePrompt = data.reply.replace(/['"]+/g, '');
    
    // 2. Generer Bilde URL (Pollinations)
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=600&nologo=true`;
    
    // 3. Vis Preview
    const container = document.getElementById('ai-img-container');
    container.innerHTML = `<img src="${imageUrl}" alt="AI Bilde">`;
    document.getElementById('generated-img-url').value = imageUrl;
    document.getElementById('ai-image-preview').style.display = 'block';
    
    btn.innerText = originalText;
}

// --- LAGRE BILDE TIL SERVER ---
async function saveImageToServer(url) {
    const res = await fetch('api-upload.php', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ imageUrl: url })
    });
    const data = await res.json();
    if(data.success) return data.url;
    else { alert("Kunne ikke lagre bilde: " + data.error); return null; }
}

async function useAiImageAsCover() {
    const url = document.getElementById('generated-img-url').value;
    if(!url) return;
    const localPath = await saveImageToServer(url);
    if(localPath) {
        document.getElementById('current_image_path').value = localPath;
        document.getElementById('current-img-preview').innerText = "Valgt nytt AI-bilde (lagres når du klikker Lagre Artikkel)";
        alert("Bilde valgt! Husk å lagre artikkelen.");
    }
}

async function insertAiImageToContent() {
    const url = document.getElementById('generated-img-url').value;
    if(!url) return;
    const localPath = await saveImageToServer(url);
    if(localPath) {
        const imgTag = `\n<img src="${localPath}" alt="AI Bilde" style="width:100%; border-radius:8px; margin:20px 0;">\n`;
        const textarea = document.getElementById('a_content');
        textarea.value += imgTag;
        alert("Bilde satt inn i teksten!");
    }
}

// --- CHAT SYSTEM ---
function openChat(id, name) { document.getElementById('clientChatModal').style.display='flex'; document.getElementById('chat-client-name').innerText=name; document.getElementById('chat-client-id').value=id; loadClientMsgs(id); }
function loadClientMsgs(id) { fetch('api-messages.php?action=get_messages&client_id='+id).then(r=>r.json()).then(d=>{ const b=document.getElementById('client-msgs'); b.innerHTML=''; d.messages.forEach(m=>{ const s=m.sender_type==='admin'?'text-align:right;':'text-align:left;'; const bg=m.sender_type==='admin'?'#C5A059':'#e0e0e0'; const c=m.sender_type==='admin'?'white':'#333'; b.innerHTML+=`<div style="margin-bottom:10px; ${s}"><span style="background:${bg}; color:${c}; padding:8px 12px; border-radius:12px; display:inline-block;">${m.message}</span></div>`; }); b.scrollTop=b.scrollHeight; }); }
function sendClientReply() { const id=document.getElementById('chat-client-id').value; const msg=document.getElementById('client-input').value; fetch('api-messages.php?action=send_admin', { method:'POST', body:JSON.stringify({client_id:id, message:msg}) }).then(()=>{ document.getElementById('client-input').value=''; loadClientMsgs(id); }); }

function toggleZenith() { document.getElementById('z-window').style.display=document.getElementById('z-window').style.display==='flex'?'none':'flex'; }
function startChat(msg) { toggleZenith(); document.getElementById('z-input').value=msg; sendZenith(); }
async function sendZenith() { const inp=document.getElementById('z-input'); const msg=inp.value; if(!msg) return; const d=document.createElement('div'); d.className='z-msg z-user'; d.innerText=msg; document.getElementById('z-messages').appendChild(d); inp.value=''; const r=await fetch('api-chat.php', { method:'POST', body:JSON.stringify({message:msg}) }); const res=await r.json(); const b=document.createElement('div'); b.className='z-msg z-bot'; b.innerHTML=res.reply; document.getElementById('z-messages').appendChild(b); }

document.querySelectorAll('.sortable-list').forEach(l => { new Sortable(l, { group:'crm', animation:150, onEnd: function(evt){ fetch('backend.php', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:`action=update_lead_status_ajax&id=${evt.item.getAttribute('onclick').match(/"id":(\d+)/)[1]}&pipeline_stage=${evt.to.dataset.stage}` }); }}); });
</script>
</body>
</html>
