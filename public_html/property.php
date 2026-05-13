<?php
require_once 'database/Database.php';
include 'includes/header.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->prepare("SELECT * FROM properties WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$prop = $stmt->get_result()->fetch_assoc();

if (!$prop) { 
    echo "<div style='padding:100px; text-align:center;'><h2>Bolig ikke funnet</h2></div>"; 
    include 'includes/footer.php'; 
    exit; 
}

// --- BILDEHÅNDTERING ---
$gallery = json_decode($prop['images_json'] ?? '[]', true);
if (empty($gallery) && !empty($prop['image_path'])) $gallery = [$prop['image_path']];
if (empty($gallery)) $gallery = ['assets/placeholder.jpg'];

// --- AVANSERT TEKSTRENSING MED AUTO-FORMATERING ---
function cleanTextAdvanced($text) {
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = str_replace(['&#13;', '&#10;', '&amp;#13;', '&amp;#10;'], "\n", $text);
    $text = preg_replace("/[\r\n]+/", "\n", $text);
    
    // Split i linjer
    $lines = explode("\n", $text);
    $formatted = [];
    $inList = false;
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;
        
        // Detekter liste-elementer (starter med -, *, •, eller er korte setninger med spesifikke ord)
        if (preg_match('/^[-*•]\s+(.+)/', $line, $match)) {
            if (!$inList) {
                $formatted[] = '<ul class="prop-list">';
                $inList = true;
            }
            $formatted[] = '<li>' . $match[1] . '</li>';
        }
        // Detekter linjer som ser ut som liste-elementer (begynner med stor bokstav, ingen punktum på slutten)
        elseif (preg_match('/^[A-ZÆØÅ]/', $line) && !preg_match('/[.!?]$/', $line) && strlen($line) < 150) {
            if (!$inList) {
                $formatted[] = '<ul class="prop-list">';
                $inList = true;
            }
            $formatted[] = '<li>' . $line . '</li>';
        }
        else {
            if ($inList) {
                $formatted[] = '</ul>';
                $inList = false;
            }
            $formatted[] = '<p>' . $line . '</p>';
        }
    }
    
    if ($inList) {
        $formatted[] = '</ul>';
    }
    
    return implode("\n", $formatted);
}

$cleanDesc = cleanTextAdvanced($prop['description']);
?>

<style>
.gallery-container {
    margin-bottom: 40px;
}

.main-image-wrapper {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 15px;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.3s;
    z-index: 10;
}

.gallery-nav:hover {
    background: rgba(0,0,0,0.8);
}

.gallery-nav.prev { left: 20px; }
.gallery-nav.next { right: 20px; }

.thumbnail-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
}

.thumbnail {
    height: 80px;
    border-radius: 4px;
    cursor: pointer;
    object-fit: cover;
    border: 3px solid transparent;
    transition: 0.3s;
}

.thumbnail:hover {
    opacity: 0.8;
}

.thumbnail.active {
    border-color: var(--zen-gold);
}

.image-counter {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: bold;
}

.prop-list {
    background: #f8f9fa;
    padding: 25px 25px 25px 45px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid var(--zen-gold);
}

.prop-list li {
    margin-bottom: 12px;
    line-height: 1.7;
    position: relative;
}

.prop-list li:before {
    content: "✓";
    position: absolute;
    left: -25px;
    color: var(--zen-gold);
    font-weight: bold;
    font-size: 1.2rem;
}

.contact-sidebar {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    padding: 35px;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    position: sticky;
    top: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
}

.contact-sidebar h3 {
    font-size: 1.5rem;
    color: var(--zen-dark);
    margin-bottom: 10px;
}

.form-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
    color: #555;
}

.form-input {
    width: 100%;
    padding: 12px;
    margin-bottom: 0;
    border: 1px solid #ddd;
    background: #fafafa;
    border-radius: 4px;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-input:focus {
    border-color: var(--zen-gold);
    background: white;
    outline: none;
    box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.1);
}

