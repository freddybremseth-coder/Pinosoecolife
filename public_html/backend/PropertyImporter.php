<?php
require_once __DIR__ . '/Database.php';

class PropertyImporter {
    private $conn;

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    public function import($source, $isUrl = false) {
        if ($isUrl) return $this->processXML($source);
        return ['success' => false, 'message' => 'Kun XML støttes for utbygger-kobling.'];
    }

    private function processXML($url) {
        set_time_limit(600);
        $xmlContent = @file_get_contents($url);
        if (!$xmlContent) return ['success' => false, 'message' => 'Kunne ikke lese URL.'];
        
        $xml = @simplexml_load_string($xmlContent);
        if ($xml === false) return ['success' => false, 'message' => 'Ugyldig XML.'];

        $stats = ['updated' => 0, 'inserted' => 0];

        foreach ($xml->property as $p) {
            // 1. FINN ELLER OPPRETT UTBYGGER
            // RedSP XML har ofte <developer> eller <development> tag
            $devName = trim((string)($p->developer ?? $p->development ?? 'Ukjent Utbygger'));
            $devId = 0;

            if ($devName !== '' && $devName !== 'Ukjent Utbygger') {
                $devId = $this->getOrCreateDeveloper($devName);
            }

            // 2. VANLIG BOLIGDATA
            $ref = (string)$p->ref ?: (string)$p->id;
            
            // Bilder
            $gallery = [];
            if(isset($p->images->image)) {
                foreach($p->images->image as $img) $gallery[] = (string)$img->url;
            }
            $imagesJson = json_encode($gallery);
            $mainImg = $gallery[0] ?? '';

            // Tekst
            $desc = strip_tags((string)$p->desc->no ?: (string)$p->desc->en);
            
            // Data
            $propData = [
                'external_id' => $ref,
                'title' => (string)$p->type . ' i ' . (string)$p->address->town,
                'price' => (int)$p->price,
                'location' => (string)$p->address->town,
                'region' => (string)$p->province,
                'type' => (string)$p->type,
                'bedrooms' => (int)$p->beds,
                'bathrooms' => (int)$p->baths,
                'area' => (int)($p->surface_area->built_m2 ?? $p->surface_area->built ?? 0),
                'img_url' => $mainImg,
                'images_json' => $imagesJson,
                'desc' => $desc,
                'developer_id' => $devId, // KOBLINGEN
                'delivery' => (string)$p->delivery_date
            ];

            if ($this->upsertProperty($propData)) $stats['inserted']++;
            else $stats['updated']++;
        }
        return ['success' => true, 'stats' => $stats];
    }

    // Hjelpefunksjon: Håndterer Utbyggere automatisk
    private function getOrCreateDeveloper($name) {
        // Sjekk om finnes
        $stmt = $this->conn->prepare("SELECT id FROM developers WHERE name = ?");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($row = $res->fetch_assoc()) {
            return $row['id'];
        } else {
            // Opprett ny
            $stmt = $this->conn->prepare("INSERT INTO developers (name) VALUES (?)");
            $stmt->bind_param("s", $name);
            $stmt->execute();
            return $this->conn->insert_id;
        }
    }

    private function upsertProperty($p) {
        $check = $this->conn->prepare("SELECT id FROM properties WHERE external_id = ?");
        $check->bind_param("s", $p['external_id']);
        $check->execute();
        
        // Vi oppdaterer developer_id også ved update
        if ($row = $check->get_result()->fetch_assoc()) {
            $sql = "UPDATE properties SET price=?, title=?, images_json=?, area=?, description=?, delivery_date=?, developer_id=?, last_imported_at=NOW() WHERE id=?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ississii", $p['price'], $p['title'], $p['images_json'], $p['area'], $p['desc'], $p['delivery'], $p['developer_id'], $row['id']);
            $stmt->execute();
            return false;
        } else {
            $sql = "INSERT INTO properties (external_id, title, price, location, type, bedrooms, bathrooms, area, description, region, image_path, images_json, delivery_date, developer_id, created_at, last_imported_at, source_feed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'RedSP')";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ssisssiisssssi", $p['external_id'], $p['title'], $p['price'], $p['location'], $p['type'], $p['bedrooms'], $p['bathrooms'], $p['area'], $p['desc'], $p['region'], $p['img_url'], $p['images_json'], $p['delivery'], $p['developer_id']);
            $stmt->execute();
            return true;
        }
    }
}
?>