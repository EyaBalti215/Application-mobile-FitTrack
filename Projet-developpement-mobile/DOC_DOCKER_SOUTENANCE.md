# Documentation Docker - FitTrack (Version soutenance)

## 1. Contexte du projet

Ce projet FitTrack est compose de 3 services Docker lances avec Docker Compose:

- db: MySQL 8.4
- backend: Spring Boot (Java 17)
- frontend: Expo Web (React Native)

## 2. Architecture Docker du projet

Services et conteneurs observes:

- Service db -> conteneur fittrack-mysql
- Service backend -> conteneur fittrack-backend
- Service frontend -> conteneur fittrack-mobile-web

Ports utilises:

- Frontend web: http://localhost:19006
- Backend API: http://localhost:8082
- MySQL host: localhost:3307 (redirige vers 3306 dans le conteneur)

## 3. Prerequis

- Docker Desktop installe et demarre
- Terminal PowerShell
- Projet ouvert dans le dossier:
  - C:/Users/Eya/Desktop/Projet developpement mobile

## 4. Configuration .env

Le fichier .env doit contenir au minimum:

- BACKEND_PORT=8082
- FRONTEND_PORT=19006
- MYSQL_HOST_PORT=3307
- MYSQL_DATABASE=fittrack_db
- MYSQL_USER=fittrack
- MYSQL_PASSWORD=fittrack123
- MYSQL_ROOT_PASSWORD=root123

Variables mail a renseigner selon votre compte Ethereal:

- MAIL_HOST=smtp.ethereal.email
- MAIL_PORT=587
- MAIL_USERNAME=...
- MAIL_PASSWORD=...
- MAIL_FROM=...

## 5. Etapes Docker realisees (ordre officiel)

### Etape 1 - Ouvrir le projet

~~~powershell
cd "C:/Users/Eya/Desktop/Projet developpement mobile"
~~~

Capture a faire:

- Le terminal positionne dans le bon dossier

### Etape 2 - Verifier Docker et Compose

~~~powershell
docker --version
docker compose version
~~~

Resultat attendu:

- Docker disponible
- Docker Compose disponible

Capture a faire:

- Versions Docker + Compose

### Etape 3 - Construire et demarrer les services

~~~powershell
docker compose up -d --build
~~~

Resultat attendu:

- Build backend + frontend
- Pull image mysql:8.4
- Services demarres en arriere-plan

Capture a faire:

- Fin de commande avec succes (services up)

### Etape 4 - Verifier etat des conteneurs

~~~powershell
docker compose ps
~~~

Resultat attendu:

- fittrack-backend: Up
- fittrack-mobile-web: Up
- fittrack-mysql: Up (healthy)

Capture a faire:

- Tableau docker compose ps avec les 3 conteneurs et les ports

### Etape 5 - Verifier images utilisees

~~~powershell
docker compose images
~~~

Resultat attendu:

- projetdeveloppementmobile-backend:latest
- projetdeveloppementmobile-frontend:latest
- mysql:8.4

Capture a faire:

- Liste des images

### Etape 6 - Verifier logs backend

~~~powershell
docker compose logs --tail=40 backend
~~~

Resultat attendu (points importants):

- Tomcat initialized with port 8082
- HikariPool start completed
- Flyway: schema up to date
- Started FittrackApplication

Capture a faire:

- Partie du log qui montre demarrage backend reussi

### Etape 7 - Verifier logs base de donnees

~~~powershell
docker compose logs --tail=20 db
~~~

Resultat attendu:

- MySQL ready for connections
- Port 3306 actif dans le conteneur

Capture a faire:

- Ligne ready for connections

### Etape 8 - Verifier logs frontend

~~~powershell
docker compose logs --tail=20 frontend
~~~

Resultat attendu:

- Metro Bundler demarre
- Waiting on http://localhost:19006

Capture a faire:

- Ligne Waiting on http://localhost:19006

### Etape 9 - Test fonctionnel API

~~~powershell
Invoke-WebRequest -Uri "http://localhost:8082/api/health" | Select-Object StatusCode, Content
~~~

Resultat attendu:

- StatusCode 200
- Reponse de health check

Capture a faire:

- Reponse de la commande health

### Etape 10 - Test acces frontend

Action:

- Ouvrir navigateur sur http://localhost:19006

Capture a faire:

- Ecran d accueil de l application

### Etape 11 - Verification volume Docker

~~~powershell
docker volume ls
~~~

Resultat attendu:

- Volume du compose pour MySQL (mysql_data)

Capture a faire:

- Ligne du volume lie au projet

### Etape 12 - Arret des services

~~~powershell
docker compose down
~~~

Resultat attendu:

- Conteneurs arretes et supprimes

Capture a faire:

- Confirmation de suppression des services

### Etape 13 - Nettoyage complet (optionnel)

~~~powershell
docker compose down -v
~~~

Resultat attendu:

- Conteneurs supprimes
- Volume base de donnees supprime

Capture a faire:

- Confirmation remove volume

## 6. Liste de captures d ecran a rendre

1. Version Docker et Compose
2. docker compose up -d --build termine avec succes
3. docker compose ps (3 conteneurs, db healthy)
4. docker compose images
5. Logs backend (Tomcat 8082 + app started)
6. Logs db (ready for connections)
7. Logs frontend (Waiting on localhost:19006)
8. Test health API (status 200)
9. Frontend ouvert dans navigateur
10. docker volume ls
11. docker compose down

## 7. Commandes completes a copier-coller

~~~powershell
cd "C:/Users/Eya/Desktop/Projet developpement mobile"

docker --version
docker compose version

docker compose up -d --build

docker compose ps
docker compose images

docker compose logs --tail=40 backend
docker compose logs --tail=20 db
docker compose logs --tail=20 frontend

Invoke-WebRequest -Uri "http://localhost:8082/api/health" | Select-Object StatusCode, Content

docker volume ls

docker compose down
# optionnel
# docker compose down -v
~~~

## 8. Texte court a dire a la soutenance (30-45 secondes)

Nous avons conteneurise l application FitTrack en 3 services avec Docker Compose: MySQL, backend Spring Boot et frontend Expo Web. Nous avons construit et lance les services avec docker compose up -d --build, puis verifie leur etat via docker compose ps. La base est healthy, le backend demarre sur le port 8082, et le frontend est accessible sur le port 19006. Les logs backend, db et frontend prouvent que chaque composant fonctionne correctement. Enfin, nous avons valide l API avec le endpoint health et documente toutes les commandes avec captures d ecran pour garantir la reproductibilite du deploiement.

## 9. Annexes utiles (si question du jury)

Commande pour entrer dans MySQL et verifier la base:

~~~powershell
docker exec -it fittrack-mysql mysql -u fittrack -pfittrack123 -e "SHOW DATABASES;"
~~~

Commande pour inspecter un conteneur:

~~~powershell
docker inspect fittrack-backend
~~~

Commande pour voir l utilisation des ressources:

~~~powershell
docker stats --no-stream
~~~
