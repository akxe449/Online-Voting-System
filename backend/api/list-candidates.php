<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$electionId = (int)($_GET['election_id'] ?? 0);

if ($electionId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'election_id is required.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT candidate_id, name
         FROM CANDIDATE
         WHERE election_id = ?
         ORDER BY candidate_id ASC'
    );

    $stmt->execute([$electionId]);

    echo json_encode([
        'success' => true,
        'candidates' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load candidates.'
    ]);
}
