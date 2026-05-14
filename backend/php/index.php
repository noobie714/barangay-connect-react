<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_token VARCHAR(64) NULL DEFAULT NULL");

echo json_encode(['done' => true]);