<?php
session_start();
if (!isset($_SESSION['client_logged_in'])) { header("Location: client-login.php"); exit; }

require_once 'database/Database.php';
// Vi bruker en enkel header uten standard meny for å holde kunden i portalen
include 'includes/header.php'; 

$db = new Database();
$conn = $db->getConnection();
$clientId = $_SESSION['client_id'];

// --- 1. AVANSERT SØKELOGIKK ---
$where = ["1=1"]; 
$params = []; 
$types = "";

// A. SØK (Fritekst/Ref)
if (!empty($_GET['q'])) {
    $term = "%{$_GET['q']}%";
    $where[] = "(title LIKE ? OR location LIKE ? OR external_id LIKE ?)";
    $params[] = $term; $params[] = $term; $params[] = $term; $types .= "sss";
}

// B. OMRÅDE & REGIONER (Hjernen i oppdateringen)
$area = $_GET['area'] ?? '';
if (!empty($area) && $area !== 'Alle') {
    if ($area === 'region_north') {
        // Definisjon av NORD
        $where[] = "(region LIKE '%North%' OR location IN ('Altea','Albir','Calpe','Benidorm','Denia','Javea','Polop','La Nucia','Finestrat','Villajoyosa','Moraira','Alfaz del Pi'))";
    } elseif ($area === 'region_south') {
        // Definisjon av SØR
        $where[] = "(region LIKE '%South%' OR location IN ('Torrevieja','Orihuela Costa','Ciudad Quesada','Villamartin','Guardamar','Alicante','Santa Pola','Rojales','San Miguel de Salinas'))";
    } elseif ($area === 'region_calida') {
        // Definisjon av CALIDA / MURCIA
        $where[] = "(region LIKE '%Calida%' OR region LIKE '%Murcia%' OR location IN ('La Manga','San Pedro del Pinatar','Pilar de la Horadada','Los Alcazares','Torre Pacheco','Cartagena','Murcia'))";
    } else {
        // Spesifikt sted
        $where[] = "location = ?";
        $params[] = $area; $types .= "s";
    }
}

// C. PRIS
if (!empty($_GET['budget']) && $_GET['budget'] !== 'Alle') {
    if (strpos($_GET['budget'], '+') !== false) {
        $min = (int)str_replace(['k','+'], ['000',''], $_GET['budget']);
        $where[] = "price >= ?"; $params[] = $min; $types .= "i";
    } else {
        $parts = explode('-', str_replace('k', '000', $_GET['budget']));
        if(count($parts)===2) {
            $where[] = "price BETWEEN ? AND ?";
            $params[] = (int)$parts[0]; $params[] = (int)$parts[1]; $types .= "ii";
        }
    }
}

// D. BOLIGTYPE
if (!empty($_GET['type']) && $_GET['type'] !== 'Alle') {
    $where[] = "type = ?"; $params[] = $_GET['type']; $types .= "s";
}

// KJØR SPØRRING
$sql = "SELECT * FROM properties WHERE " . implode(" AND ", $where) . " ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
if (!empty($params)) $stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();
?>

<div style="background:#1A2530; color:white; padding:15px 0;">
    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:bold;">ZEN ECO <span style="color:#C5A059;">HOMES</span></div>
        <nav style="display:flex; gap:20px;">
            <a href="client-portal.php" style="color:white; text-decoration:none; opacity:0.8;">Min Side</a>
            <a href="client-properties.php" style="color:#C5A059; text-decoration:none; font-weight:bold;">Boligsøk</a>
            <a href="client-portal.php?logout" style="color:white; text-decoration:none; opacity:0.8;">Logg ut</a>
        </nav>
    </div>
</div>

