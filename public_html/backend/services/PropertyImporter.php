<?php
require_once __DIR__ . '/../database/Database.php';

class PropertyImporter {
    private $pdo;
    private $log = [];

    public function __construct() {
        $db = new Database();
        $this->pdo = $db->getPDO(); // Sørg for at Database-klassen har en getPDO() metode
    }

    /**
     * Importerer boliger fra en URL (RedSP CSV feed)
     */
    public function importFromUrl($url) {
        $tempFile = tempnam(sys_get_temp_dir(), 'redsp_import');
        if (!copy($url, $tempFile)) {
            return ['success' => false, 'error' => "Kunne ikke laste ned filen fra $url"];
        }
        $result = $this->processCSV($tempFile);
        unlink($tempFile); // Rydd opp
        return $result;
    }

    /**
     * Prosesserer CSV-filen
     */
    public function processCSV($filepath) {
        if (!file_exists($filepath)) throw new Exception("Fil ikke funnet");

        $handle = fopen($filepath, "r");
        $stats = ['updated' => 0, 'inserted' => 0, 'skipped' => 0];
        
        // Les header-raden for å mappe kolonner (valgfritt, her antar vi fast struktur)
        $header = fgetcsv($handle, 2000, ","); 

        $this->pdo->beginTransaction();

        try {
            while (($data = fgetcsv($handle, 2000, ",")) !== FALSE) {
                // VIKTIG: Tilpass indeksene ($data[0], $data[1]...) til RedSP sin CSV-struktur
                $prop = [
                    'external_id' => $data[0] ?? null,
                    'title'       => $data[1] ?? 'Ukjent tittel',
                    'price'       => (int)preg_replace('/[^0-9]/', '', $data[2] ?? 0),
                    'location'    => $data[3] ?? '',
                    'region'      => $data[4] ?? 'Costa Blanca',
                    'type'        => $data[5] ?? 'Villa',
                    'beds'        => (int)($data[6] ?? 0),
                    'baths'       => (int)($data[7] ?? 0),
                    'area'        => (int)($data[8] ?? 0),
                    'img_url'     => $data[9] ?? '', // URL til bilde
                    'desc'        => $data[10] ?? ''
                ];

                if (!$prop['external_id']) {
                    $stats['skipped']++;
                    continue;
                }

                if ($this->upsertProperty($prop)) {
                    $stats['inserted']++;
                } else {
                    $stats['updated']++;
                }
            }
            $this->pdo->commit();
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }

        fclose($handle);
        return ['success' => true, 'stats' => $stats];
    }

    /**
     * Insert or Update (Upsert)
     */
    private function upsertProperty($p) {
        // Sjekk om boligen finnes
        $stmt = $this->pdo->prepare("SELECT id FROM properties WHERE external_id = ?");
        $stmt->execute([$p['external_id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Oppdater eksisterende (Pris, status, etc.)
            $sql = "UPDATE properties SET 
                    price = ?, title = ?, last_imported_at = NOW() 
                    WHERE id = ?";
            $this->pdo->prepare($sql)->execute([$p['price'], $p['title'], $existing['id']]);
            return false; // Returnerer false for "ikke ny"
        } else {
            // Sett inn ny
            $sql = "INSERT INTO properties 
                    (external_id, title, price, location, region, type, bedrooms, bathrooms, area, image_path, description, source_feed, last_imported_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RedSP', NOW())";
            $this->pdo->prepare($sql)->execute([
                $p['external_id'], $p['title'], $p['price'], $p['location'], $p['region'], 
                $p['type'], $p['beds'], $p['baths'], $p['area'], $p['img_url'], $p['desc']
            ]);
            return true; // Returnerer true for "ny"
        }
    }
}
?>