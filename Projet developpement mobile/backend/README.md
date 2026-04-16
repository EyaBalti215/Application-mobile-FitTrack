# FitTrack Backend

## 1) Prerequisites
- Java 17
- MySQL 8+

Maven global is optional because the project includes Maven Wrapper:
- .\mvnw.cmd (Windows)

## 2) Database
Create the database in MySQL:

```
CREATE DATABASE fittrack_db;
```

Schema migrations are versioned with Flyway:
- src/main/resources/db/migration/V1__init_schema.sql

## 3) Configure mail (OTP)
Create backend/.env.local with SMTP credentials:

```env
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USERNAME=<ethereal_username>
MAIL_PASSWORD=<ethereal_password>
MAIL_FROM=<ethereal_email>
```

## 4) Run
From the backend folder:

```
.\start-backend-8082.ps1
```

This startup script:
- frees port 8082 when possible,
- automatically selects a fallback port if 8082 remains busy,
- loads optional .env.local or .env.

Server default URL: http://localhost:8082

## Troubleshooting: Unsupported Database MySQL 5.5

If startup fails with `FlywayException: Unsupported Database: MySQL 5.5`, the app is connected to an old local MySQL instance.

Recommended fix:
- run MySQL 8+ (docker compose uses MySQL 8.4 on host port 3307),
- set `DB_URL` in `backend/.env.local` to point to that instance,
- rerun `./start-backend-8082.ps1`.

Example:

```env
DB_URL=jdbc:mysql://localhost:3307/fittrack_db?useSSL=false&serverTimezone=UTC
DB_USERNAME=fittrack
DB_PASSWORD=fittrack123
```

## 5) API summary
- POST /api/auth/register
- POST /api/auth/login (returns otpId)
- POST /api/auth/verify-otp (returns JWT)
- POST /api/auth/forgot-password (returns otpId)
- POST /api/auth/reset-password

- GET /api/profile
- PUT /api/profile

- GET /api/activities
- POST /api/activities
- PUT /api/activities/{id}
- DELETE /api/activities/{id}

- GET /api/goals
- POST /api/goals
- PUT /api/goals/{id}
- DELETE /api/goals/{id}

- GET /api/stats

## 6) Auth flow (2FA)
1. Register
2. Login with email + password
3. Receive OTP by email
4. Verify OTP to receive JWT
5. Use JWT with Authorization: Bearer <token>
