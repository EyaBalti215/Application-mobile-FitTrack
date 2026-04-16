# FitTrackApp - Projet Developpement Mobile

Application mobile de suivi sportif avec architecture complete:
- Frontend React Native (Expo)
- Backend Spring Boot securise JWT
- Base de donnees MySQL

Le projet est executable dans 2 modes:
- Mode sans Docker (developpement local classique)
- Mode Docker (frontend + backend + base de donnees en conteneurs)

## 0. Quick Start 

### 0.1 Lancement Docker en 3 commandes

Depuis la racine du projet:

```powershell
copy .env.docker.example .env
docker compose up -d --build
docker compose ps
```

Acces:
- Frontend web: http://localhost:19006
- Backend API: http://localhost:8082
- Healthcheck: http://localhost:8082/api/health

### 0.2 Lancement local (backend + mobile)

```powershell
cd backend
.\start-backend-8082.ps1

cd ..\fittrack-mobile
npm install
npm run start
```

## 1. Objectif du projet

Construire une application mobile realiste, de qualite professionnelle, avec:
- code propre et architecture claire
- UI/UX mobile fonctionnelle
- gestion des donnees avec CRUD complet
- depot Git bien organise
- conteneurisation Docker reproductible

## 2. Stack technique

### Mobile
- React Native + Expo
- React Navigation
- react-native-web (pour execution web en conteneur)

### Backend
- Java 17
- Spring Boot 3.3.1
- Spring Web, Validation, Data JPA, Security, Mail
- JWT (jjwt)
- Flyway (migrations SQL versionnees)

### Base de donnees
- MySQL 8.4

## 3. Architecture du depot

```text
Projet developpement mobile/
|- backend/
|  |- src/main/java/com/fittrack/
|  |  |- controller/
|  |  |- service/
|  |  |- repository/
|  |  |- model/
|  |  |- dto/
|  |  |- security/
|  |- src/main/resources/
|  |  |- application.yml
|  |  |- db/migration/V1__init_schema.sql
|  |- start-backend-8082.ps1
|  |- Dockerfile
|
|- fittrack-mobile/
|  |- src/
|  |- Dockerfile
|  |- .dockerignore
|
|- docker-compose.yml
|- .env.docker.example
|- README.md
```

## 4. Prerequis

- Node.js 18+ 
- npm
- Java 17
- MySQL 8+ (mode sans Docker)
- Docker Desktop (mode Docker)
- Expo Go (si test mobile natif)

Versions testees sur ce projet:
- Node.js 20.x
- Java 17
- MySQL 8.x
- Docker Desktop recent (Compose V2)

## 5. Mode 1 - Execution sans Docker

### 5.1 Backend local

1. Creer la base MySQL locale:

```sql
CREATE DATABASE fittrack_db;
```

2. Creer le fichier backend/.env.local:

```env
SERVER_PORT=8082
DB_URL=jdbc:mysql://localhost:3306/fittrack_db?useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=

MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USERNAME=<ethereal_username>
MAIL_PASSWORD=<ethereal_password>
MAIL_FROM=<ethereal_email>
MAIL_SMTP_AUTH=true
MAIL_STARTTLS_ENABLE=true
MAIL_FAIL_ON_ERROR=true

OTP_RETURN_CODE_IN_RESPONSE=false
PASSWORD_RESET_RETURN_LINK_IN_RESPONSE=false
PASSWORD_RESET_URL_TEMPLATE=fittrack://reset-password?otpId={otpId}&code={code}
```

3. Lancer le backend avec le script recommande:

```powershell
cd backend
.\start-backend-8082.ps1
```

Ce script:
- libere le port si possible
- bascule automatiquement sur un port libre si 8082 est bloque
- injecte SERVER_PORT avant demarrage Spring Boot

### 5.2 Frontend local

```powershell
cd fittrack-mobile
npm install
npm run start
```

Options utiles:
- npm run web
- npm run android
- npm run ios

