<?php

require_once __DIR__ . '/../../config/database.php';

/**
 * Issues one single-use anonymous voting token for an election.
 *
 * Only election_id crosses the identity-to-anonymous-voting seam.
 * No voter identity is stored with the credential token.
 *
 * @param int $electionId
 * @return string
 */
function issueToken(int $electionId): string
{
    global $pdo;

    $tokenHash = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare(
        'INSERT INTO CREDENTIAL_TOKEN
         (token_hash, election_id, used)
         VALUES (:token_hash, :election_id, 0)'
    );

    $stmt->execute([
        ':token_hash' => $tokenHash,
        ':election_id' => $electionId,
    ]);

    return $tokenHash;
}