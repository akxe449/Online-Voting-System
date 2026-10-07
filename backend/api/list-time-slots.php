<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

$intentId = (int)($_GET['intent_id'] ?? 0);

if ($intentId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Intent ID is required.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT election_id
         FROM voting_intent
         WHERE intent_id = ?
         LIMIT 1'
    );

    $stmt->execute([$intentId]);
    $intent = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$intent) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Voting session not found.'
        ]);
        exit;
    }

    $stmt = $pdo->prepare(
        'SELECT time_slot_id, slot_start, slot_end
         FROM time_slot
         WHERE election_id = ?
         AND slot_end >= NOW()
         ORDER BY slot_start ASC'
    );

    $stmt->execute([(int)$intent['election_id']]);

    echo json_encode([
        'success' => true,
        'slots' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to load time slots.'
    ]);
}