<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/lib/IssueToken.php';

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
$otp = trim($data['otp'] ?? '');

if ($intentId <= 0 || $otp === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Intent ID and OTP are required.'
    ]);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT otp_id, otp_hash, expires_at, verified_at, attempts
     FROM otp_challenge
     WHERE intent_id = ?
     ORDER BY otp_id DESC
     LIMIT 1'
);

$stmt->execute([$intentId]);
$challenge = $stmt->fetch();

if (!$challenge) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'OTP challenge not found.'
    ]);
    exit;
}

if ($challenge['verified_at'] !== null) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'OTP has already been verified.'
    ]);
    exit;
}

if (strtotime($challenge['expires_at']) < time()) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'OTP has expired.'
    ]);
    exit;
}

if ((int)$challenge['attempts'] >= 3) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Too many OTP attempts.'
    ]);
    exit;
}

if (!password_verify($otp, $challenge['otp_hash'])) {
    $stmt = $pdo->prepare(
        'UPDATE otp_challenge
         SET attempts = attempts + 1
         WHERE otp_id = ?'
    );

    $stmt->execute([$challenge['otp_id']]);

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid OTP.'
    ]);
    exit;
}

$pdo->beginTransaction();

try {
    $stmt = $pdo->prepare(
        'SELECT election_id, credential_issued_at
         FROM voting_intent
         WHERE intent_id = ?
         FOR UPDATE'
    );

    $stmt->execute([$intentId]);
    $intent = $stmt->fetch();

    if (!$intent) {
        throw new RuntimeException('Voting intent not found.');
    }

    if ($intent['credential_issued_at'] !== null) {
        throw new RuntimeException('Voting credential has already been issued for this election.');
    }

    $stmt = $pdo->prepare(
        'UPDATE otp_challenge
         SET verified_at = NOW()
         WHERE otp_id = ?'
    );

    $stmt->execute([$challenge['otp_id']]);

    $stmt = $pdo->prepare(
        "UPDATE voting_intent
         SET status = 'otp_verified',
             credential_issued_at = NOW()
         WHERE intent_id = ?"
    );

    $stmt->execute([$intentId]);

    // The only A-to-B connection: election_id goes into issueToken().
    $credentialToken = issueToken((int)$intent['election_id']);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'OTP verified successfully.',
        'credential_token' => $credentialToken
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to complete OTP verification.'
    ]);
}
