<?php
class ZenithCore {
    private $pdo;
    private $apiKey;
    private $model = "gemini-2.0-flash"; 

    public function __construct($host, $db, $user, $pass, $apiKey = null) {
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        try {
            $this->pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        } catch (PDOException $e) { $this->pdo = null; }
        
        if ($apiKey) { $this->apiKey = $apiKey; } 
        else { $this->apiKey = $this->getConfig('gemini_api_key'); }
    }

    private function getConfig($key) {
        if (!$this->pdo) return null;
        try {
            $stmt = $this->pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
            $stmt->execute([$key]);
            return $stmt->fetchColumn();
        } catch (Exception $e) { return null; }
    }

    public function callGemini($prompt, $jsonMode = false) {
        if (empty($this->apiKey)) return "Systemfeil: Mangler API-nøkkel.";
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";
        $body = ["contents" => [["parts" => [["text" => $prompt]]]]];
        if ($jsonMode) $body["generationConfig"] = ["responseMimeType" => "application/json"];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        $result = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($result, true);
        if (isset($data['error'])) return "AI Feil: " . ($data['error']['message'] ?? 'Ukjent');
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    // --- MARKEDSFØRING & INNHOLD ---
    
    public function draftArticle($topic, $audience) {
        // HER ER DEN NYE INSTRUKSEN OM OVERSKRIFTER:
        $prompt = "
        Du er en profesjonell eiendomsjournalist for 'Pinoso Eco Life' i Spania.
        Skriv en artikkel om: $topic.
        Målgruppe: $audience.
        
        VIKTIGE REGLER FOR NORSK SPRÅK:
        1. OVERSKRIFTER: Bruk kun stor forbokstav i det aller første ordet (og i egennavn). Aldri bruk 'Title Case' (Store Bokstaver I Alle Ord).
           - RIKTIG: 'Fordeler med å kjøpe bolig i Spania'
           - FEIL: 'Fordeler Med Å Kjøpe Bolig I Spania'
        2. TONE: Tillitvekkende, varm og kunnskapsrik.
        3. FORMAT: Bruk HTML-tags (<h2>, <h3>, <p>, <ul>). Ikke bruk Markdown (##).
        ";
        
        $content = $this->callGemini($prompt, false);
        
        // Lagre i databasen
        $stmt = $this->pdo->prepare("INSERT INTO articles (title, content_json, created_at, is_published) VALUES (?, ?, NOW(), 0)");
        $json = json_encode([['type'=>'text', 'content'=>$content]]);
        $stmt->execute(["Utkast: $topic", $json]);
        
        return "Artikkel lagret som utkast.";
    }
    
    public function generateImagePrompts($topic) {
        return $this->callGemini("Lag 1 detaljert, fotorealistisk bilde-prompt på engelsk for en artikkel om: $topic. Returner kun prompten.", false);
    }
    
    public function generateHighConvertingNewsletter($topic, $offer) {
        $prompt = "Skriv nyhetsbrev om '$topic'. Tilbud: '$offer'. AIDA-modell. Returner JSON {subject, body}.";
        $json = $this->callGemini($prompt, true);
        return json_decode(preg_replace('/^```json|```$/m', '', trim($json)), true);
    }

    public function importArticleFromUrl($url) {
        $ch = curl_init($url); curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        $html = curl_exec($ch); curl_close($ch);
        $clean = substr(strip_tags($html, '<p><h1><h2><h3>'), 0, 15000);
        
        $prompt = "Lag en ny, unik artikkel basert på denne teksten.
        VIKTIG: Bruk norsk overskrift-stil (kun stor forbokstav i første ord).
        Returner JSON {title, content}. Tekst: $clean";
        
        $ai = $this->callGemini($prompt, true);
        $data = json_decode(preg_replace('/^```json|```$/m', '', trim($ai)), true);
        if($data) {
            $this->pdo->prepare("INSERT INTO articles (title, content_json, created_at) VALUES (?, ?, NOW())")->execute([$data['title'], json_encode([['type'=>'text','content'=>$data['content']]])]);
            return ['success'=>true, 'message'=>'Importert'];
        }
        return ['success'=>false, 'message'=>'Feilet'];
    }

    // --- DASHBOARD DATA ---
    public function getActivityFeed() {
        if (!$this->pdo) return [];
        $sql = "(SELECT 'lead' as type, name as title, created_at as time FROM crm_contacts) 
                UNION (SELECT 'task' as type, title, created_at as time FROM tasks) 
                ORDER BY time DESC LIMIT 10";
        try { return $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC); } catch (Exception $e) { return []; }
    }

    public function getEnrichedPipeline() {
        if (!$this->pdo) return [];
        $sql = "SELECT *, DATEDIFF(NOW(), last_activity) as days_inactive FROM crm_contacts ORDER BY created_at DESC";
        try { $stmt = $this->pdo->query($sql); return $stmt->fetchAll(PDO::FETCH_ASSOC); } catch (Exception $e) { return []; }
    }

    // --- E-POST & TASKS ---
    public function checkInbox($filter = 'all') { return []; } // Forenklet for demo
    public function sendEmail($to, $subject, $message) { return mail($to, $subject, $message) ? "Sendt" : "Feil"; }
}
?>