<?php
session_start();
require_once 'database/Database.php';

$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $db = new Database();
    $conn = $db->getConnection();

    // Sjekk mot admins tabell
    $stmt = $conn->prepare("SELECT id, password FROM admins WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Verifiser passord (bruk password_verify i produksjon)
        // For testing mot SQL-koden over (hash av admin123):
        if (password_verify($password, $row['password'])) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $row['id'];
            header("Location: backend.php");
            exit;
        } else {
            $error = "Feil passord.";
        }
    } else {
        $error = "Bruker ikke funnet.";
    }
}
?>
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <title>Login - Pinoso Eco Life</title>
    <style>
        body { font-family: sans-serif; background: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 300px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #1A2530; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #C5A059; }
        .error { color: red; font-size: 14px; margin-bottom: 10px; }
        h2 { text-align: center; color: #1A2530; margin-top: 0; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Zen Eco Admin</h2>
        <?php if($error) echo "<div class='error'>$error</div>"; ?>
        <form method="post">
            <input type="email" name="email" placeholder="E-post" required>
            <input type="password" name="password" placeholder="Passord" required>
            <button type="submit">Logg inn</button>
        </form>
    </div>
</body>
</html>