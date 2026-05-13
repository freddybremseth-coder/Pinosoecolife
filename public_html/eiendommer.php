<?php
/**
 * eiendommer.php - Offentlig boligsøk (Redesignet Hero-seksjon)
 */
require_once 'database/Database.php';
include 'includes/header.php'; 

$db = new Database();
$conn = $db->getConnection();

// --- 1. SØKELOGIKK (Uendret) ---
$where = ["1=1"]; $params = []; $types = "";

// A. OMRÅDE
$area = $_GET['area'] ?? '';
if (!empty($area) && $area !== 'Alle') {
    if ($area === 'region_north') {
        $where[] = "(region LIKE '%North%' OR location IN ('Altea','Albir','Calpe','Benidorm','Denia','Javea','Polop','La Nucia','Finestrat','Villajoyosa','Moraira','Alfaz del Pi'))";
    } elseif ($area === 'region_south') {
        $where[] = "(region LIKE '%South%' OR location IN ('Torrevieja','Orihuela Costa','Ciudad Quesada','Villamartin','Guardamar','Alicante','Santa Pola','Rojales','San Miguel de Salinas'))";
    } elseif ($area === 'region_calida') {
        $where[] = "(region LIKE '%Calida%' OR region LIKE '%Murcia%' OR location IN ('La Manga','San Pedro del Pinatar','Pilar de la Horadada','Los Alcazares','Torre Pacheco','Cartagena','Murcia'))";
    } else {
        $where[] = "location = ?"; $params[] = $area; $types .= "s";
    }
}

// B. PRIS
if (!empty($_GET['budget']) && $_GET['budget'] !== 'Alle') {
    if (strpos($_GET['budget'], '+') !== false) {
        $min = (int)str_replace(['k','+'], ['000',''], $_GET['budget']);
        $where[] = "price >= ?"; $params[] = $min; $types .= "i";
    } else {
        $parts = explode('-', str_replace('k', '000', $_GET['budget']));
        if(count($parts)===2) {
            $where[] = "price BETWEEN ? AND ?"; $params[] = (int)$parts[0]; $params[] = (int)$parts[1]; $types .= "ii";
        }
    }
}

// C. TYPE & D. SØK
if (!empty($_GET['type']) && $_GET['type'] !== 'Alle') { $where[] = "type = ?"; $params[] = $_GET['type']; $types .= "s"; }
if (!empty($_GET['q'])) { $term = "%{$_GET['q']}%"; $where[] = "(title LIKE ? OR location LIKE ? OR external_id LIKE ?)"; $params[] = $term; $params[] = $term; $params[] = $term; $types .= "sss"; }

$sql = "SELECT * FROM properties WHERE " . implode(" AND ", $where) . " ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
if (!empty($params)) $stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();
?>

<div style="
    position: relative;
    background: url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
">
    <div style="position:absolute; inset:0; background:rgba(26, 37, 48, 0.4);"></div>
    
    <div style="position:relative; z-index:1; max-width:800px; padding:0 20px; margin-bottom: 60px;">
        <h1 style="font-size: 3rem; margin-bottom: 15px; font-weight: 700; text-shadow: 0 2px 10px rgba(245, 245, 220, 0.7);">
            Finn din drømmebolig i solen
        </h1>
        <p style="font-size: 1.2rem; opacity: 0.9; font-weight: 300;">
            Vi har over 1500 boliger på Costa Blanca og Costa Calida
        </p>
    </div>
</div>

