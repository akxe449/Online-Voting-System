<?php

/**
 * Appends one tamper-evident row to AUDIT_LOG, chained to the previous
 * row's hash. MUST be called from inside the same transaction as the
 * BALLOT insert it documents, so the two commit or roll back together.
 *
 * row_hash covers prev_hash + confirmation_code + the actual encrypted
 * ballot content, so ANY later edit to prev_hash, this row, or the
 * BALLOT row it documents becomes detectable by recomputing the hash
 * from current data and comparing. (Earlier version included microtime()
 * here, which is never stored anywhere -- that made verification
 * impossible to ever recompute correctly. Fixed.)
 *
 * @param PDO $pdo An already-open transaction (do not open a new one here)
 * @param string $confirmationCode The confirmation code just generated for this ballot
 * @param string $encryptedChoice The exact encrypted_choice value just inserted into BALLOT
 */
function appendAuditLog(PDO $pdo, string $confirmationCode, string $encryptedChoice): void
{
    $prev = $pdo->query('SELECT row_hash FROM AUDIT_LOG ORDER BY log_id DESC LIMIT 1')->fetchColumn();
    $prevHash = ($prev !== false) ? $prev : str_repeat('0', 64); // genesis row chains to a zero-hash

    $rowHash = hash('sha256', $prevHash . $confirmationCode . $encryptedChoice);

    $stmt = $pdo->prepare(
        'INSERT INTO AUDIT_LOG (confirmation_code, row_hash, prev_hash) VALUES (:code, :row_hash, :prev_hash)'
    );
    $stmt->execute([
        ':code' => $confirmationCode,
        ':row_hash' => $rowHash,
        ':prev_hash' => $prevHash,
    ]);
}
