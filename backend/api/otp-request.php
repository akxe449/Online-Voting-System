<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

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

if ($intentId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Intent ID is required.'
    ]);
    exit;
}

/*
 * Get the voting intent and the voter's registered email.
 */
$stmt = $pdo->prepare(
    'SELECT
        vi.intent_id,
        vi.status,
        vi.credential_issued_at,
        v.email,
        v.voter_code
     FROM voting_intent vi
     INNER JOIN voter v
        ON v.voter_id = vi.voter_id
     WHERE vi.intent_id = ?
     LIMIT 1'
);

$stmt->execute([$intentId]);

$intent = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$intent) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Voting intent not found.'
    ]);
    exit;
}

if ($intent['credential_issued_at'] !== null) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'A voting session has already been started for this election. A new voting credential cannot be issued.'
    ]);
    exit;
}

if (empty($intent['email'])) {
    http_response_code(409);
    echo json_encode([
        'success' => false,
        'message' => 'No email address is registered for this voter.'
    ]);
    exit;
}

/*
 * Generate a 6-digit OTP.
 */
$otp = str_pad(
    (string) random_int(0, 999999),
    6,
    '0',
    STR_PAD_LEFT
);

/*
 * Hash the OTP before storing it.
 */
$otpHash = password_hash($otp, PASSWORD_DEFAULT);

/*
 * OTP expires exactly 60 seconds from generation.
 */
$expiresAt = date(
    'Y-m-d H:i:s',
    time() + 60
);

/*
 * Load Gmail SMTP credentials.
 */
$mailConfig = require __DIR__ . '/../config/mail.php';

$mail = new PHPMailer(true);

try {
    /*
     * Gmail SMTP configuration.
     */
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = $mailConfig['username'];
    $mail->Password = $mailConfig['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    /*
     * Email details.
     */
    $mail->setFrom(
        $mailConfig['username'],
        'Online Voting System'
    );

    $mail->addAddress($intent['email']);

    $mail->isHTML(true);
    $mail->Subject = 'Your Voting Verification Code';

    $mail->Body = '
        <div style="font-family: Arial, sans-serif;">
            <h2>Voting Verification Code</h2>

            <p>Your verification code is:</p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                margin: 20px 0;
            ">
                ' . htmlspecialchars($otp) . '
            </div>

            <p>
                This code is valid for <strong>1 minute</strong>.
            </p>

            <p>
                If you did not request this code, please ignore this email.
            </p>
        </div>
    ';

    $mail->AltBody =
        "Your voting verification code is: {$otp}\n\n" .
        "This code is valid for 1 minute.";

    /*
     * Send the email first.
     */
    $mail->send();

    /*
     * Store only the hashed OTP after successful email delivery.
     */
    $stmt = $pdo->prepare(
        'INSERT INTO otp_challenge
            (intent_id, otp_hash, expires_at)
         VALUES (?, ?, ?)'
    );

    $stmt->execute([
        $intentId,
        $otpHash,
        $expiresAt
    ]);

    /*
     * Update voting intent status.
     */
    $stmt = $pdo->prepare(
        "UPDATE voting_intent
         SET status = 'otp_requested'
         WHERE intent_id = ?"
    );

    $stmt->execute([$intentId]);

    /*
     * IMPORTANT:
     * The actual OTP is NOT returned to the mobile app.
     */
    echo json_encode([
        'success' => true,
        'message' => 'Verification code sent to your registered email. It is valid for 1 minute.'
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}