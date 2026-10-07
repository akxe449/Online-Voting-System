<?php
// ============================================================
// POST /cast-vote
// Body: { "token": "<token_hash>", "candidate_id": "<string>" }
//
// The app sends the candidate ID. The server encrypts the choice
// before storing it in BALLOT.
//
// One transaction + row locking guarantees that one credential
// token can be used only once, even under concurrent requests.
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // dev-only

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/lib/AuditLog.php';
require_once __DIR__ . '/lib/Crypto.php';

$input = json_decode(file_get_contents('php://input'), true);

$tokenHash = $input['token'] ?? null;
$candidateId = $input['candidate_id'] ?? null;

if (!$tokenHash || !$candidateId) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'token and candidate_id are required'
    ]);

    exit;
}

try {
    $pdo->beginTransaction();

    // Lock the token row so the same token cannot be used twice
    // concurrently.
    $stmt = $pdo->prepare(
        'SELECT used
         FROM CREDENTIAL_TOKEN
         WHERE token_hash = :token
         FOR UPDATE'
    );

    $stmt->execute([
        ':token' => $tokenHash
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row === false) {
        $pdo->rollBack();

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'error' => 'Unknown token'
        ]);

        exit;
    }

    if ((bool) $row['used']) {
        $pdo->rollBack();

        http_response_code(409);

        echo json_encode([
            'success' => false,
            'error' => 'This token has already been used to cast a vote'
        ]);

        exit;
    }

    // Mark the token as used.
    $pdo->prepare(
        'UPDATE CREDENTIAL_TOKEN
         SET used = 1
         WHERE token_hash = :token'
    )->execute([
        ':token' => $tokenHash
    ]);

    // Encrypt the candidate choice before storing it.
    $encryptedChoice = encryptChoice((string) $candidateId);

    // Generate a voter-facing confirmation code.
    $confirmationCode = strtoupper(
        bin2hex(random_bytes(5))
    );

    // Store only the encrypted choice in the ballot.
    $pdo->prepare(
        'INSERT INTO BALLOT
            (token_hash, encrypted_choice, confirmation_code)
         VALUES
            (:token, :choice, :code)'
    )->execute([
        ':token' => $tokenHash,
        ':choice' => $encryptedChoice,
        ':code' => $confirmationCode,
    ]);

    // Record the vote in the audit log.
    appendAuditLog(
        $pdo,
        $confirmationCode,
        $encryptedChoice
    );

    $pdo->commit();

    // The React Native app checks d.success.
    echo json_encode([
        'success' => true,
        'message' => 'Vote submitted successfully.',
        'confirmation_code' => $confirmationCode
    ]);

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Internal error',
        'detail' => $e->getMessage()
    ]);
}