<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();

// Set all existing users to active
$pdo->exec("UPDATE users SET is_active = 1 WHERE is_active = 0 OR is_active IS NULL");

// Make sure new registrations default to active
$pdo->exec("ALTER TABLE users MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");

echo json_encode(['done' => true]);