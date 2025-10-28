# 🚀 Déploiement sur Votre Serveur

## Configuration Docker Complète

### Ports
- **Backend**: Port externe **5050** → Port interne 5000
- **Frontend**: Port **3064**
- **Réseau**: `ticket-network` (commun)

## 📦 Déployer Maintenant

### Sur Votre Serveur

```bash
# 1. Transférer le projet
scp -r ticket_v2/ user@votre-serveur.com:/opt/ticket-system/

# 2. SSH sur le serveur
ssh user@votre-serveur.com

# 3. Naviguer vers le dossier
cd /opt/ticket-system

# 4. Créer le fichier .env
cat > .env << 'EOF'
JWT_SECRET=changez-moi-en-production-$(openssl rand -hex 32)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your-email@example.com
ADMIN_EMAIL=admin@example.com
EOF

# 5. Build et démarrage
docker-compose build
docker-compose up -d

# 6. Voir les logs
docker-compose logs -f
```

### Accès

Une fois démarré:
- **Frontend**: http://votre-serveur:3064
- **Backend**: http://votre-serveur:5050
- **Admin**: http://votre-serveur:3064/login (admin/admin)

## ✅ Commandes Utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Rebuild après changements
docker-compose build --no-cache
docker-compose up -d

# Backup
docker cp ticket-backend:/app/tickets.db ./backup/
```

## 📊 Vérifier le Fonctionnement

```bash
# Health check backend
curl http://votre-serveur:5050/api/health

# Devrait retourner: {"status":"OK","timestamp":"..."}
```

## 🔒 Sécurité

1. **Changez JWT_SECRET** dans le .env
2. **Configurez un firewall**:
   ```bash
   sudo ufw allow 3064/tcp
   sudo ufw allow 5050/tcp
   ```
3. **Utilisez HTTPS** avec un reverse proxy nginx

## 🎯 Structure Docker

- **Backend**: Container `ticket-backend` sur port 5000 (exposé sur 5050)
- **Frontend**: Container `ticket-frontend` sur port 3064 avec nginx
- **Network**: `ticket-network` (communication interne)
- **Volume**: `tickets.db` persisté sur le système hôte

**Tout est prêt! Lancez `docker-compose up -d` sur votre serveur.** 🚀