<div class="container" style="padding:40px 0;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h1>Finn din drømmebolig</h1>
        <a href="client-portal.php" class="btn btn-outline" style="border:1px solid #ddd; padding:8px 15px; border-radius:6px; text-decoration:none; color:#333;">&larr; Tilbake</a>
    </div>

    <form method="GET" style="background:#f8fafc; padding:25px; border-radius:12px; margin-bottom:40px; display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; border:1px solid #eee;">
        
        <div>
            <label style="font-weight:600; font-size:0.9rem; display:block; margin-bottom:5px;">Område</label>
            <select name="area" class="form-control" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                <option value="Alle">Hele Kysten</option>
                
                <optgroup label="Store Regioner">
                    <option value="region_north" <?= ($area=='region_north')?'selected':'' ?>>Costa Blanca Nord</option>
                    <option value="region_south" <?= ($area=='region_south')?'selected':'' ?>>Costa Blanca Sør</option>
                    <option value="region_calida" <?= ($area=='region_calida')?'selected':'' ?>>Costa Calida (Murcia)</option>
                </optgroup>

                <optgroup label="Alle Steder (A-Å)">
                    <?php 
                    $locs = $conn->query("SELECT DISTINCT location FROM properties ORDER BY location ASC");
                    while($l=$locs->fetch_assoc()) {
                        $sel = ($area == $l['location']) ? 'selected' : '';
                        echo "<option value='{$l['location']}' $sel>{$l['location']}</option>";
                    }
                    ?>
                </optgroup>
            </select>
        </div>

        <div>
            <label style="font-weight:600; font-size:0.9rem; display:block; margin-bottom:5px;">Boligtype</label>
            <select name="type" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                <option value="Alle">Alle typer</option>
                <option value="Villa" <?= ($_GET['type']??'')=='Villa'?'selected':'' ?>>Villa</option>
                <option value="Apartment" <?= ($_GET['type']??'')=='Apartment'?'selected':'' ?>>Leilighet</option>
                <option value="Townhouse" <?= ($_GET['type']??'')=='Townhouse'?'selected':'' ?>>Rekkehus</option>
                <option value="Finca" <?= ($_GET['type']??'')=='Finca'?'selected':'' ?>>Finca</option>
            </select>
        </div>

        <div>
            <label style="font-weight:600; font-size:0.9rem; display:block; margin-bottom:5px;">Prisklasse</label>
            <select name="budget" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                <option value="Alle">Alle priser</option>
                <option value="0-200k" <?= ($_GET['budget']??'')=='0-200k'?'selected':'' ?>>Under 200k €</option>
                <option value="200k-350k" <?= ($_GET['budget']??'')=='200k-350k'?'selected':'' ?>>200k - 350k €</option>
                <option value="350k-500k" <?= ($_GET['budget']??'')=='350k-500k'?'selected':'' ?>>350k - 500k €</option>
                <option value="500k+" <?= ($_GET['budget']??'')=='500k+'?'selected':'' ?>>Over 500k €</option>
            </select>
        </div>

        <div>
            <label style="font-weight:600; font-size:0.9rem; display:block; margin-bottom:5px;">Søk (Ref.nr, etc)</label>
            <input type="text" name="q" placeholder="F.eks. Havutsikt..." value="<?= htmlspecialchars($_GET['q']??'') ?>" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
        </div>

        <button class="btn btn-gold" style="background:#C5A059; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; align-self:end; padding:10px;">Vis Resultater</button>
    </form>

    <h3 style="margin-bottom:20px;"><?= $result->num_rows ?> Boliger funnet</h3>
    
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:30px;">
        <?php while($row = $result->fetch_assoc()): ?>
            <div style="border:1px solid #eee; border-radius:12px; overflow:hidden; transition:0.3s; background:white; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <div style="height:200px; overflow:hidden; position:relative;">
                    <img src="<?= htmlspecialchars($row['image_path'] ?? 'assets/placeholder.jpg') ?>" style="width:100%; height:100%; object-fit:cover;">
                    <span style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); color:white; padding:4px 8px; border-radius:4px; font-size:0.7rem;">
                        Ref: <?= $row['external_id'] ?>
                    </span>
                </div>
                <div style="padding:20px;">
                    <div style="color:#888; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;"><?= htmlspecialchars($row['location']) ?></div>
                    <h3 style="margin:5px 0 10px; font-size:1.1rem; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;"><?= htmlspecialchars($row['title']) ?></h3>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <span style="font-weight:bold; color:#C5A059; font-size:1.2rem;">€ <?= number_format($row['price'], 0, ',', ' ') ?></span>
                        <span style="font-size:0.85rem; color:#666;"><i class="fas fa-bed"></i> <?= $row['bedrooms'] ?> <i class="fas fa-bath" style="margin-left:5px;"></i> <?= $row['bathrooms'] ?></span>
                    </div>
                    
                    <div style="display:flex; gap:10px;">
                        <button onclick="sendInterest(<?= $row['id'] ?>, '<?= htmlspecialchars($row['title']) ?>')" class="btn btn-outline" style="flex:1; padding:8px; border:1px solid #ddd; background:white; border-radius:4px; cursor:pointer;">
                            <i class="fas fa-comment"></i> Kontakt
                        </button>
                        <a href="property.php?id=<?= $row['id'] ?>" class="btn btn-gold" style="flex:1; padding:8px; background:#1A2530; color:white; text-align:center; text-decoration:none; border-radius:4px;">Se Mer</a>
                    </div>
                </div>
            </div>
        <?php endwhile; ?>
    </div>
</div>

<script>
function sendInterest(propId, title) {
    const msg = "Hei, jeg er interessert i denne boligen: " + title + " (ID: " + propId + "). Kan du fortelle mer?";
    fetch('api-messages.php?action=send_client', {
        method: 'POST', body: JSON.stringify({ client_id: <?= $clientId ?>, message: msg })
    }).then(() => {
        alert("Forespørsel sendt til din rådgiver! Sjekk chatten på Min Side.");
        window.location.href = 'client-portal.php';
    });
}
</script>

<?php include 'includes/footer.php'; ?>