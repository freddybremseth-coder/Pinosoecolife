<?php
// --- 1. SETUP & FEILSØKING ---
ini_set('display_errors', 1); 
error_reporting(E_ALL);

// Sjekk at stien til Database.php er riktig
require_once 'database/Database.php';
include 'includes/header.php'; 

$db = new Database();
$conn = $db->getConnection();

// --- 2. HENT DATA ---
// Hent de nyeste boligene til oversikten
$latest = $conn->query("SELECT * FROM properties ORDER BY created_at DESC LIMIT 9");
?>

<div class="hero-video-container">
    <video autoplay muted loop playsinline class="hero-video" poster="assets/hero-video.mp4">
        <source src="assets/hero-video.mp4" type="video/mp4">
    </video>

    <div class="hero-content">
        <h1>Ditt norske hjem i Spania</h1>
        <p>Vi spesialiserer oss på moderne, energieffektive nybygg og trygge kjøp på Costa Blanca.</p>
        
        <form action="eiendommer.php" method="GET" class="search-wrapper-hero">
            <input type="text" name="q" class="search-input-hero" placeholder="Hvor vil du bo? (f.eks Altea)">
            <select name="type" class="search-input-hero">
                <option value="">Type bolig</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Leilighet</option>
            </select>
            <button type="submit" class="btn btn-gold">SØK</button>
        </form>
    </div>
</div>

<div class="container">
    <div class="section-title">
        <h2>Hvorfor velge Pinoso Eco Life?</h2>
        <p>Vi er din norske partner som sikrer kvalitet, bærekraft og trygghet i hele kjøpsprosessen.</p>
    </div>
    
    <div class="grid-3">
        <div class="icon-box">
            <i class="fas fa-handshake"></i>
            <h3>Norsk Trygghet</h3>
            <p>Ingen språkproblemer eller misforståelser. Vi følger deg fra visning til skjøte.</p>
        </div>
        <div class="icon-box">
            <i class="fas fa-leaf" style="color:#27ae60;"></i>
            <h3>Bærekraft</h3>
            <p>Fokus på moderne boliger med høy energiklasse som sparer både miljøet og strømregningen.</p>
        </div>
        <div class="icon-box">
            <i class="fas fa-star"></i>
            <h3>Eksklusivitet</h3>
            <p>Vi finner perlene som ikke alltid ligger ute på det åpne markedet.</p>
        </div>
    </div>
</div>