<div class="container" style="position: relative; margin-top: -100px; z-index: 10; margin-bottom: 60px;">
    <form method="GET" action="eiendommer.php" style="
        background: white; 
        padding: 30px; 
        border-radius: 12px; 
        box-shadow: 0 20px 50px rgba(0,0,0,0.15); 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
        gap: 20px;
        align-items: end;
    ">
        
        <div>
            <label style="font-weight:600; font-size:0.85rem; color:#64748b; display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Hvor vil du bo?</label>
            <div style="position:relative;">
                <i class="fas fa-map-marker-alt" style="position:absolute; left:12px; top:12px; color:#C5A059;"></i>
                <select name="area" style="width:100%; padding:12px 12px 12px 40px; border:1px solid #e2e8f0; border-radius:8px; font-size:1rem; appearance:none; background:white url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E') no-repeat right 12px center; background-size:10px;">
                    <option value="Alle">Hele Kysten</option>
                    <optgroup label="Regioner">
                        <option value="region_north" <?= ($area=='region_north')?'selected':'' ?>>Costa Blanca Nord</option>
                        <option value="region_south" <?= ($area=='region_south')?'selected':'' ?>>Costa Blanca Sør</option>
                        <option value="region_calida" <?= ($area=='region_calida')?'selected':'' ?>>Costa Calida</option>
                    </optgroup>
                    <optgroup label="Byer">
                        <?php 
                        $locs = $conn->query("SELECT DISTINCT location FROM properties ORDER BY location ASC");
                        while($l=$locs->fetch_assoc()) echo "<option value='{$l['location']}' ".($area==$l['location']?'selected':'').">{$l['location']}</option>";
                        ?>
                    </optgroup>
                </select>
            </div>
        </div>

        <div>
            <label style="font-weight:600; font-size:0.85rem; color:#64748b; display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Boligtype</label>
            <div style="position:relative;">
                <i class="fas fa-home" style="position:absolute; left:12px; top:12px; color:#C5A059;"></i>
                <select name="type" style="width:100%; padding:12px 12px 12px 40px; border:1px solid #e2e8f0; border-radius:8px; font-size:1rem; appearance:none; background:white url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E') no-repeat right 12px center; background-size:10px;">
                    <option value="Alle">Alle typer</option>
                    <option value="Villa" <?= ($_GET['type']??'')=='Villa'?'selected':'' ?>>Villa</option>
                    <option value="Apartment" <?= ($_GET['type']??'')=='Apartment'?'selected':'' ?>>Leilighet</option>
                    <option value="Townhouse" <?= ($_GET['type']??'')=='Townhouse'?'selected':'' ?>>Rekkehus</option>
                    <option value="Finca" <?= ($_GET['type']??'')=='Finca'?'selected':'' ?>>Finca</option>
                </select>
            </div>
        </div>

        <div>
            <label style="font-weight:600; font-size:0.85rem; color:#64748b; display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Budsjett</label>
            <div style="position:relative;">
                <i class="fas fa-coins" style="position:absolute; left:12px; top:12px; color:#C5A059;"></i>
                <select name="budget" style="width:100%; padding:12px 12px 12px 40px; border:1px solid #e2e8f0; border-radius:8px; font-size:1rem; appearance:none; background:white url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E') no-repeat right 12px center; background-size:10px;">
                    <option value="Alle">Alle priser</option>
                    <option value="0-200k" <?= ($_GET['budget']??'')=='0-200k'?'selected':'' ?>>Under 200k €</option>
                    <option value="200k-350k" <?= ($_GET['budget']??'')=='200k-350k'?'selected':'' ?>>200k - 350k €</option>
                    <option value="350k-500k" <?= ($_GET['budget']??'')=='350k-500k'?'selected':'' ?>>350k - 500k €</option>
                    <option value="500k+" <?= ($_GET['budget']??'')=='500k+'?'selected':'' ?>>Over 500k €</option>
                </select>
            </div>
        </div>

        <button class="btn btn-gold" style="width:100%; background:#C5A059; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1rem; transition:0.3s; box-shadow:0 4px 6px rgba(197, 160, 89, 0.3);">
            <i class="fas fa-search"></i> Vis Boliger
        </button>
    </form>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
        <h3 style="margin:0;"><?= $result->num_rows ?> Boliger til salgs</h3>
        <div style="font-size:0.9rem; color:#666;">Viser nyeste først</div>
    </div>
    
    <?php if ($result->num_rows > 0): ?>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:30px;">
        <?php while($row = $result->fetch_assoc()): ?>
            <a href="property.php?id=<?= $row['id'] ?>" style="text-decoration:none; color:inherit;">
                <div style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.05); transition:transform 0.3s, box-shadow 0.3s; height:100%; display:flex; flex-direction:column;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 30px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.05)'">
                    
                    <div style="height:220px; overflow:hidden; position:relative;">
                        <img src="<?= htmlspecialchars($row['image_path'] ?? 'assets/placeholder.jpg') ?>" style="width:100%; height:100%; object-fit:cover;">
                        <div style="position:absolute; top:15px; left:15px; background:rgba(26, 37, 48, 0.8); color:white; padding:5px 10px; border-radius:6px; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">
                            <?= htmlspecialchars($row['type']) ?>
                        </div>
                        <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.7), transparent); padding:20px; color:white;">
                            <div style="font-size:1.4rem; font-weight:bold;">€ <?= number_format($row['price'], 0, ',', ' ') ?></div>
                        </div>
                    </div>
                    
                    <div style="padding:25px; flex:1; display:flex; flex-direction:column;">
                        <div style="color:#C5A059; font-size:0.85rem; font-weight:bold; text-transform:uppercase; margin-bottom:5px; letter-spacing:1px;">
                            <i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($row['location']) ?>
                        </div>
                        <h3 style="margin:0 0 15px; font-size:1.2rem; line-height:1.4;"><?= htmlspecialchars($row['title']) ?></h3>
                        
                        <div style="margin-top:auto; padding-top:20px; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; color:#64748b; font-size:0.9rem;">
                            <span><i class="fas fa-bed"></i> <?= $row['bedrooms'] ?> Sov</span>
                            <span><i class="fas fa-bath"></i> <?= $row['bathrooms'] ?> Bad</span>
                            <span><i class="fas fa-ruler-combined"></i> <?= $row['area'] ?> m²</span>
                        </div>
                    </div>
                </div>
            </a>
        <?php endwhile; ?>
    </div>
    <?php else: ?>
        <div style="text-align:center; padding:60px; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
            <i class="fas fa-search" style="font-size:3rem; color:#cbd5e1; margin-bottom:20px;"></i>
            <h3>Ingen boliger funnet</h3>
            <p style="color:#64748b;">Prøv å endre søkekriteriene dine for å se flere resultater.</p>
            <a href="eiendommer.php" class="btn btn-outline" style="display:inline-block; margin-top:10px; padding:10px 20px; border:1px solid #ddd; border-radius:6px; text-decoration:none; color:#333;">Nullstill søk</a>
        </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>