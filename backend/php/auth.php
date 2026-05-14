<?php
// ============================================================
//  [filename] 
// ============================================================

// Include central config
require_once __DIR__ . '/config.php';

// Start session (if needed)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', '1');
    ini_set('session.cookie_httponly', '1');
    session_start();
}

// Call CORS setup from config
setupCORS();

// ── HELPERS ───────────────────────────────────────────────
function getJson(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function clean(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

function jsonOk(array $data = [], string $message = 'Success'): void {
    echo json_encode(['success' => true, 'message' => $message] + $data);
    exit;
}

function jsonError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// ── ROUTER ────────────────────────────────────────────────
$action = $_GET['action'] ?? '';
$data   = getJson();

switch ($action) {
    case 'login':    handleLogin($data);    break;
    case 'register': handleRegister($data); break;
    case 'logout':   handleLogout();        break;
    case 'me':       handleMe();            break;
    default:         jsonError('Unknown action', 404);
}

// ── LOGIN ─────────────────────────────────────────────────
function handleLogin(array $d): void {
    $email = strtolower(clean($d['email'] ?? ''));
    $pass  = $d['password'] ?? '';

    if (!$email || !$pass) jsonError('Email and password are required.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash']))
        jsonError('Invalid email or password.', 401);

    // Generate a simple token and store in DB
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("UPDATE users SET auth_token = ? WHERE id = ?")
        ->execute([$token, $user['id']]);

    $userData = [
        'id'         => $user['id'],
        'email'      => $user['email'],
        'first_name' => $user['first_name'],
        'last_name'  => $user['last_name'],
        'role'       => $user['role'],
        'phone'      => $user['phone'],
        'purok'      => $user['purok'],
        'token'      => $token,
    ];

    jsonOk(['user' => $userData], 'Login successful.');
}

// ── REGISTER ──────────────────────────────────────────────
function handleRegister(array $d): void {
    $first   = clean($d['first_name'] ?? '');
    $last    = clean($d['last_name']  ?? '');
    $email   = strtolower(clean($d['email'] ?? ''));
    $phone   = clean($d['phone']   ?? '');
    $purok   = clean($d['purok']   ?? '');
    $address = clean($d['address'] ?? '');
    $pass    = $d['password']         ?? '';
    $confirm = $d['confirm_password'] ?? '';

    if (!$first || !$last || !$email || !$phone || !$purok || !$pass)
        jsonError('All fields are required.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
        jsonError('Invalid email address.');
    if (strlen($pass) < 8)
        jsonError('Password must be at least 8 characters.');
    if ($pass !== $confirm)
        jsonError('Passwords do not match.');

    $pdo  = getDB();
    $hash = password_hash($pass, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (first_name, last_name, email, password_hash, phone, purok, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$first, $last, $email, $hash, $phone, $purok, $address]);
        echo json_encode(['success' => true, 'message' => 'Registration successful!']);
        exit;
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') jsonError('Email already registered.', 409);
        jsonError('Registration failed. Please try again.', 500);
    }
}

// ── LOGOUT ────────────────────────────────────────────────
function handleLogout(): void {
    $token = getBearerToken();
    if ($token) {
        $pdo = getDB();
        $pdo->prepare("UPDATE users SET auth_token = NULL WHERE auth_token = ?")
            ->execute([$token]);
    }
    jsonOk([], 'Logged out.');
}

// ── ME ────────────────────────────────────────────────────
function handleMe(): void {
    $token = getBearerToken();
    if (!$token) jsonError('Not authenticated.', 401);

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE auth_token = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) jsonError('Not authenticated.', 401);

    jsonOk(['user' => [
        'id'         => $user['id'],
        'email'      => $user['email'],
        'first_name' => $user['first_name'],
        'last_name'  => $user['last_name'],
        'role'       => $user['role'],
        'phone'      => $user['phone'],
        'purok'      => $user['purok'],
        'token'      => $user['auth_token'],
    ]]);
}

function getBearerToken(): ?string {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) {
        return substr($auth, 7);
    }
    return null;
}