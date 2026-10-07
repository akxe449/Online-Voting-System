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

$voterCode = trim($data['voter_code'] ?? '');
$electionId = (int)($data['election_id'] ?? 0);
$constituencyId = (int)($data['constituency_id'] ?? 0);

if ($voterCode === '' || $electionId <= 0 || $constituencyId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Voter ID, election ID and constituency are required.'
    ]);
    exit;
}

/* Find voter using the voter code entered in the app. */
$stmt = $pdo->prepare(
    'SELECT voter_id, voter_code, email, constituency_id
     FROM voter
     WHERE voter_code = ?
     LIMIT 1'
);

$stmt->execute([$voterCode]);
$voter = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$voter) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Voter ID not found.'
    ]);
    exit;
}

/* Verify voter belongs to selected constituency. */
if ((int)$voter['constituency_id'] !== $constituencyId) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'This voter is not registered in the selected constituency.'
    ]);
    exit;
}

if (empty($voter['email'])) {
    http_response_code(409);
    echo json_encode([
        'success' => false,
        'message' => 'No email address is registered for this voter.'
    ]);
    exit;
}

/* Verify election belongs to selected constituency. */
$stmt = $pdo->prepare(
    'SELECT election_id, constituency_id, start_time, end_time
     FROM election
     WHERE election_id = ?
     LIMIT 1'
);

$stmt->execute([$electionId]);
$election = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$election) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Election not found.'
    ]);
    exit;
}

if ((int)$election['constituency_id'] !== $constituencyId) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'The selected election does not belong to the selected constituency.'
    ]);
    exit;
}

/* Election must currently be active. */
$now = time();

if (
    strtotime($election['start_time']) > $now ||
    strtotime($election['end_time']) < $now
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Election is not currently active.'
    ]);
    exit;
}

/* Check whether a voting intent already exists. */
$stmt = $pdo->prepare(
    'SELECT intent_id, status, credential_issued_at
     FROM voting_intent
     WHERE voter_id = ? AND election_id = ?
     LIMIT 1'
);

$stmt->execute([
    $voter['voter_id'],
    $electionId
]);

$existing = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existing) {
    if ($existing['credential_issued_at'] !== null) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'A voting session has already been started for this election.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Voting intent already exists.',
        'voter_id' => (int)$voter['voter_id'],
        'intent_id' => (int)$existing['intent_id'],
        'status' => $existing['status'],
        'email' => $voter['email']
    ]);
    exit;
}

/* Create voting intent. */
$stmt = $pdo->prepare(
    "INSERT INTO voting_intent
        (voter_id, election_id, status)
     VALUES
        (?, ?, 'created')"
);

$stmt->execute([
    $voter['voter_id'],
    $electionId
]);

echo json_encode([
    'success' => true,
    'message' => 'Voting intent created successfully.',
    'voter_id' => (int)$voter['voter_id'],
    'intent_id' => (int)$pdo->lastInsertId(),
    'status' => 'created',
    'email' => $voter['email']
]);