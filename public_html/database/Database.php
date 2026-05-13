<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Henter opplysningene fra config.php i mappen over
        $configPath = __DIR__ . '/../config.php';
        
        if (file_exists($configPath)) {
            $config = require $configPath;
            $this->host = $config['db_host'];
            $this->db_name = $config['db_name'];
            $this->username = $config['db_user'];
            $this->password = $config['db_pass'];
        } else {
            die("Feil: Fant ikke config.php. Last opp denne filen til rot-mappen.");
        }
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            if ($this->conn->connect_error) {
                throw new Exception("Tilkoblingsfeil: " . $this->conn->connect_error);
            }
            $this->conn->set_charset("utf8mb4");
        } catch(Exception $e) {
            echo "Databasefeil: " . $e->getMessage();
            exit;
        }
        return $this->conn;
    }
}
?>