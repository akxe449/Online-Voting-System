# VoteSecure — professional mobile build

Based on the working `voting-app` supplied for the project.

Included:
- Professional voter-facing visual refresh
- Strict Indian mobile validation
- Aadhaar 12-digit + Verhoeff checksum validation (not UIDAI verification)
- Password policy: 10+ characters, uppercase, lowercase, number, special character, no spaces
- Live password strength indicator
- Strong-password generator
- Show/hide password controls
- Screenshot/screen-recording protection on sensitive voting screens via `expo-screen-capture`
- Voter-facing election results route removed
- Existing PHP API flow preserved

## Run

```bash
npm install
npx expo start
```

Backend URL remains:

`http://192.168.137.1/voting-system/backend/api/`

Keep Apache/MySQL running and keep the phone and laptop on the same network.

## Important

The PHP backend must independently enforce the password policy. See `BACKEND_SECURITY_NOTE.md`.

A real Aadhaar ownership check requires an authorised provider/integration. Local checksum validation is not proof of identity.