## 6. Mode 2 - Execution avec Docker (frontend + backend + db)

### 6.1 Preparation

Depuis la racine du projet:

```powershell
copy .env.docker.example .env
```

Variables principales du .env Docker:
- BACKEND_PORT=8082
- FRONTEND_PORT=19006
- MYSQL_HOST_PORT=3307
- MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD
- variables MAIL_*

Important pour mode Docker (SMTP Ethereal obligatoire):
- MAIL_FAIL_ON_ERROR=true
- OTP_RETURN_CODE_IN_RESPONSE=false

Mode exige par le projet: OTP uniquement par email Ethereal (pas de code OTP dans la reponse API).
Renseigne obligatoirement MAIL_USERNAME, MAIL_PASSWORD et MAIL_FROM dans .env.

### 6.2 Lancement

```powershell
docker compose up -d --build
```

### 6.3 Verification

```powershell
docker compose ps
docker compose logs -f backend
```

### 6.4 Acces

- Frontend web (Expo): http://localhost:19006
- Backend API: http://localhost:8082
- MySQL (depuis machine locale): localhost:3307

Notes de test:
- http://localhost:3307 n est pas une page web (c est un port MySQL), donc le navigateur affichera une erreur: c est normal.
- Test backend rapide dans le navigateur: http://localhost:8082/api/health
- En mode Docker actuel, le service frontend est prevu pour test Web.
- Pour test mobile natif (Expo Go), lance le frontend localement (npm run start) et garde backend+db en Docker.

### 6.5 Arret

```powershell
docker compose down
```

Reset complet (avec volume DB):

```powershell
docker compose down -v
```

## 7. Base de donnees, schema et migrations

Schema relationnel normalise (tables principales):
- users
- activities (FK user_id -> users.id)
- goals (FK user_id -> users.id)
- otp_codes (FK user_id -> users.id)

Migration versionnee:
- backend/src/main/resources/db/migration/V1__init_schema.sql

Flyway est active dans backend/src/main/resources/application.yml.

## 7.1 UI/UX mobile 

- Ecran connexion / inscription
- Dashboard utilisateur
- Liste des activites (CRUD)
- Liste des objectifs (CRUD)
- Profil / parametres



## 8. CRUD fonctionnel

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-otp
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Profile
- GET /api/profile
- PUT /api/profile

### Activities
- GET /api/activities
- POST /api/activities
- PUT /api/activities/{id}
- DELETE /api/activities/{id}

### Goals
- GET /api/goals
- POST /api/goals
- PUT /api/goals/{id}
- DELETE /api/goals/{id}

### Stats / Notifications
- GET /api/stats
- GET /api/notifications

## 8.1 Scenario d utilisation 

1. Creer un compte via POST /api/auth/register.
2. Verifier OTP recu par email Ethereal.
3. Se connecter via POST /api/auth/login.
4. Creer une activite via POST /api/activities.
5. Modifier l activite via PUT /api/activities/{id}.
6. Creer un objectif via POST /api/goals.
7. Consulter les stats via GET /api/stats.
8. Supprimer une activite ou un objectif pour montrer le DELETE.

Collection API disponible:
- backend/fittrack.postman_collection.json

## 9. Correction de l'erreur "Port 8082 already in use"

Cause: un autre processus ecoute deja sur 8082.

Solutions:

1. Utiliser le script:

```powershell
cd backend
.\start-backend-8082.ps1
```

2. Ou tuer manuellement le processus:

```powershell
Get-NetTCPConnection -LocalPort 8082 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

3. Ou lancer sur un autre port:

```powershell
.\start-backend-8082.ps1 -Port 8083
```





## 12. Validation finale 

### 12.1 Verifications techniques minimales

Backend:
```powershell
cd backend
.\mvnw clean test
```

Frontend:
```powershell
cd fittrack-mobile
npm install
npm run start
```

Docker:
```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```



