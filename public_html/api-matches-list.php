<?php
require_once 'database/Database.php';
$db = new Database();
$conn = $db->getConnection();
$cid = (int)$_GET['client_id'];

$sql = "SELECT cm.*, p.title, p.price, p.image_path 
        FROM client_matches cm 
        JOIN properties p ON cm.property_id = p.id 
        WHERE cm.client_id = $cid 
        ORDER BY cm.matched_at DESC";
$res = $conn->query($sql);

if ($res->num_rows == 0) { echo "<div style='padding:20px; text-align:center; color:#999;'>Ingen boliger matchet/sendt ennå.</div>"; exit; }

while($row = $res->fetch_assoc()): ?>
    <div style="display:flex; gap:10px; border-bottom:1px solid #eee; padding:10px 0;">
        <img src="<?= $row['image_path'] ?>" style="width:60px; height:40px; object-fit:cover; border-radius:4px;">
        <div style="flex:1;">
            <div style="font-weight:bold; font-size:0.9rem;"><?= htmlspecialchars($row['title']) ?></div>
            <div style="font-size:0.8rem; color:#666;">
                <i class="fas fa-check-circle" style="color:green;"></i> Sendt <?= date('d.m H:i', strtotime($row['matched_at'])) ?>
            </div>
            <div style="font-size:0.8rem; background:#f9f9f9; padding:5px; margin-top:5px; font-style:italic;">
                "<?= htmlspecialchars($row['ai_teaser']) ?>"
            </div>
        </div>
    </div>
<?php endwhile; ?>