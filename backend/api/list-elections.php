<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Only GET requests are allowed.'
    ]);
    exit;
}

$constituencyId = (int)($_GET['constituency_id'] ?? 0);

if ($constituencyId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Constituency ID is required.'
    ]);
    exit;
}

$stmt = $pdo->prepare(
    "SELECT
        election_id,
        election_type_id,
        title AS name,
        start_time,
        end_time,
        constituency_id,
        CASE
            WHEN NOW() < start_time THEN 'upcoming'
            WHEN NOW() <= end_time THEN 'active'
            ELSE 'ended'
        END AS status
     FROM election
     WHERE constituency_id = ?
     ORDER BY start_time"
);

$stmt->execute([$constituencyId]);

echo json_encode([
    'success' => true,
    'constituency_id' => $constituencyId,
    'elections' => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);