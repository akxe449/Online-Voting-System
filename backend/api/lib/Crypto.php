<?php

// ============================================================
// Minimal AES-256-GCM helpers so `encrypted_choice` is genuinely
// encrypted at rest, not just a column name. This is dev-only key
// handling for a 3-day build -- before this goes anywhere beyond a
// demo, move the key into a real secrets manager / KMS and out of
// source control. Regenerate your own key with:
//   openssl rand -hex 32
// ============================================================

const ELECTION_ENC_KEY_HEX = '12cf9a90ff6e59abef475fba47be056cad1f016555b72d608d17aaeb2059f24a';

function encryptChoice(string $candidateId): string
{
    $key = hex2bin(ELECTION_ENC_KEY_HEX);
    $iv = random_bytes(12);
    $tag = '';
    $ciphertext = openssl_encrypt($candidateId, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    return base64_encode($iv . $tag . $ciphertext);
}

function decryptChoice(string $encoded): string|false
{
    $key = hex2bin(ELECTION_ENC_KEY_HEX);
    $raw = base64_decode($encoded);
    $iv = substr($raw, 0, 12);
    $tag = substr($raw, 12, 16);
    $ciphertext = substr($raw, 28);
    return openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
}
