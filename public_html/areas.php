<?php include 'includes/header.php'; ?>

<div class="hero" style="height: 50vh; background-image: url('assets/areas.jpg');">
    <div class="hero-content">
        <h1>Utforsk Områdene</h1>
        <p>Fra pulserende kystbyer til rolige vinområder.</p>
    </div>
</div>

<div class="container">
    
    <div class="grid-2" style="margin-bottom: 80px;">
     <img src="assets/areas.jpg" alt="Områder Costa Blanca" style="width: 100%; height: auto; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); object-fit: cover;">
        <div>
            <h2>Costa Blanca Nord</h2>
            <p>Kjent for sine dramatiske fjell, grønne daler og eksklusive bukter. Her finner du byer som Altea, Calpe, Moraira og Javea.</p>
            <ul style="margin-bottom: 20px;">
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Mer vegetasjon og kupert terreng</li>
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Eksklusive villaområder</li>
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Fantastisk utsikt</li>
            </ul>
            <a href="eiendommer.php?region=Costa+Blanca+North" class="btn btn-dark">Se boliger i Nord</a>
        </div>
    </div>

    <div class="grid-2" style="margin-bottom: 80px;">
        <div style="order: 2;"> <img src="https://images.unsplash.com/photo-1564852694965-976f0c8ae38a?auto=format&fit=crop&w=800&q=80" style="border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        </div>
        <div style="order: 1;">
            <h2>Costa Blanca Sør</h2>
            <p>Kjent for sine lange, hvite sandstrender og saltvannslaguner. Torrevieja, Orihuela Costa og Ciudad Quesada er populære valg her.</p>
            <ul style="margin-bottom: 20px;">
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Flatere terreng, ideelt for sykling</li>
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Noe rimeligere prisnivå</li>
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Stort norsk miljø</li>
            </ul>
            <a href="eiendommer.php?region=Costa+Blanca+South" class="btn btn-dark">Se boliger i Sør</a>
        </div>
    </div>

    <div class="grid-2">
        <img src="https://images.unsplash.com/photo-1533658286927-46a29777926b?auto=format&fit=crop&w=800&q=80" style="border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div>
            <h2>Innlandet & Costa Calida</h2>
            <p>For deg som søker det autentiske Spania. Områder som Pinoso og Hondon-dalen tilbyr ro, vingårder og store tomter.</p>
            <ul style="margin-bottom: 20px;">
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Mye bolig for pengene</li>
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Ekte spansk landsbyliv</li>
                <li><i class="fas fa-check" style="color:var(--zen-gold);"></i> Store, private tomter</li>
            </ul>
            <a href="eiendommer.php?region=Costa+Calida" class="btn btn-dark">Se boliger i Innlandet</a>
        </div>
    </div>

</div>

<?php include 'includes/footer.php'; ?>