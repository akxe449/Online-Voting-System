<?php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$intentId = (int)($data['intent_id'] ?? 0);
$timeSlotId = (int)($data['time_slot_id'] ?? 0);

if ($intentId <= 0 || $timeSlotId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Intent ID and time slot ID are required.'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT election_id, status
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

    if ($intent['status'] !== 'otp_verified') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'The voting session has not been verified.'
        ]);
        exit;
    }

    // Make sure the selected slot belongs to this election.
    $stmt = $pdo->prepare(
        'SELECT time_slot_id
         FROM time_slot
         WHERE time_slot_id = ?
           AND election_id = ?
           AND slot_end >= NOW()
         LIMIT 1'
    );

    $stmt->execute([
        $timeSlotId,
        (int)$intent['election_id']
    ]);

    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'This time slot is not available for this election.'
        ]);
        exit;
    }

    // Store the selected slot against the voting intent.
    $stmt = $pdo->prepare(
        'UPDATE voting_intent
         SET time_slot_id = ?,
             status = ?
         WHERE intent_id = ?'
    );

    $stmt->execute([
        $timeSlotId,
        'slot_selected',
        $intentId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Time slot selected successfully.'
    ]);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to select the time slot.'
    ]);
}