.btn-submit {
    width: auto;
    padding: 18px 40px;
    background: linear-gradient(135deg, var(--zen-gold) 0%, var(--zen-gold-hover) 100%);
    color: white;
    border: none;
    font-weight: bold;
    cursor: pointer;
    text-transform: uppercase;
    border-radius: 4px;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(197, 160, 89, 0.3);
    font-size: 1rem;
}

.btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(197, 160, 89, 0.4);
}
</style>

<div style="background:#fff; border-bottom:1px solid #eee; padding:20px 0;">
    <div class="container" style="padding:0 20px; margin:0 auto;">
        <a href="eiendommer.php" style="font-size:0.8rem; color:#999; text-transform:uppercase;">← Tilbake</a>
        <h1 style="margin:5px 0; font-size:2rem;"><?= htmlspecialchars($prop['title']) ?></h1>
        <div style="color:var(--zen-gold); font-weight:bold;"><i class="fas fa-map-marker-alt"></i> <?= htmlspecialchars($prop['location']) ?></div>
    </div>
</div>

<div class="container">

    <!-- GALLERI MED THUMBNAIL NAVIGASJON -->
    <div class="gallery-container">
        <div class="main-image-wrapper">
            <img id="mainImage" src="<?= htmlspecialchars($gallery[0]) ?>" class="main-image" alt="Boligbilde">
            
            <?php if(count($gallery) > 1): ?>
                <button class="gallery-nav prev" onclick="changeImage(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="gallery-nav next" onclick="changeImage(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="image-counter">
                    <span id="currentIndex">1</span> / <?= count($gallery) ?>
                </div>
            <?php endif; ?>
        </div>

        <?php if(count($gallery) > 1): ?>
        <div class="thumbnail-container">
            <?php foreach($gallery as $index => $img): ?>
                <img src="<?= htmlspecialchars($img) ?>" 
                     class="thumbnail <?= $index === 0 ? 'active' : '' ?>" 
                     onclick="showImage(<?= $index ?>)" 
                     alt="Thumbnail <?= $index + 1 ?>">
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>

    <div class="property-layout">
        
        <div>
            <!-- MODERNE NØKKELINFORMASJON MED GRADIENT -->
            <div style="background: linear-gradient(135deg, #E8F1EE 0%, #d4e7e1 100%); border-left: 5px solid var(--zen-gold); padding: 35px; border-radius: 12px; margin-bottom: 40px; box-shadow: 0 5px 20px rgba(0,0,0,0.08);">
                <h3 style="margin-top:0; margin-bottom:25px; font-size:1.2rem; text-transform:uppercase; color:var(--zen-dark); display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-info-circle" style="color:var(--zen-gold);"></i>
                    Nøkkelinformasjon
                </h3>
                <div class="key-info-grid">
                    <div class="key-item">
                        <i class="fas fa-tag"></i> 
                        <span>Pris: <strong style="color:var(--zen-dark);">€ <?= number_format($prop['price'], 0, ',', ' ') ?></strong></span>
                    </div>
                    <div class="key-item">
                        <i class="fas fa-home"></i> 
                        <span>Type: <strong><?= htmlspecialchars($prop['type']) ?></strong></span>
                    </div>
                    <div class="key-item">
                        <i class="fas fa-bed"></i> 
                        <span>Soverom: <strong><?= $prop['bedrooms'] ?></strong></span>
                    </div>
                    <div class="key-item">
                        <i class="fas fa-bath"></i> 
                        <span>Bad: <strong><?= $prop['bathrooms'] ?></strong></span>
                    </div>
                    <div class="key-item">
                        <i class="fas fa-ruler-combined"></i> 
                        <span>Areal: <strong><?= $prop['area'] ?> m²</strong></span>
                    </div>
                    <div class="key-item">
                        <i class="fas fa-hashtag"></i> 
                        <span>Ref: <strong><?= htmlspecialchars($prop['external_id']) ?></strong></span>
                    </div>
                </div>
            </div>

            <div class="prop-text">
                <h3>Om Boligen</h3>
                <?= $cleanDesc ?>
            </div>
        </div>

        <div>
            <div class="contact-sidebar">
                <h3>Interessert?</h3>
                <p style="margin-bottom:25px; font-size:0.95rem; color:#666; line-height:1.6;">Fyll ut skjemaet, så kontakter vi deg innen 24 timer.</p>
                
                <form id="contactForm" style="display:flex; flex-direction:column;">
                    <input type="hidden" name="source" value="Bolig: <?= htmlspecialchars($prop['title']) ?>">
                    
                    <div style="margin-bottom:15px;">
                        <label class="form-label" style="color:var(--zen-dark); font-size:0.85rem; display:block; margin-bottom:8px;">Navn *</label>
                        <input type="text" name="name" class="form-input" required placeholder="Ditt fulle navn" style="width:100%;">
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <label class="form-label" style="color:var(--zen-dark); font-size:0.85rem; display:block; margin-bottom:8px;">E-post *</label>
                        <input type="email" name="email" class="form-input" required placeholder="din@epost.no" style="width:100%;">
                    </div>
                    
                    <div style="margin-bottom:15px;">
                        <label class="form-label" style="color:var(--zen-dark); font-size:0.85rem; display:block; margin-bottom:8px;">Telefon *</label>
                        <input type="text" name="phone" class="form-input" required placeholder="+47 ..." style="width:100%;">
                    </div>
                    
                    <div style="margin-bottom:20px;">
                        <label class="form-label" style="color:var(--zen-dark); font-size:0.85rem; display:block; margin-bottom:8px;">Melding</label>
                        <textarea name="message" class="form-input" rows="5" placeholder="Fortell oss om dine ønsker og spørsmål..." style="resize:vertical; min-height:120px; width:100%;"></textarea>
                    </div>
                    
                    <button type="submit" class="btn-submit" style="padding:18px 40px; font-size:1rem; max-width:fit-content; align-self:center;">
                        <i class="fas fa-paper-plane" style="margin-right:8px;"></i>
                        Send Forespørsel
                    </button>
                    <div id="resp" style="margin-top:15px; text-align:center; font-weight:600;"></div>
                </form>
                
                <div style="margin-top:30px; padding-top:25px; border-top:2px solid #e0e0e0;">
                    <p style="font-size:0.85rem; color:#888; text-align:center; margin:0;">
                        <i class="fas fa-shield-alt" style="color:var(--zen-gold); margin-right:5px;"></i>
                        Dine opplysninger behandles konfidensielt
                    </p>
                </div>
            </div>
        </div>

    </div>
</div>

<script>
// Galleri JavaScript
const gallery = <?= json_encode($gallery) ?>;
let currentIndex = 0;

function showImage(index) {
    currentIndex = index;
    document.getElementById('mainImage').src = gallery[index];
    document.getElementById('currentIndex').textContent = index + 1;
    
    // Oppdater aktiv thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function changeImage(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = gallery.length - 1;
    if (currentIndex >= gallery.length) currentIndex = 0;
    showImage(currentIndex);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') changeImage(-1);
    if (e.key === 'ArrowRight') changeImage(1);
});

// Kontaktskjema
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('button');
    btn.innerText = "Sender..."; 
    btn.disabled = true;
    const fd = new FormData(this);
    
    fetch('api.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(d => {
        document.getElementById('resp').innerHTML = `<span style="color:green; font-weight:bold;">Takk! Vi tar kontakt.</span>`;
        btn.innerText = "Sendt!";
        this.reset();
    })
    .catch(e => {
        document.getElementById('resp').innerHTML = `<span style="color:red;">Feil. Prøv igjen.</span>`;
        btn.innerText = "Send Forespørsel"; 
        btn.disabled = false;
    });
});
</script>

<?php include 'includes/footer.php'; ?>