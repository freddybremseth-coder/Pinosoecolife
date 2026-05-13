<?php
// api.php – Nå med Zenith AI integrasjon
session_start();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Inkluder Zenith Core filen (Sørg for at stien stemmer!)
require_once __DIR__ . '/ZenithCore.php'; 
require_once __DIR__ . '/database/Database.php';

try {
    $config = [];
    if (file_exists(__DIR__ . '/config.php')) {
        $config = require __DIR__ . '/config.php';
    }

    // 1. DIN EKSISTERENDE DATABASEKOBLING
    $db = new Database();
    $conn = $db->getConnection();

    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);
    if (!$data) $data = $_POST;

    // --- HÅNDTERING AV KONTAKTSKJEMA ---
    if (isset($data['name'])) {
        
        $name = $data['name'] ?? 'Kunde';
        $email = $data['email'] ?? '';
        $phone = $data['phone'] ?? '';
        
        // Nye felter fra skjemaet
        $area = $data['preferred_area'] ?? $data['area'] ?? '';
        $budget = $data['budget'] ?? '';
        $beds = (int)($data['bedrooms'] ?? 0);
        $notes = $data['notes'] ?? $data['message'] ?? '';
        
        $source = $data['source'] ?? 'Nettside Skjema';

        if (empty($email)) throw new Exception("E-postadresse mangler.");

        // 2. LAGRE I CRM (EKSISTERENDE LOGIKK)
        // Legger til history feltet med en gang for loggføring
        $initialHistory = json_encode([
            ['role' => 'customer', 'content' => $notes, 'date' => date('c')]
        ]);

        $stmt = $conn->prepare("INSERT INTO crm_contacts (name, email, phone, preferred_area, budget, bedrooms_req, notes, source, status, pipeline_stage, created_at, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', 'new', NOW(), ?)");
        
        // Merk: La til en ekstra 's' i typestrengen for history og variabelen $initialHistory på slutten
        $stmt->bind_param("sssssisss", $name, $email, $phone, $area, $budget, $beds, $notes, $source, $initialHistory);
        $stmt->execute();
        
        // Hent ID-en til den nye kunden for å bruke den med AI senere
        $newLeadId = $stmt->insert_id;
        $stmt->close();

        // 2B. VIDERESEND TIL REALTYFLOW (hvis API-et er tilgjengelig)
        // Nettsiden beholder lokal kopi, mens RealtyFlow kan være hoved-CRM.
        $realtyFlowUrl = $config['realtyflow_contacts_endpoint'] ?? 'https://realtyflow.chatgenius.pro/api/contacts';
        if (!empty($realtyFlowUrl) && function_exists('curl_init')) {
            $rfPayload = [
                'name' => $name,
                'email' => $email ?: null,
                'phone' => $phone ?: null,
                'source' => $source,
                'notes' => trim("Område: $area\nBudsjett: $budget\nSoverom: $beds\n\n$notes"),
                'pipeline_status' => 'NEW',
                'brand_id' => $config['realtyflow_brand_id'] ?? 'pinosoecolife',
                'created_at' => date('c'),
                'updated_at' => date('c'),
            ];

            $ch = curl_init($realtyFlowUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_POSTFIELDS => json_encode($rfPayload),
                CURLOPT_TIMEOUT => 8,
            ]);
            $rfResponse = curl_exec($ch);
            $rfStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $rfError = curl_error($ch);
            curl_close($ch);

            if ($rfError || $rfStatus >= 400) {
                error_log("RealtyFlow lead sync failed: HTTP $rfStatus $rfError $rfResponse");
            }
        }

        // 3. SEND E-POSTER (EKSISTERENDE LOGIKK - UENDRET)
        // ... (Koden for e-post til kunde og admin beholdes nøyaktig som den var) ...
        $to = $email;
        $subject = "Takk for din henvendelse – Pinoso Eco Life";
        $userMessageDisplay = nl2br(htmlspecialchars($notes));
        $criteriaDisplay = "<strong>Område:</strong> $area <br> <strong>Budsjett:</strong> $budget <br> <strong>Soverom:</strong> $beds+";

        $message = '
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: 20px auto; background: #fff; border: 1px solid #eee; padding: 40px;">
            <h2 style="color: #1A2530;">Hei ' . htmlspecialchars($name) . '!</h2>
            <p>Tusen takk for at du kontaktet oss. Jeg ser frem til å hjelpe deg med å finne den rette boligen.</p>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #C5A059; margin: 20px 0;">
                <p style="margin-top:0;"><strong>Dine preferanser:</strong><br>' . $criteriaDisplay . '</p>
                <p style="margin-bottom:0;"><strong>Din melding:</strong><br><em>"' . $userMessageDisplay . '"</em></p>
            </div>
            <p>Jeg går gjennom dine ønsker nå og tar kontakt med deg innen kort tid.</p>
            <p>Med vennlig hilsen,<br><strong>Freddy Bremseth</strong><br>Pinoso Eco Life<br>+47 960 09 965 | freddy@pinosoecolife.com</p>
          </div>
        </body>
        </html>';

        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Freddy Bremseth <freddy@pinosoecolife.com>" . "\r\n";
        
        mail($to, $subject, $message, $headers);
        mail('freddy@pinosoecolife.com', "Nytt Lead: $name", "Navn: $name\nTlf: $phone\nBudsjett: $budget\nOmråde: $area\n\nMelding:\n$notes");


        // 4. ZENITH AI INTEGRASJON (NYTT!)
        // Vi bruker en try/catch her slik at hvis AI feiler, får brukeren fortsatt suksessmelding (siden e-post og lagring gikk bra)
        try {
            // Konfigurer Zenith med samme database-info, eller hardkod det hvis Database.php er kompleks å hente info fra
            // Her antar jeg at vi må sende inn DB info på nytt siden Zenith bruker PDO og Database.php bruker MySQLi
            // Du må fylle inn DB-passordet ditt her
            $zenith = new ZenithCore(
                $config['db_host'] ?? 'localhost',
                $config['db_name'] ?? '',
                $config['db_user'] ?? '',
                $config['db_pass'] ?? '',
                $config['gemini_api_key'] ?? null
            );
            
            if (method_exists($zenith, 'analyzeLead')) {
                $zenith->analyzeLead($newLeadId);
            }

        } catch (Throwable $aiError) {
            // Logg feil, men ikke stopp scriptet. Admin får beskjed via mail uansett.
            error_log("Zenith AI Error: " . $aiError->getMessage());
        }

        echo json_encode(['status' => 'success', 'message' => 'Takk! Henvendelsen er mottatt.']);
        exit;
    }
    
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
