<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only GET requests are allowed.']);
    exit;
}

$stmt = $pdo->query(
    'SELECT constituency_id, name
     FROM constituency
     ORDER BY name'
);

echo json_encode([
    'success' => true,
    'constituencies' => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
