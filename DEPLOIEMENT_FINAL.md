# 🎉 Application Poussée sur GitHub!

## ✅ Repository

https://github.com/Curtis736/ticketsv2.git

## 🚀 Déployer sur Votre Serveur

### Sur le Serveur

```bash
# 1. Cloner
git clone https://github.com/Curtis736/ticketsv2.git
cd ticketsv2

# 2. Créer le fichier .env
cat > .env << 'EOF'
JWT_SECRET=changez-moi-$(openssl rand -hex 32)
SENDGRID_API_KEY=votre-cle-api-sendgrid
SENDGRID_FROM_EMAIL=kumbi.c@sedi-ati.com
ADMIN_EMAIL=ladislas.c@sedi-ati.com
EOF

# 3. Démarrer
docker-compose up -d
```

### Accès Production

- **Frontend**: http://votre-serveur:3064
- **Backend**: http://votre-serveur:5050
- **Admin**: http://votre-serveur:3064/login (admin/admin)

## 📊 Ports

- Frontend: **3064**
- Backend: **5050** (expose le port interne 5000)
- Network: **ticket-network**

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
```

## 🎯 C'est Prêt!

L'admin voit **TOUS les tickets**, y compris ceux créés par les utilisateurs anonymes! 🚀

