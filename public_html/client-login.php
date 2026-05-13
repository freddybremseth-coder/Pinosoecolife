<?php
session_start();
require_once 'database/Database.php';

$error = '';
$notice = '';
$step = $_SESSION['client_login_pending'] ?? null;

function ensureClientLoginTable($conn) {
    $conn->query("
        CREATE TABLE IF NOT EXISTS client_login_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            code_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_client_login_email (email),
            INDEX idx_client_login_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function sendLoginCode($email, $name, $code) {
    $subject = "Din innloggingskode til Pinoso Eco Life";
    $safeName = htmlspecialchars($name ?: 'kunde', ENT_QUOTES, 'UTF-8');
    $safeCode = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');
    $message = "
        <html>
        <body style='font-family: Arial, sans-serif; color:#1A2530; line-height:1.6;'>
            <div style='max-width:560px; margin:20px auto; padding:32px; border:1px solid #e5e7eb;'>
                <h2>Hei {$safeName}</h2>
                <p>Bruk denne koden for å logge inn på Min Side hos Pinoso Eco Life:</p>
                <div style='font-size:30px; letter-spacing:6px; font-weight:700; color:#C5A059; margin:24px 0;'>{$safeCode}</div>
                <p>Koden er gyldig i 15 minutter. Hvis du ikke ba om denne koden, kan du ignorere e-posten.</p>
            </div>
        </body>
        </html>
    ";
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: Pinoso Eco Life <post@pinosoecolife.com>\r\n";

    return mail($email, $subject, $message, $headers);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db = new Database();
    $conn = $db->getConnection();
    ensureClientLoginTable($conn);

    $action = $_POST['action'] ?? 'request_code';

    if ($action === 'request_code') {
        $email = trim(strtolower($_POST['email'] ?? ''));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = "Skriv inn en gyldig e-postadresse.";
        } else {
            $stmt = $conn->prepare("SELECT id, name, email FROM crm_contacts WHERE LOWER(email) = ? LIMIT 1");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();

            if ($user) {
                $code = (string)random_int(100000, 999999);
                $hash = password_hash($code, PASSWORD_DEFAULT);
                $expiresAt = date('Y-m-d H:i:s', time() + 900);

                $conn->query("UPDATE client_login_tokens SET used_at = NOW() WHERE email = '" . $conn->real_escape_string($email) . "' AND used_at IS NULL");

                $insert = $conn->prepare("INSERT INTO client_login_tokens (client_id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)");
                $insert->bind_param("isss", $user['id'], $email, $hash, $expiresAt);
                $insert->execute();

                $_SESSION['client_login_pending'] = [
                    'email' => $email,
                    'client_id' => (int)$user['id'],
                    'name' => $user['name'],
                ];

                sendLoginCode($email, $user['name'], $code);
                $step = $_SESSION['client_login_pending'];
                $notice = "Vi har sendt en sekssifret kode til e-posten din.";
            } else {
                $error = "Fant ingen konto med denne e-posten.";
            }
        }
    }

    if ($action === 'verify_code') {
        $pending = $_SESSION['client_login_pending'] ?? null;
        $code = trim($_POST['code'] ?? '');

        if (!$pending || !preg_match('/^\d{6}$/', $code)) {
            $error = "Koden er ugyldig. Prøv igjen.";
        } else {
            $stmt = $conn->prepare("
                SELECT * FROM client_login_tokens
                WHERE client_id = ? AND email = ? AND used_at IS NULL AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt->bind_param("is", $pending['client_id'], $pending['email']);
            $stmt->execute();
            $token = $stmt->get_result()->fetch_assoc();

            if ($token && password_verify($code, $token['code_hash'])) {
                $update = $conn->prepare("UPDATE client_login_tokens SET used_at = NOW() WHERE id = ?");
                $update->bind_param("i", $token['id']);
                $update->execute();

                $_SESSION['client_logged_in'] = true;
                $_SESSION['client_id'] = (int)$pending['client_id'];
                $_SESSION['client_name'] = $pending['name'];
                unset($_SESSION['client_login_pending']);
                header("Location: client-portal.php");
                exit;
            }

            $error = "Feil eller utløpt kode. Be om en ny kode.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Min Side - Logg inn</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        :root { --dark:#1A2530; --gold:#C5A059; --sage:#E8F1EE; --text:#334155; }
        * { box-sizing: border-box; }
        body { margin:0; min-height:100vh; font-family:'Lato', sans-serif; color:var(--text); background:#f7f7f4; display:flex; align-items:center; justify-content:center; padding:28px; }
        .login-shell { width:min(980px, 100%); min-height:590px; display:grid; grid-template-columns:1.12fr .88fr; background:white; border:1px solid rgba(26,37,48,.08); box-shadow:0 28px 70px rgba(26,37,48,.14); overflow:hidden; }
        .login-image { position:relative; background:url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=82') center/cover; }
        .login-image::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, rgba(26,37,48,.12), rgba(26,37,48,.72)); }
        .image-copy { position:absolute; z-index:1; left:42px; right:42px; bottom:42px; color:white; }
        .image-copy h2 { font-family:'Playfair Display', serif; font-size:2.4rem; line-height:1.1; margin:0 0 12px; }
        .image-copy p { margin:0; max-width:430px; color:rgba(255,255,255,.86); font-size:1.02rem; }
        .login-panel { padding:62px 56px; display:flex; flex-direction:column; justify-content:center; }
        .eyebrow { color:var(--gold); text-transform:uppercase; letter-spacing:1.8px; font-size:.76rem; font-weight:700; margin-bottom:16px; }
        h1 { font-family:'Playfair Display', serif; color:var(--dark); font-size:2.25rem; line-height:1.12; margin:0 0 12px; }
        .subtitle { margin:0 0 30px; color:#64748b; line-height:1.7; }
        label { display:block; font-size:.78rem; font-weight:700; text-transform:uppercase; color:var(--dark); letter-spacing:.8px; margin-bottom:8px; }
        input { width:100%; padding:15px 16px; border:1px solid #d7dce2; border-radius:4px; font:inherit; outline:none; transition:.2s; margin-bottom:18px; }
        input:focus { border-color:var(--gold); box-shadow:0 0 0 4px rgba(197,160,89,.13); }
        .btn-login { width:100%; border:0; border-radius:4px; padding:16px 20px; background:var(--dark); color:white; font-weight:700; text-transform:uppercase; letter-spacing:1px; cursor:pointer; transition:.2s; }
        .btn-login:hover { background:var(--gold); transform:translateY(-1px); }
        .message { padding:12px 14px; border-radius:4px; font-size:.92rem; margin-bottom:18px; }
        .error { background:#fee2e2; color:#991b1b; }
        .notice { background:#ecfdf5; color:#166534; }
        .helper { margin-top:18px; font-size:.9rem; color:#738195; text-align:center; }
        .helper button { border:0; background:none; color:var(--gold); cursor:pointer; font-weight:700; }
        @media (max-width: 820px) {
            body { padding:16px; }
            .login-shell { grid-template-columns:1fr; min-height:auto; }
            .login-image { min-height:260px; }
            .image-copy { left:24px; right:24px; bottom:24px; }
            .image-copy h2 { font-size:2rem; }
            .login-panel { padding:38px 24px; }
        }
    </style>
</head>
<body>
    <main class="login-shell">
        <section class="login-image" aria-label="Moderne villa i Spania">
            <div class="image-copy">
                <h2>Din private boligportal</h2>
                <p>Se anbefalte nybygg, dokumenter og meldinger fra rådgiveren din samlet på ett sted.</p>
            </div>
        </section>

        <section class="login-panel">
            <div class="eyebrow">Pinoso Eco Life</div>
            <h1>Logg inn på Min Side</h1>
            <p class="subtitle"><?= $step ? 'Skriv inn koden vi sendte til e-posten din.' : 'Vi sender deg en engangskode på e-post. Ingen passord å huske.' ?></p>

            <?php if($error): ?><div class="message error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
            <?php if($notice): ?><div class="message notice"><?= htmlspecialchars($notice) ?></div><?php endif; ?>

            <?php if($step): ?>
                <form method="POST">
                    <input type="hidden" name="action" value="verify_code">
                    <label for="code">Engangskode</label>
                    <input id="code" type="text" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" placeholder="000000" required>
                    <button class="btn-login">Åpne Min Side</button>
                </form>
                <form method="POST" class="helper">
                    <input type="hidden" name="action" value="request_code">
                    <input type="hidden" name="email" value="<?= htmlspecialchars($step['email']) ?>">
                    Fikk du ikke koden? <button type="submit">Send ny kode</button>
                </form>
            <?php else: ?>
                <form method="POST">
                    <input type="hidden" name="action" value="request_code">
                    <label for="email">E-postadresse</label>
                    <input id="email" type="email" name="email" placeholder="din@epost.no" required>
                    <button class="btn-login">Send innloggingskode</button>
                </form>
                <p class="helper">Har du ikke tilgang? Kontakt din rådgiver.</p>
            <?php endif; ?>
        </section>
    </main>
</body>
</html>
