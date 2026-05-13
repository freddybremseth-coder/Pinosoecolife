<?php include 'includes/header.php'; ?>

<div class="hero" style="height: 50vh; background-image: url('assets/process.jpg');">
    <div class="hero-content">
        <h1>Veien til din spanske bolig</h1>
        <p>En steg-for-steg guide til en trygg handel.</p>
    </div>
</div>

<div class="container">
    <div class="section-title">
        <h2>Slik fungerer kjøpsprosessen</h2>
        <p>Vi holder deg i hånden fra første visning til nøkkeloverlevering.</p>
    </div>

    <div class="timeline" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; gap: 30px; margin-bottom: 50px;">
            <div style="flex-shrink: 0; width: 60px; height: 60px; background: var(--zen-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">1</div>
            <div>
                <h3>Kartlegging & Søk</h3>
                <p>Vi starter med en samtale for å forstå dine behov. Hvor vil du bo? Hva er budsjettet? Vi sender deg forslag og avtaler visninger (fysisk eller video).</p>
            </div>
        </div>

        <div style="display: flex; gap: 30px; margin-bottom: 50px;">
            <div style="flex-shrink: 0; width: 60px; height: 60px; background: var(--zen-dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">2</div>
            <div>
                <h3>Reservasjon & NIE</h3>
                <p>Når du finner drømmeboligen, signerer vi en reservasjonskontrakt og betaler et depositum (vanligvis €6.000) for å ta boligen av markedet. Vi hjelper deg også med å skaffe NIE-nummer (spansk personnummer).</p>
            </div>
        </div>

        <div style="display: flex; gap: 30px; margin-bottom: 50px;">
            <div style="flex-shrink: 0; width: 60px; height: 60px; background: var(--zen-dark); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">3</div>
            <div>
                <h3>Juridisk Sjekk & Kjøpekontrakt</h3>
                <p>Våre advokater sjekker at eiendommen er gjeldfri og lovlig. Deretter signeres den private kjøpekontrakten, og en delbetaling (ofte 10%) overføres.</p>
            </div>
        </div>

        <div style="display: flex; gap: 30px;">
            <div style="flex-shrink: 0; width: 60px; height: 60px; background: var(--zen-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">4</div>
            <div>
                <h3>Skjøte & Overtakelse</h3>
                <p>Den store dagen! Vi møtes hos Notarius Publicus for å signere skjøtet og betale restbeløpet. Du får nøklene, og vi hjelper deg med å sette opp strøm, vann og internett.</p>
            </div>
        </div>
    </div>
<div class="container" style="padding: 40px 20px;">
    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
        
        <h2 style="margin-bottom: 25px; color: var(--zen-dark, #333);">Se vår kjøpsprosess</h2>

        <div style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); background: #000;">
            
            <video controls style="width: 100%; height: auto; display: block;">
                <source src="/assets/process.mp4" type="video/mp4">
                Din nettleser støtter ikke videoavspilling.
            </video>

            <div style="
                position: absolute; 
                bottom: 0; 
                left: 0; 
                width: 100%; 
                height: 12%; /* Hvor høyt opp skyggen skal gå (ca 10-15%) */
                background: linear-gradient(to bottom, transparent 0%, black 100%);
                pointer-events: none; /* VIKTIG: Gjør at man kan klikke 'gjennom' skyggen på play-knappen */
                z-index: 5;
            "></div>

        </div>
        
    </div>
</div>
    <div style="text-align: center; margin-top: 80px; padding: 40px; background: var(--zen-sage); border-radius: 8px;">
        <h3>Klar til å starte?</h3>
        <p>Ta kontakt i dag for en uforpliktende prat om dine muligheter.</p>
        <a href="index.php#kontakt" class="btn btn-gold">Kontakt oss</a>
    </div>
</div>

<?php include 'includes/footer.php'; ?>