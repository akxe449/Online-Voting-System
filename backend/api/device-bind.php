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
$deviceKey = trim($data['device_key'] ?? '');
$platform = trim($data['platform'] ?? '');

if ($intentId <= 0 || $deviceKey === '' || $platform === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Intent ID, device key and platform are required.'
    ]);
    exit;
}

try {
    // Make sure this voting session exists and has passed OTP verification.
    $stmt = $pdo->prepare(
        "SELECT intent_id, status, credential_issued_at
         FROM voting_intent
         WHERE intent_id = ?
         LIMIT 1"
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
            'message' => 'OTP verification is required before binding the device.'
        ]);
        exit;
    }

    // Bind this device to this voting session.
    $stmt = $pdo->prepare(
        "INSERT INTO device_binding
            (intent_id, device_key, platform)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            device_key = VALUES(device_key),
            platform = VALUES(platform)"
    );

    $stmt->execute([
        $intentId,
        $deviceKey,
        $platform
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Device bound successfully.'
    ]);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to bind this device.'
    ]);
}