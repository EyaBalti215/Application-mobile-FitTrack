# FitTrack - Ethereal SMTP Setup (No Existing Account Needed)

This guide configures real email sending for OTP and password-reset links using Ethereal.

## 1) Create a free Ethereal mailbox

1. Open: https://ethereal.email/create
2. Click **Create Ethereal Account**.
3. Copy credentials:
- Username
- Password
- SMTP Host
- SMTP Port

Typical values:
- Host: `smtp.ethereal.email`
- Port: `587`

## 2) Configure environment variables (PowerShell)

Run this in a terminal before starting backend:

```powershell
$env:MAIL_HOST = "smtp.ethereal.email"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "<YOUR_ETHEREAL_USERNAME>"
$env:MAIL_PASSWORD = "<YOUR_ETHEREAL_PASSWORD>"
$env:MAIL_FROM = $env:MAIL_USERNAME
$env:MAIL_SMTP_AUTH = "true"
$env:MAIL_STARTTLS_ENABLE = "true"
$env:MAIL_FAIL_ON_ERROR = "true"
$env:OTP_RETURN_CODE_IN_RESPONSE = "false"
$env:PASSWORD_RESET_RETURN_LINK_IN_RESPONSE = "false"
$env:PASSWORD_RESET_URL_TEMPLATE = "http://localhost:8081/reset-password?otpId={otpId}&code={code}"
```

Secure mode (email-only):
- OTP/reset link are sent only by email to Ethereal.
- API responses never include `otpCode` or `resetLink`.

If your frontend reset screen is mobile deep-link based, use:

```powershell
$env:PASSWORD_RESET_URL_TEMPLATE = "fittrack://reset-password?otpId={otpId}&code={code}"
```

## 3) Start backend

```powershell
Set-Location "c:\Users\Eya\Desktop\Projet developpement mobile\backend"
.\start-backend-8082.ps1
```

This startup script automatically:
- checks if port `8082` is already in use,
- stops the conflicting process,
- starts Spring Boot on `8082`.

## 4) Verify email delivery

1. Call `POST /api/auth/forgot-password`.
2. Open Ethereal inbox preview:
- https://ethereal.email/messages
3. You should see the reset-link email (and OTP code in the email body).

## 5) Front-back network check (physical phone)

If mobile says `cannot reach API`:
- Backend must run on `0.0.0.0:8082` (Spring Boot default is fine for LAN).
- PC and phone must be on same Wi-Fi.
- Allow Java in Windows Firewall (Private network).
- In mobile app, set:
  - `EXPO_PUBLIC_API_BASE_URL=http://<PC_LAN_IP>:8082`

Example:

```powershell
Set-Location "c:\Users\Eya\Desktop\Projet developpement mobile\fittrack-mobile"
$env:EXPO_PUBLIC_API_BASE_URL = "http://192.168.100.83:8082"
npm start -- --tunnel
```

## 6) Postman quick usage

Use `fittrack.postman_collection.json` and set:
- `baseUrl` for local testing: `http://127.0.0.1:8082`
- `baseUrl` for LAN testing: `http://192.168.100.83:8082`
- `testEmail` to an email you want to test.

The collection now auto-stores:
- `otpId`
- `token`

In secure mode, OTP/reset link are not returned by API.

## 7) Troubleshooting: "Authentication failed"

If backend logs show:

`OTP email could not be sent ...: Authentication failed`

this means SMTP login failed (wrong host/user/password, not the recipient email).

Quick checks:

- Verify `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` are correct.
- For Ethereal, regenerate credentials from https://ethereal.email/create and re-export env vars.
- For Gmail SMTP:
  - `MAIL_HOST=smtp.gmail.com`
  - `MAIL_PORT=587`
  - `MAIL_USERNAME=<your gmail>`
  - `MAIL_PASSWORD=<Google App Password (16 chars)>` (not your normal Gmail password)

For local development only, you can continue OTP flow even if email delivery fails:

```powershell
$env:MAIL_FAIL_ON_ERROR = "false"
$env:OTP_RETURN_CODE_IN_RESPONSE = "true"
$env:PASSWORD_RESET_RETURN_LINK_IN_RESPONSE = "true"
```

Then restart backend. The API response will include `otpCode`/`resetLink` for testing.