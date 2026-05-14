<?php
require_once __DIR__ . '/config.php';

echo json_encode([
    'host' => getenv('DB_HOST'),
    'port' => getenv('DB_PORT'),
    'name' => getenv('DB_NAME'),
    'user' => getenv('DB_USER'),
    'pass' => getenv('DB_PASS') ? 'SET' : 'NOT SET',
]);