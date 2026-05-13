<?php
require_once 'database/Database.php';
include 'includes/header.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$db = new Database();
$conn = $db->getConnection();

// Hent artikkel
$stmt = $conn->prepare("SELECT * FROM articles WHERE id = ? AND is_published = 1");
$stmt->bind_param("i", $id);
$stmt->execute();
$article = $stmt->get_result()->fetch_assoc();

// Hvis ingen artikkel finnes, send til forsiden
if (!$article) {
    header("Location: index.php");
    exit;
}

// --- FUNKSJON FOR Å FIKSE TEKSTFORMATERING ---
function formatMarkdown($text) {
    // 1. Overskrifter (## Tittel -> <h2>Tittel</h2>)
    $text = preg_replace('/^## (.*)$/m', '<h2 style="font-family:\'Playfair Display\', serif; color:var(--zen-dark); margin-top:40px; margin-bottom:15px; font-size:1.8rem;">$1</h2>', $text);
    
    // 2. Fet tekst (**Tekst** -> <strong>Tekst</strong>)
    $text = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $text);
    
    // 3. Kursiv (*Tekst* -> <em>Tekst</em>)
    $text = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $text);
    
    // 4. Punktlister (* Punkt -> <li>Punkt</li>)
    // Vi pakker ikke inn i <ul> her for enkelhets skyld, men styler <li> direkte
    $text = preg_replace('/^\* (.*)$/m', '<div style="display:flex; align-items:start; margin-bottom:10px; margin-left:10px;"><span style="color:var(--zen-gold); margin-right:10px; font-size:1.2rem;">•</span> <span>$1</span></div>', $text);
    
    // 5. Linjeskift (Gjør om enter-trykk til <br> eller <p>)
    $text = nl2br($text);
    
    return $text;
}

// Dekod JSON-innholdet fra databasen
$contentBlocks = json_decode($article['content_json'], true);
// Hvis det ikke er JSON, men ren tekst (gammel data), legg det i en array
if (!$contentBlocks) {
    $contentBlocks = [['type' => 'text', 'content' => $article['content_json']]];
}
?>

<div class="hero-small" style="height: 50vh; position: relative; overflow: hidden; display:flex; align-items:center; justify-content:center;">
    <?php if(!empty($article['image_path_1'])): ?>
        <img src="<?= htmlspecialchars($article['image_path_1']) ?>" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4);"></div>
    <?php else: ?>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--zen-dark);"></div>
    <?php endif; ?>
    
    <div class="container" style="position: relative; z-index: 2; text-align: center; color: white;">
        <span style="background:var(--zen-gold); padding:5px 15px; text-transform:uppercase; font-size:0.8rem; font-weight:bold; letter-spacing:1px;">
            <?= htmlspecialchars($article['category']) ?>
        </span>
        <h1 style="font-size: 3rem; margin-top: 20px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            <?= htmlspecialchars($article['title']) ?>
        </h1>
        <p style="opacity: 0.9; font-size: 1.1rem;">
            Publisert: <?= date('d.m.Y', strtotime($article['created_at'])) ?>
        </p>
    </div>
</div>

<div class="container" style="max-width: 800px; padding: 60px 20px;">
    
    <div class="article-content" style="font-size: 1.15rem; line-height: 1.8; color: #444;">
        <?php 
        foreach ($contentBlocks as $block) {
            if ($block['type'] === 'text') {
                // Her bruker vi den nye funksjonen vår!
                echo formatMarkdown($block['content']);
            } 
            elseif ($block['type'] === 'image') {
                echo '<img src="' . htmlspecialchars($block['src']) . '" style="width:100%; border-radius:8px; margin:40px 0;">';
                if(!empty($block['caption'])) echo '<p style="font-size:0.9rem; color:#888; text-align:center; margin-top:-30px;">'.$block['caption'].'</p>';
            }
        }
        ?>
    </div>

    <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #eee; text-align: center;">
        <h3 style="margin-bottom: 20px;">Klar for å realisere drømmen?</h3>
        <p>Vi hjelper deg med å finne den perfekte boligen eller tomten.</p>
        <div style="margin-top: 20px;">
            <a href="index.php#kontakt" class="btn btn-gold">Kontakt oss</a>
            <a href="eiendommer.php" class="btn btn-outline" style="margin-left: 10px; color: var(--zen-dark); border-color: var(--zen-dark);">Se boliger</a>
        </div>
    </div>

</div>

<div style="background: var(--zen-sage); padding: 60px 0;">
    <div class="container">
        <h3 style="text-align: center; margin-bottom: 40px;">Mer fra magasinet</h3>
        <div class="grid-3">
            <?php 
            $related = $conn->query("SELECT * FROM articles WHERE id != $id AND is_published = 1 ORDER BY created_at DESC LIMIT 3");
            while($rel = $related->fetch_assoc()):
                $img = $rel['image_path_1'] ?: 'assets/placeholder.jpg';
            ?>
            <a href="blog-post.php?id=<?= $rel['id'] ?>" class="prop-card">
                <div class="prop-img-wrap" style="height: 200px;">
                    <img src="<?= htmlspecialchars($img) ?>" class="prop-img">
                </div>
                <div class="prop-info">
                    <h4 style="margin: 0 0 10px;"><?= htmlspecialchars($rel['title']) ?></h4>
                    <span style="color: var(--zen-gold); font-size: 0.9rem;">Les mer &rarr;</span>
                </div>
            </a>
            <?php endwhile; ?>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>