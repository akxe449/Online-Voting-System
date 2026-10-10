# Secure Online Voting System

# # APP DEMO: [https://drive.google.com/file/d/1clpKDtjHPfDPezfiDoiOHR60SfGX1nC1/view?usp=sharing](https://drive.google.com/file/d/1EJrRwb379m3vuEtc5U1GImH8Wzgg1x6I/view?usp=sharing)



A secure online voting system with constituency-based election selection, voter-ID lookup, email OTP verification, device/biometric verification, time-slot selection, candidate selection, encrypted ballot storage, and audit logging.

## Voting flow

1. Select constituency
2. Select an election available for that constituency
3. Enter voter ID
4. Backend validates the voter and constituency
5. OTP is sent to the voter's registered email
6. OTP is valid for 1 minute
7. Verify the device/biometric step
8. Select an available time slot
9. Live camera preview during the voting screens
10. Select a candidate
11. Cast the vote
12. Backend encrypts the selected choice and records ballot/audit information
13. Show voting confirmation

## Repository structure

```text
secure-online-voting-system/
├── frontend/                 # Expo React Native application
├── backend/                  # PHP API
│   ├── api/
│   ├── config/
│   ├── composer.json
│   └── composer.lock
├── database/                 # Supplied database migration
├── docs/
├── .gitignore
└── README.md
```

## Technologies

- React Native with Expo
- TypeScript
- Expo Router
- PHP
- MySQL / MariaDB
- REST-style JSON APIs
- PHPMailer
- Expo Local Authentication
- Expo Camera
- AES-256-GCM ballot encryption
- Composer

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set `EXPO_PUBLIC_API_URL` in `.env.local` to the backend API URL.

For local development it can point to the laptop's LAN address. For a production APK it must be a public HTTPS URL.

Then:

```bash
npx expo start -c
```

## Backend setup

The backend expects PHP, Apache, and MySQL/MariaDB.

```bash
cd backend
composer install
cp config/database.example.php config/database.php
cp config/mail.example.php config/mail.php
```

Configure the local database and Gmail SMTP/App Password in those local config files.

**Never commit `database.php` or `mail.php`.**

## Database

Create the `voting_system` database in MySQL/MariaDB and run:

```text
database/01_constituency_migration.sql
```

The supplied migration creates/updates constituency and voter/election constituency fields.

The repository does not contain a live database dump or live voter records.

## Main API endpoints

```text
backend/api/
├── list-constituencies.php
├── list-elections.php
├── create-intent.php
├── otp-request.php
├── otp-verify.php
├── device-bind.php
├── list-time-slots.php
├── select-time-slot.php
├── list-candidates.php
└── cast-vote.php
```

## Security features

- Backend-enforced constituency matching
- One-minute OTP expiry
- OTP hashing and verification
- Anonymous credential-token workflow
- Single-use credential tokens
- Device binding
- Biometric/device authentication
- AES-256-GCM ballot encryption
- Audit logging
- PDO prepared statements
- HTTPS required for production configuration
- Separation between voter verification and the anonymous voting path

## Security / deployment note

Live Gmail credentials, database credentials, and other deployment secrets are intentionally excluded from this repository. Use the example configuration files for local setup.

## Source versions

The frontend is based on the E2E-working project archive supplied for this submission. The backend is based on the working PHP backend archive supplied alongside it.
