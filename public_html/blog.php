<?php
require_once 'database/Database.php';
include 'includes/header.php';

$db = new Database();
$conn = $db->getConnection();
$articles = $conn->query("SELECT * FROM articles WHERE is_published = 1 ORDER BY created_at DESC");
?>

<div class="hero" style="height: 50vh; background: url('assets/magasin.jpg') center/cover no-repeat; position: relative; display: flex; align-items: center; justify-content: center; color: white; text-align: center;">
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4);"></div> <div class="hero-content" style="position: relative; z-index: 2;">
        <h1 style="font-size: 3.5rem; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Zen Magasinet</h1>
        <p style="font-size: 1.5rem;">Inspirasjon, guider og nyheter om boligmarkedet i Spania.</p>
    </div>
</div>

<div class="container" style="padding: 80px 20px;">
    <div class="grid-3" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
        <?php if ($articles->num_rows > 0): ?>
            <?php while($row = $articles->fetch_assoc()): 
                $img = !empty($row['image_path_1']) ? $row['image_path_1'] : 'assets/blog.jpg';
            ?>
            <a href="blog-post.php?id=<?= $row['id'] ?>" class="prop-card" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                <div class="prop-img-wrap" style="height: 250px; overflow: hidden;">
                    <img src="<?= htmlspecialchars($img) ?>" class="prop-img" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;">
                </div>
                <div class="prop-info" style="padding: 25px; display: flex; flex-direction: column; flex-grow: 1;">
                    <div style="color:var(--zen-gold); font-size:0.8rem; font-weight:bold; margin-bottom: 10px;">
                        <?= date('d.m.Y', strtotime($row['created_at'])) ?>
                    </div>
                    <h3 class="prop-title" style="margin: 0 0 10px; font-size: 1.3rem;"><?= htmlspecialchars($row['title']) ?></h3>
                    <p style="font-size:0.95rem; color:#666; line-height: 1.6; margin-bottom: 20px; flex-grow: 1;">
                        <?= substr(strip_tags($row['meta_description']), 0, 120) ?>...
                    </p>
                    <span style="color:var(--zen-dark); font-weight:bold; font-size:0.9rem; text-transform: uppercase; letter-spacing: 1px;">Les artikkel &rarr;</span>
                </div>
            </a>
            <?php endwhile; ?>
        <?php else: ?>
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <p>Ingen artikler ennå. Gå til Admin -> AI Generator for å skrive en!</p>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include 'includes/footer.php'; ?>