<div class="section-dark">
    <div class="container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px; flex-wrap:wrap; gap:20px;">
            <h2 style="color:white; margin:0;">Nye Prosjekter</h2>
            <a href="eiendommer.php" class="btn btn-outline">Se alle</a>
        </div>

        <div class="grid-3">
            <?php if ($latest && $latest->num_rows > 0): ?>
                <?php while($row = $latest->fetch_assoc()): 
                    $img = !empty($row['image_path']) ? $row['image_path'] : 'assets/placeholder.jpg';
                ?>
                <a href="property.php?id=<?= $row['id'] ?>" class="prop-card">
                    <div class="prop-img-wrap">
                        <img src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($row['title']) ?>" class="prop-img">
                    </div>
                    <div class="prop-info">
                        <span class="prop-location-top"><?= htmlspecialchars($row['location']) ?></span>
                        <h3 class="prop-title"><?= htmlspecialchars($row['title']) ?></h3>
                        <div class="prop-price">€ <?= number_format($row['price'], 0, ',', ' ') ?></div>
                    </div>
                </a>
                <?php endwhile; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<div id="kontakt" class="section-bg">
    <div class="container">
        <div class="grid-2">
            <div>
                <h2>Klar for en prat?</h2>
                <p style="font-size:1.1rem; margin-bottom:30px;">Prøv vår <strong>AI Matchmaker</strong>. Fortell oss hva du ser etter, så finner vi de perfekte objektene for deg.</p>
                
                <div style="margin: 30px 0;">
                    <strong style="display:block; font-size:1.1rem; color:var(--zen-dark);">Freddy Bremseth</strong>
                    <span style="color:#666; font-size:0.95rem;">Grunnlegger</span>
                </div>

                <div class="contact-info-list">
                    <div class="contact-row">
                        <div class="contact-icon"><i class="fas fa-phone"></i></div>
                        <div>
                            <small style="text-transform:uppercase; color:#888; font-size:0.75rem; font-weight:600;">Ring oss</small><br>
                            <strong style="color:var(--zen-dark); font-size:1rem;">+47 9600 9965</strong>
                        </div>
                    </div>
                    <div class="contact-row">
                        <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                        <div>
                            <small style="text-transform:uppercase; color:#888; font-size:0.75rem; font-weight:600;">Send e-post</small><br>
                            <strong style="color:var(--zen-dark); font-size:1rem;">freddy@pinosoecolife.com</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contact-box" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <form id="contactForm" class="contact-form">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Navn</label>
                            <input type="text" name="name" required placeholder="Ditt navn" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                        </div>
                        <div>
                            <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Telefon</label>
                            <input type="tel" name="phone" required placeholder="+47..." class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                        </div>
                    </div>

                    <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">E-post</label>
                    <input type="email" name="email" required placeholder="din@epost.no" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px; margin-bottom:15px;">

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Område</label>
                            <select name="preferred_area" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                                <option value="Costa Blanca Nord">Costa Blanca Nord</option>
                                <option value="Costa Calida">Costa Calida</option>
                                <option value="Innlandet (Biar/Pinoso)">Innlandet (Biar/Pinoso)</option>
                                <option value="Åpen for forslag">Åpen for forslag</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Budsjett (€)</label>
                            <input type="text" name="budget" placeholder="f.eks 300 000" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                        </div>
                    </div>

                    <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Atmosfære / Livsstil</label>
                    <select name="lifestyle" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px; margin-bottom:15px;">
                        <option value="Landlig & Spansk">Landlig & Spansk (Finca/Gård)</option>
                        <option value="Internasjonalt & Puls">Internasjonalt & Puls (By/Strand)</option>
                        <option value="Rolig Villastrøk">Rolig Villastrøk</option>
                    </select>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Boligtype</label>
                            <select name="property_type" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                                <option value="Nybygg">Nybygg (Moderne)</option>
                                <option value="Bruktbolig">Bruktbolig</option>
                                <option value="Finca/Gård">Finca/Gård</option>
                                <option value="Leilighet">Leilighet</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Min. soverom</label>
                            <input type="number" name="bedrooms" min="1" placeholder="2" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px;">
                        </div>
                    </div>

                    <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Tidslinje for kjøp</label>
                    <select name="timeline" class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px; margin-bottom:20px;">
                        <option value="Klar nå">Klar nå</option>
                        <option value="Innen 3 mnd">Innen 3 mnd</option>
                        <option value="6-12 mnd">6-12 mnd</option>
                        <option value="Planlegger fremtidig pensjon">Planlegger fremtidig pensjon</option>
                    </select>
                    
                    <label class="form-label" style="font-weight:600; display:block; margin-bottom:5px;">Utfyllende ønsker</label>
                    <textarea name="notes" placeholder="Fortell oss gjerne mer om dine drømmer og behov..." class="form-input" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:5px; height: 100px; margin-bottom: 20px;"></textarea>
                    
                    <button type="submit" class="btn-submit" style="width:100%; background: #C5A059; color: white; padding: 15px; border: none; border-radius: 5px; font-weight: 700; cursor: pointer; text-transform: uppercase;">Finn mitt hjem</button>
                    <div id="formResponse" style="margin-top:15px; text-align:center; font-weight:600;"></div>
                </form>
            </div>
        </div>
    </div>
</div>

<div class="section-dark" style="padding: 20px 0;">
    <div class="container" style="text-align: right;">
        <a href="login.php" class="btn btn-outline" style="background: transparent; border: 1px solid #C5A059; color: #C5A059; padding: 10px 20px;">
            Admin Logg Inn
        </a>
    </div>
</div>

<script>
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('button');
    const resp = document.getElementById('formResponse');
    
    // 1. Samle inn data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    // Legg til kilde slik at Hub-en vet at leadet kommer fra PinosoHomes
    data.source = 'PinosoHomes';
    
    // 2. Rensk budsjett-feltet (sikrer at det kun sendes som tall)
    if (data.budget) {
        data.budget = data.budget.replace(/\D/g, '');
    }

    btn.disabled = true; 
    btn.innerText = "Behandler din forespørsel...";
    
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            resp.innerHTML = "<span style='color:#27ae60;'>✓ Takk! Vi har mottatt dine ønsker.</span>";
            btn.innerText = "Sendt!";
            this.reset();
        } else {
            throw new Error("Webhook feilet");
        }
    } catch (error) {
        resp.innerHTML = "<span style='color:#ef4444;'>Feil ved sending. Prøv igjen eller kontakt oss direkte.</span>";
        btn.disabled = false;
        btn.innerText = "Prøv igjen";
        console.error("Feil:", error);
    }
});
</script>

<?php include 'includes/footer.php'; ?>
