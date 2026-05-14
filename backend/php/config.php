<?php
// ============================================================
//  config.php - Updated for Render Deployment
// ============================================================

// ── Environment Variables Support (for Render) ─────────────
define('DB_HOST',     getenv('DB_HOST') ?: 'localhost');
define('DB_PORT',     getenv('DB_PORT') ?: '3306');
define('DB_NAME',     getenv('DB_NAME') ?: 'barangay_connect');
define('DB_USER',     getenv('DB_USER') ?: 'root');
define('DB_PASS',     getenv('DB_PASS') ?: '');

define('DB_CHARSET',  'utf8mb4');

define('APP_NAME',    'BarangayConnect');
define('APP_VERSION', '1.0.0');

// ── PDO Connection for Aiven (with SSL) ─────────────────────
function getDB() {
    $host = getenv('DB_HOST');
    $port = getenv('DB_PORT');
    $db   = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

    return new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
        PDO::MYSQL_ATTR_SSL_CA => true,
    ]);
}

// ── CORS for Production ───────────────────────────────────
function setupCORS() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// Call this in every file
setupCORS();

// ── Helper Functions (only define if not already defined) ─────────────

if (!function_exists('getJson')) {
    function getJson(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
}

if (!function_exists('clean')) {
    function clean(string $val): string {
        return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('jsonOk')) {
    function jsonOk(array $data = [], string $message = 'Success'): void {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => $message] + $data);
        exit;
    }
}

if (!function_exists('jsonError')) {
    function jsonError(string $message, int $code = 400): void {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }
}