# 🚀 Comment Déployer sur Votre Serveur

## 📍 Étape 1: Se Connecter au Serveur

```bash
# Connectez-vous à votre serveur via SSH
ssh username@votre-serveur.com

# Ou avec un port spécifique
ssh -p 22 username@votre-serveur.com
```

**Remplacez:**
- `username` par votre nom d'utilisateur
- `votre-serveur.com` par l'adresse IP ou domaine de votre serveur

### Exemple
```bash
ssh root@192.168.1.100
# ou
ssh kumbi@sedi-server.sedi-ati.com
```

## 📦 Étape 2: Installer les Prérequis (si pas déjà fait)

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt install docker-compose -y

# Vérifier l'installation
docker --version
docker-compose --version
```

## 📥 Étape 3: Cloner le Code depuis GitHub

```bash
# Aller dans un dossier approprié (ex: /opt)
cd /opt

# Cloner le repository
git clone https://github.com/Curtis736/ticketsv2.git

# Entrer dans le dossier
cd ticketsv2
```

## ⚙️ Étape 4: Configurer les Variables d'Environnement

```bash
# Créer le fichier .env
nano .env
```

**Collez ces informations (remplacez par vos VRAIES clés):**
```env
JWT_SECRET=votre-cle-secrete-très-longue-et-random
SENDGRID_API_KEY=votre-cle-api-sendgrid
SENDGRID_FROM_EMAIL=kumbi.c@sedi-ati.com
ADMIN_EMAIL=ladislas.c@sedi-ati.com
```

**Sauvegarder**: Ctrl+X, puis Y, puis Enter

## 🐳 Étape 5: Lancer l'Application

```bash
# Build et démarrer les containers
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f
```

## ✅ Étape 6: Vérifier que Tout Fonctionne

```bash
# Vérifier les containers
docker-compose ps

# Devrait afficher:
# ticket-backend  Up sur port 5050
# ticket-frontend Up sur port 3064
```

## 🌐 Étape 7: Accéder à l'Application

Sur votre navigateur, allez sur:
- **Application**: http://VOTRE-SERVEUR:3064
- **API Backend**: http://VOTRE-SERVEUR:5050
- **Admin Login**: http://VOTRE-SERVEUR:3064/login

**Identifiants admin:**
- Username: `admin`
- Password: `admin`

## 🔥 Ouvrir les Ports sur le Serveur (si nécessaire)

```bash
# Si vous utilisez un firewall (ex: UFW)
sudo ufw allow 3064/tcp
sudo ufw allow 5050/tcp
sudo ufw reload

# Vérifier
sudo ufw status
```

## 📝 Commandes Utiles Une Fois Déployé

```bash
# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter l'application
docker-compose down

# Redémarrer
docker-compose restart

# Mettre à jour le code
git pull
docker-compose build --no-cache
docker-compose up -d
```

## 🆘 En Cas de Problème

```bash
# Voir tous les logs
docker-compose logs

# Redémarrer tout
docker-compose down
docker-compose up -d

# Vérifier l'état
docker ps -a
```

## 📍 Résumé des Ports

- **3064**: Frontend (Interface utilisateur)
- **5050**: Backend API
- **Network**: ticket-network

**L'application est maintenant accessible depuis l'exterieur sur http://VOTRE-SERVEUR:3064**

