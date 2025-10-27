# 🎫 Système de Gestion de Tickets

Application complète de gestion de tickets pour entreprises avec interface publique et espace administrateur.

## 🚀 Démarrage Rapide (Développement Local)

### Prérequis
- Node.js 18+
- npm

### Installation

```bash
# Backend
cd backend
npm install
npm start

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

### Accès Local
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin: http://localhost:5173/login (admin/admin)

## 🐳 Déploiement avec Docker (Production)

### Sur Votre Serveur

```bash
# 1. Clone ou transférez les fichiers sur votre serveur
git clone <repo> ou scp -r ticket_v2/

# 2. Configurez le .env
cat > .env << EOF
JWT_SECRET=votre-cle-secrete-changez-en-production
SENDGRID_API_KEY=votre-cle-api-sendgrid
SENDGRID_FROM_EMAIL=votre-email@domain.com
ADMIN_EMAIL=admin@domain.com
EOF

# 3. Build et démarrez
docker-compose build
docker-compose up -d
```

### Accès Production
- Frontend: http://votre-serveur:3064
- Backend: http://votre-serveur:5050
- Admin: http://votre-serveur:3064/login (admin/admin)

## ✨ Fonctionnalités

### 🔓 Côté Public
- Créer des tickets sans inscription
- Saisir nom, titre, catégorie, priorité, description
- Confirmation immédiate

### 🔐 Côté Admin
- Voir TOUS les tickets (y compris anonymes)
- Filtrer par statut
- Modifier le statut en temps réel
- Ajouter des notes administratives
- Statistiques par statut

### 📧 Notifications
- Email automatique à l'admin à chaque nouveau ticket
- Configuration SendGrid (pas de mot de passe requis)

## 📊 Base de Données

- **SQLite**: Base locale `backend/tickets.db`
- **Tables**: users, tickets
- **Persistance**: Volume Docker

## 🔧 Configuration

### Variables d'environnement (.env)
```env
PORT=5000
JWT_SECRET=change-moi-en-production
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=votre-email@domain.com
ADMIN_EMAIL=admin@domain.com
```

## 📝 Structure

```
ticket_v2/
├── backend/              # API Node.js + Express
│   ├── models/          # SQLite models
│   ├── routes/          # Routes API
│   ├── tickets.db      # Base de données
│   └── Dockerfile       # Image Docker
├── frontend/            # React + Vite
│   ├── src/pages/       # Composants
│   └── Dockerfile       # Image Docker
├── docker-compose.yml   # Orchestration
└── DEPLOY.md            # Guide déploiement
```

## 🎯 Ports

- **Backend**: 5000 (interne), 5050 (externe)
- **Frontend**: 3064
- **Réseau**: ticket-network

## 📚 Documentation

- [DEPLOY.md](DEPLOY.md) - Guide de déploiement Docker
- [INSTRUCTIONS_DEPLOIEMENT.md](INSTRUCTIONS_DEPLOIEMENT.md) - Instructions détaillées
- [TROUBLESHOOTING_EMAIL.md](TROUBLESHOOTING_EMAIL.md) - Résolution problèmes email

## ✅ Déploiement Vérifié

- ✅ Backend dockerisé
- ✅ Frontend dockerisé  
- ✅ Network configuré
- ✅ Ports exposés correctement
- ✅ Persistance des données
- ✅ Admin voit tous les tickets

**Prêt pour la production!** 🚀
