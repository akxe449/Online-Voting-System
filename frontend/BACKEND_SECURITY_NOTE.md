# Backend security requirement

The mobile app now enforces this registration password policy:

- at least 10 characters
- one uppercase letter
- one lowercase letter
- one number
- one special character
- no spaces

**The PHP `register.php` endpoint must enforce the same policy server-side.**
Client-side validation alone can be bypassed by calling the API directly.

Recommended PHP validation:

```php
if (
    strlen($password) < 10 ||
    !preg_match('/[A-Z]/', $password) ||
    !preg_match('/[a-z]/', $password) ||
    !preg_match('/[0-9]/', $password) ||
    !preg_match('/[^A-Za-z0-9\s]/', $password) ||
    preg_match('/\s/', $password)
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 10 characters and contain uppercase, lowercase, number, special character, and no spaces.'
    ]);
    exit;
}
```

## Aadhaar

The app validates 12-digit format plus the mathematical Verhoeff checksum. This does **not** prove that an Aadhaar number is real, active, or belongs to the voter. Genuine Aadhaar identity verification requires an authorised integration/provider and appropriate compliance. Do not claim local checksum validation is UIDAI verification.
