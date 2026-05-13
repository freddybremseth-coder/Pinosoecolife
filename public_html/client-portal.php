<?php
session_start();

// --- 1. LOGIKK FOR LOGG UT (Må ligge øverst!) ---
if (isset($_GET['logout'])) {
    // Slett alle sesjonsvariabler
    $_SESSION = array();
    // Ødelegg sesjonen
    session_destroy();
    // Send brukeren til login-siden
    header("Location: client-login.php");
    exit;
}

// --- 2. SIKKERHETSSJEKK ---
if (!isset($_SESSION['client_logged_in'])) { 
    header("Location: client-login.php"); 
    exit; 
}

require_once 'database/Database.php';
// Vi dropper standard header.php her for å ha full kontroll på designet (dashboard-stil)
// Men vi inkluderer fontene og ikonene manuelt:
?>
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Min Side - Pinoso Eco Life</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        /* BASE STYLES (Kopiert fra hovedsiden for konsistens) */
        body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; margin: 0; color: #1e293b; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        a { text-decoration: none; color: inherit; }
        
        /* KOMPAKT HEADER (NY DESIGN) */
        .dashboard-header {
            background: #1A2530;
            color: white;
            padding: 15px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        .header-inner { display: flex; justify-content: space-between; align-items: center; }
        .brand { font-weight: 700; font-size: 1.2rem; letter-spacing: 0.5px; }
        .brand span { color: #C5A059; }
        
        .user-nav { display: flex; align-items: center; gap: 25px; font-size: 0.9rem; }
        .user-greeting { color: #94a3b8; }
        .nav-link { color: white; opacity: 0.8; transition: 0.2s; }
        .nav-link:hover, .nav-link.active { opacity: 1; color: #C5A059; }
        .btn-logout { 
            border: 1px solid rgba(255,255,255,0.2); padding: 6px 15px; border-radius: 4px; transition: 0.2s; 
        }
        .btn-logout:hover { background: rgba(255,255,255,0.1); border-color: white; }

        /* SØKEBOKS (Nå plassert rett i innholdet) */
        .search-section { margin-top: 30px; margin-bottom: 40px; }
        .search-card { 
            background: white; padding: 20px; border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; 
            display: flex; gap: 10px; align-items: center;
        }
        
        /* DASHBOARD GRID */
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; padding-bottom: 60px; }
        @media (max-width: 900px) { 
            .dashboard-grid { grid-template-columns: 1fr; } 
            .search-card { flex-direction: column; }
        }

        /* CARDS & CHAT */
        .section-title { font-size: 1.3rem; margin-bottom: 15px; color: #1A2530; font-weight: 600; display:flex; align-items:center; gap:10px; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        
        .match-card { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; transition: 0.3s; position:relative; }
        .match-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .match-tag { position:absolute; top:10px; right:10px; background:#C5A059; color:white; font-size:0.7rem; padding:4px 8px; border-radius:4px; font-weight:bold; }
        
        .chat-container { 
            background: white; border-radius: 12px; border: 1px solid #e2e8f0; 
            height: calc(100vh - 140px); min-height: 500px; 
            display: flex; flex-direction: column; position: sticky; top: 90px;
        }
        .chat-header { padding: 15px; border-bottom: 1px solid #f1f5f9; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 15px; background: #f8fafc; }
        .chat-input { padding: 15px; border-top: 1px solid #f1f5f9; display: flex; gap: 10px; }
        
        /* FORM ELEMENTS */
        .form-control { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; }
        .btn-gold { background: #C5A059; color: white; border: none; padding: 12px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .btn-outline { border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; color: #475569; display:inline-block; margin-top:10px; }
        .btn-outline:hover { background: #f1f5f9; color: #1e293b; }
    </style>
</head>
<body>

<?php
$cid = $_SESSION['client_id'];
$clientName = $_SESSION['client_name'] ?? 'Kunde';

$db = new Database();
$conn = $db->getConnection();

// HENT DATA
$favs = $conn->query("SELECT p.* FROM favorites f JOIN properties p ON f.property_id = p.id WHERE f.client_id = $cid");
$docs = $conn->query("SELECT * FROM client_documents WHERE client_id = $cid ORDER BY uploaded_at DESC");
$matches = $conn->query("SELECT p.*, cm.ai_teaser, cm.matched_at FROM client_matches cm JOIN properties p ON cm.property_id = p.id WHERE cm.client_id = $cid ORDER BY cm.matched_at DESC");
$locations = $conn->query("SELECT DISTINCT location FROM properties ORDER BY location ASC");
?>

<header class="dashboard-header">
    <div class="container header-inner">
        <div class="brand">ZEN ECO <span style="font-weight:400;">HOMES</span></div>
        <div class="user-nav">
            <span class="user-greeting">Hei, <?= htmlspecialchars($clientName) ?></span>
            <a href="client-portal.php" class="nav-link active">Oversikt</a>
            <a href="client-properties.php" class="nav-link">Boligsøk</a>
            <a href="client-portal.php?logout=true" class="btn-logout">Logg ut</a>
        </div>
    </div>
</header>

<div class="container">
    
    <div class="search-section">
        <form action="client-properties.php" method="GET" class="search-card">
            <i class="fas fa-search" style="color:#C5A059; font-size:1.2rem; padding-left:10px;"></i>
            <input type="text" name="q" placeholder="Søk etter område, ref.nr eller 'havutsikt'..." style="border:none; flex:1; outline:none; font-size:1rem;">
            <select name="area" class="form-control" style="padding:12px; border-radius:6px; border:1px solid #ddd;">
                <option value="Alle">Alle Områder</option>
                <optgroup label="Regioner">
                    <option value="region_north">Costa Blanca Nord</option>
                    <option value="region_south">Costa Blanca Sør</option>
                    <option value="region_calida">Costa Calida</option>
                </optgroup>
                <optgroup label="Steder">
                    <?php 
                    $locations->data_seek(0);
                    while($l=$locations->fetch_assoc()) echo "<option value='{$l['location']}'>{$l['location']}</option>"; 
                    ?>
                </optgroup>
            </select>
            <button class="btn-gold">Søk</button>
        </form>
    </div>

    <div class="dashboard-grid">
        
        <div>
            <h2 class="section-title"><i class="fas fa-star" style="color:#C5A059;"></i> Anbefalt for deg</h2>
            <?php if ($matches->num_rows > 0): ?>
                <div class="card-grid">
                    <?php while($row = $matches->fetch_assoc()): ?>
                        <a href="property.php?id=<?= $row['id'] ?>" class="match-card">
                            <div class="match-tag">UTVALGT</div>
                            <img src="<?= htmlspecialchars($row['image_path'] ?? 'assets/placeholder.jpg') ?>" style="height:160px; width:100%; object-fit:cover;">
                            <div style="padding:15px;">
                                <h4 style="margin:0 0 5px; font-size:1rem;"><?= htmlspecialchars($row['title']) ?></h4>
                                <div style="color:#C5A059; font-weight:bold;">€ <?= number_format($row['price'], 0, ',', ' ') ?></div>
                                <p style="font-size:0.8rem; color:#64748b; margin-top:8px;">"<?= htmlspecialchars($row['ai_teaser']) ?>"</p>
                            </div>
                        </a>
                    <?php endwhile; ?>
                </div>
            <?php else: ?>
                <div style="padding:20px; background:white; border-radius:8px; color:#64748b; border:1px solid #e2e8f0;">
                    Ingen anbefalinger enda. Søk etter boliger for å komme i gang!
                </div>
            <?php endif; ?>

            <?php if ($favs->num_rows > 0): ?>
                <h2 class="section-title" style="margin-top:40px;"><i class="fas fa-heart" style="color:#ef4444;"></i> Dine Favoritter</h2>
                <div class="card-grid">
                    <?php while($fav = $favs->fetch_assoc()): ?>
                        <a href="property.php?id=<?= $fav['id'] ?>" class="match-card">
                            <img src="<?= htmlspecialchars($fav['image_path'] ?? 'assets/placeholder.jpg') ?>" style="height:140px; width:100%; object-fit:cover;">
                            <div style="padding:15px;">
                                <h4 style="margin:0 0 5px; font-size:0.95rem;"><?= htmlspecialchars($fav['title']) ?></h4>
                                <small style="color:#64748b;"><?= htmlspecialchars($fav['location']) ?></small>
                            </div>
                        </a>
                    <?php endwhile; ?>
                </div>
            <?php endif; ?>

            <h2 class="section-title" style="margin-top:40px;"><i class="fas fa-folder-open" style="color:#3b82f6;"></i> Dokumenter</h2>
            <div style="background:white; border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
                <?php if ($docs->num_rows > 0): ?>
                    <?php while($doc = $docs->fetch_assoc()): ?>
                        <div style="padding:15px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:15px;">
                                <i class="fas fa-file-pdf" style="font-size:1.4rem; color:#ef4444;"></i>
                                <div>
                                    <div style="font-weight:600; font-size:0.95rem;"><?= htmlspecialchars($doc['title']) ?></div>
                                    <div style="font-size:0.75rem; color:#94a3b8;"><?= date('d.m.Y', strtotime($doc['uploaded_at'])) ?></div>
                                </div>
                            </div>
                            <a href="<?= htmlspecialchars($doc['file_path']) ?>" target="_blank" class="btn-outline">Last ned</a>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <div style="padding:20px; color:#94a3b8; font-size:0.9rem;">Ingen dokumenter delt enda.</div>
                <?php endif; ?>
            </div>
        </div>

        <div>
            <div class="chat-container">
                <div class="chat-header">
                    <div style="width:10px; height:10px; background:#10b981; border-radius:50%;"></div>
                    <div>Din Rådgiver <span style="font-weight:400; color:#64748b; font-size:0.8rem;">(Online)</span></div>
                </div>
                <div id="chat-messages" class="chat-messages"></div>
                <form id="chat-form" class="chat-input">
                    <input type="text" id="chat-input" placeholder="Send en melding..." class="form-control" style="border-radius:20px;">
                    <button type="submit" class="btn-gold" style="border-radius:50%; width:42px; height:42px; padding:0; display:flex; align-items:center; justify-content:center;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>

    </div>
</div>

<script>
// CHAT FUNKSJONALITET
const chatBox = document.getElementById('chat-messages');
const clientId = <?= $cid ?>;

function loadMessages() {
    fetch('api-messages.php?action=get_messages&client_id=' + clientId)
    .then(res => res.json())
    .then(data => {
        if(data.messages) {
            chatBox.innerHTML = '';
            data.messages.forEach(msg => {
                const isMe = (msg.sender_type === 'client' || msg.sender_type === 'Kunde');
                const div = document.createElement('div');
                div.style.textAlign = isMe ? 'right' : 'left';
                div.style.marginBottom = '12px';
                
                // Formater lenker
                let content = msg.message.replace(/(https?:\/\/[^\s]+)/g, function(url) {
                    return `<a href="${url}" target="_blank" style="display:inline-block; margin-top:5px; background:white; color:#333; padding:5px 10px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:0.8rem; box-shadow:0 1px 2px rgba(0,0,0,0.1);"><i class="fas fa-external-link-alt"></i> Se Bolig</a>`;
                });

                const bg = isMe ? '#C5A059' : 'white';
                const col = isMe ? 'white' : '#1e293b';
                
                div.innerHTML = `<div style="display:inline-block; padding:10px 15px; border-radius:12px; font-size:0.9rem; background: ${bg}; color: ${col}; max-width:85%; text-align:left; box-shadow:0 1px 3px rgba(0,0,0,0.05);">${content}</div>`;
                chatBox.appendChild(div);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    })
    .catch(err => console.error(err));
}

document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if(!input.value.trim()) return;

    fetch('api-messages.php?action=send_client', {
        method: 'POST', body: JSON.stringify({ client_id: clientId, message: input.value })
    }).then(() => { input.value = ''; loadMessages(); });
});

setInterval(loadMessages, 3000);
loadMessages();
</script>

</body>
</html>