<?php
// ============================================================
//  php/auth.php  –  Login / Register / Logout / Me
// ============================================================

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

startSession();

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
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonError('Invalid email address.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash'])) {
        jsonError('Invalid email or password.', 401);
    }

    $userData = [
        'id'         => $user['id'],
        'email'      => $user['email'],
        'first_name' => $user['first_name'],
        'last_name'  => $user['last_name'],
        'name'       => $user['first_name'] . ' ' . $user['last_name'],
        'role'       => $user['role'],
        'phone'      => $user['phone'],
        'purok'      => $user['purok'],
        'address'    => $user['address'],
    ];

    $_SESSION['user'] = $userData;
    echo json_encode(['success' => true, 'message' => 'Login successful.', 'user' => $userData]);
    exit;
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
    $_SESSION = [];
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out.']);
    exit;
}

// ── ME ────────────────────────────────────────────────────
function handleMe(): void {
    $user = $_SESSION['user'] ?? null;
    if (!$user) jsonError('Not authenticated.', 401);
    echo json_encode(['success' => true, 'user' => $user]);
    exit;
}