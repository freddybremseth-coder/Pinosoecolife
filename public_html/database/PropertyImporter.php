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
        return ['success' => false, 'message' => 'Bruk XML URL'];
    }

    private function processXML($url) {
        set_time_limit(600);
        $xmlContent = @file_get_contents($url);
        if (!$xmlContent) return ['success' => false, 'message' => 'Kunne ikke hente XML.'];
        
        $xml = @simplexml_load_string($xmlContent);
        if ($xml === false) return ['success' => false, 'message' => 'Ugyldig XML.'];

        $stats = ['updated' => 0, 'inserted' => 0];

        foreach ($xml->property as $p) {
            
            // 1. FINN UTBYGGER / PROSJEKT (Forbedret logikk)
            $devName = trim((string)$p->developer);
            
            // Fallback 1: Sjekk 'complex' eller 'urbanization'
            if (empty($devName)) $devName = trim((string)$p->complex);
            if (empty($devName)) $devName = trim((string)$p->urbanization);
            
            // Fallback 2: Bruk Development Ref (f.eks P00123) hvis navn mangler
            if (empty($devName)) {
                $devRef = trim((string)$p->development_ref);
                if (!empty($devRef)) {
                    $devName = "Prosjekt " . $devRef; // Vi kaller den dette midlertidig
                } else {
                    $devName = "Ukjent Utbygger";
                }
            }

            // Opprett/Hent ID
            $devId = $this->getOrCreateDeveloper($devName);

            // 2. DATA MAPPING
            $ref = (string)$p->ref ?: (string)$p->id;
            
            // Bilder
            $gallery = [];
            if (isset($p->images->image)) {
                foreach ($p->images->image as $img) $gallery[] = (string)$img->url;
            }
            $imagesJson = json_encode($gallery);
            $mainImg = $gallery[0] ?? '';

            // Tekst
            $desc = strip_tags((string)$p->desc->no ?: (string)$p->desc->en);
            
            // Arealer
            $built = (float)($p->surface_area->built_m2 ?? $p->surface_area->built ?? 0);
            $plot = (float)($p->surface_area->plot_m2 ?? $p->surface_area->plot ?? 0);
            $terrace = (float)($p->surface_area->terrace_m2 ?? 0);

            // Agent Info
            $commission = (float)($p->commission ?? 0);
            $dropbox = (string)($p->dropbox_url ?? $p->url->dropbox ?? '');
            $website = (string)($p->website_url ?? $p->url->website ?? ''); // Din prosjekt-lenke
            
            $notes = "Key Ready: " . ((int)$p->key_ready==1?'Ja':'Nei');
            if(isset($p->delivery_date)) $notes .= " | Levering: " . (string)$p->delivery_date;

            $propData = [
                'external_id' => $ref,
                'title' => (string)$p->type . ' i ' . (string)$p->address->town,
                'price' => (int)$p->price,
                'location' => (string)$p->address->town,
                'region' => (string)$p->province,
                'type' => (string)$p->type,
                'bedrooms' => (int)$p->beds,
                'bathrooms' => (int)$p->baths,
                'area' => $built,
                'plot_size' => $plot,
                'terrace_size' => $terrace,
                'img_url' => $mainImg,
                'images_json' => $imagesJson,
                'desc' => $desc,
                'developer_id' => $devId,
                'commission' => $commission,
                'dropbox' => $dropbox,
                'website_url' => $website,
                'notes' => $notes
            ];

            if ($this->upsertProperty($propData)) $stats['inserted']++;
            else $stats['updated']++;
        }
        return ['success' => true, 'stats' => $stats];
    }

    private function getOrCreateDeveloper($name) {
        // Sjekk om navnet finnes nøyaktig
        $stmt = $this->conn->prepare("SELECT id FROM developers WHERE name = ?");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($row = $res->fetch_assoc()) {
            return $row['id'];
        } else {
            // Sjekk om vi har en "Prosjekt P..." som matcher, kanskje brukeren har døpt den om?
            // (Enkelt: Vi bare lager ny hvis navnet ikke matcher)
            $stmt = $this->conn->prepare("INSERT INTO developers (name) VALUES (?)");
            $stmt->bind_param("s", $name);
            $stmt->execute();
            return $this->conn->insert_id;
        }
    }

    private function processCSV($file) { return ['success'=>false, 'message'=>'Bruk XML']; }

    private function upsertProperty($p) {
        $check = $this->conn->prepare("SELECT id FROM properties WHERE external_id = ?");
        $check->bind_param("s", $p['external_id']);
        $check->execute();
        
        if ($row = $check->get_result()->fetch_assoc()) {
            // OPPDATER
            $sql = "UPDATE properties SET price=?, title=?, images_json=?, build_size=?, terrace_size=?, plot_size=?, commission_percent=?, dropbox_url=?, website_url=?, agent_notes=?, developer_id=?, last_imported_at=NOW() WHERE id=?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("issdddsdssii", $p['price'], $p['title'], $p['images_json'], $p['area'], $p['terrace_size'], $p['plot_size'], $p['commission'], $p['dropbox'], $p['website_url'], $p['notes'], $p['developer_id'], $row['id']);
            $stmt->execute();
            return false;
        } else {
            // NY
            $sql = "INSERT INTO properties (external_id, title, price, location, type, bedrooms, bathrooms, area, build_size, terrace_size, plot_size, description, region, image_path, images_json, commission_percent, dropbox_url, website_url, agent_notes, developer_id, created_at, last_imported_at, source_feed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'RedSP')";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ssisssiidddsssssdssi", $p['external_id'], $p['title'], $p['price'], $p['location'], $p['type'], $p['bedrooms'], $p['bathrooms'], $p['area'], $p['area'], $p['terrace_size'], $p['plot_size'], $p['desc'], $p['region'], $p['img_url'], $p['images_json'], $p['commission'], $p['dropbox'], $p['website_url'], $p['notes'], $p['developer_id']);
            $stmt->execute();
            return true;
        }
    }
}
?>