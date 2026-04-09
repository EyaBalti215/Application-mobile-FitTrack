# FitTrackApp – Projet de Développement Mobile

## Présentation

FitTrack est une application mobile dédiée au suivi des activités sportives. Elle permet aux utilisateurs de gérer leurs activités, fixer des objectifs et suivre leur progression.

Le projet repose sur une architecture complète composée de :
- un frontend mobile développé avec React Native (Expo)
- un backend REST sécurisé avec Spring Boot et JWT
- une base de données relationnelle MySQL

L’application peut être exécutée selon deux modes :
- en local (sans Docker)
- en mode conteneurisé avec Docker

---

## 1. Objectif du projet

L’objectif de ce projet est de concevoir une application mobile réaliste en respectant les bonnes pratiques de développement, notamment :

- structuration claire du code (architecture en couches)
- interface utilisateur simple et fonctionnelle
- implémentation complète des opérations CRUD
- sécurisation des accès avec authentification JWT
- utilisation de Docker pour garantir une exécution reproductible

---

## 2. Stack technique

### Frontend
- React Native (Expo)
- React Navigation
- react-native-web (pour exécution en navigateur)

### Backend
- Java 17
- Spring Boot 3.3.1
- Spring Web, Data JPA, Validation, Security, Mail
- JWT (authentification)
- Flyway (gestion des migrations)

### Base de données
- MySQL 8.4

---

## 3. Architecture du projet

Le projet est organisé en deux parties principales :

- backend : API Spring Boot
- fittrack-mobile : application React Native

Le backend suit une architecture en couches :
- controller : gestion des requêtes HTTP
- service : logique métier
- repository : accès aux données
- model / dto : structures de données
- security : configuration de la sécurité

---

## 4. Prérequis

Avant de lancer le projet, il est nécessaire d’installer :

- Node.js (version 18 ou plus)
- npm
- Java 17
- MySQL 8 (pour le mode local)
- Docker Desktop (pour le mode Docker)
- Expo Go (optionnel pour test mobile)

---

## 5. Exécution en mode local

### 5.1 Backend

1. Créer la base de données :

```sql
CREATE DATABASE fittrack_db;
Configurer le fichier .env.local avec les informations de connexion et SMTP.
Lancer le backend :
cd backend
.\start-backend-8082.ps1

Ce script permet de gérer automatiquement les conflits de port.

5.2 Frontend
cd fittrack-mobile
npm install
npm start

Commandes utiles :

npm run web
npm run android
npm run ios
6. Exécution avec Docker
6.1 Préparation

Copier le fichier d’environnement :

copy .env.docker.example .env

Configurer ensuite :

ports
accès base de données
paramètres SMTP (Ethereal)
6.2 Lancement
docker compose up -d --build
6.3 Vérification
docker compose ps
docker compose logs -f backend
6.4 Accès aux services
Frontend : http://localhost:19006
Backend : http://localhost:8082
MySQL : localhost:3307

Remarque : le port MySQL n’est pas accessible via un navigateur.

6.5 Arrêt
docker compose down

Réinitialisation complète :

docker compose down -v
7. Base de données et migrations

Le schéma de la base de données comprend :

users
activities
goals
otp_codes

Les migrations sont gérées avec Flyway pour versionner les changements.

8. Fonctionnalités (API)
Authentification
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
Profil
GET /api/profile
PUT /api/profile
Activités
GET /api/activities
POST /api/activities
PUT /api/activities/{id}
DELETE /api/activities/{id}
Objectifs
GET /api/goals
POST /api/goals
PUT /api/goals/{id}
DELETE /api/goals/{id}
Statistiques
GET /api/stats
GET /api/notifications
