<?php
require_once __DIR__ . '/includes/header.php';

$config = require __DIR__ . '/config.php';
$endpoint = 'https://realtyflow.chatgenius.pro/api/plots';
$json = @file_get_contents($endpoint);
$data = $json ? json_decode($json, true) : [];
$plots = is_array($data['plots'] ?? null) ? $data['plots'] : [];

function pinoso_plot_match($plot) {
    $terms = ['pinoso', 'pinosos', 'aspe', 'monforte', 'novelda', 'la romana', 'hondon', 'hondón', 'barbarroja', 'barba-roja', 'font del llop'];
    $text = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', implode(' ', array_filter([
        $plot['plot_number'] ?? '',
        $plot['location'] ?? '',
        $plot['municipality'] ?? '',
        $plot['notes'] ?? '',
    ]))));
    foreach ($terms as $term) {
        if (strpos($text, strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $term))) !== false) return true;
    }
    return false;
}

$plots = array_values(array_filter($plots, 'pinoso_plot_match'));
?>

<section class="page-hero" style="background:linear-gradient(90deg, rgba(23,30,58,.92), rgba(23,30,58,.5)), url('assets/hero-pinoso-dream.jpg') center/cover;">
    <div class="hero-content">
        <p class="eyebrow">Tomter</p>
        <h1>Tomter i Pinoso-regionen</h1>
        <p>Tomter hentes fra RealtyFlow og prioriteres for Pinoso, Aspe, Monforte, Novelda og La Romana.</p>
    </div>
</section>

<section class="section">
    <div class="section-title">
        <span><?php echo count($plots); ?> tomter</span>
        <h2>Aktuelle tomter</h2>
    </div>
    <div class="property-grid">
        <?php foreach ($plots as $plot): ?>
            <article class="property-card">
                <div class="property-info">
                    <span class="property-location"><?php echo htmlspecialchars($plot['municipality'] ?? $plot['location'] ?? 'Pinoso-regionen'); ?></span>
                    <h3><?php echo htmlspecialchars($plot['plot_number'] ?? $plot['location'] ?? 'Tomt'); ?></h3>
                    <p class="price"><?php echo !empty($plot['price']) ? number_format((float)$plot['price'], 0, ',', ' ') . ' €' : 'Pris på forespørsel'; ?></p>
                    <div class="property-features">
                        <span><i class="fas fa-ruler-combined"></i> <?php echo number_format((float)($plot['area'] ?? 0), 0, ',', ' '); ?> m²</span>
                        <span><i class="fas fa-map"></i> <?php echo htmlspecialchars($plot['zoning'] ?? 'Ikke oppgitt'); ?></span>
                    </div>
                    <?php if (!empty($plot['notes'])): ?>
                        <p><?php echo htmlspecialchars(mb_strimwidth($plot['notes'], 0, 220, '...')); ?></p>
                    <?php endif; ?>
                </div>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
