# 🐳 Test Docker en Local

## Configuration

Pour éviter les conflits de ports, utilisation de ports élevés:
- **Frontend**: Port **9064** (externe) → 3064 (interne)
- **Backend**: Port **9050** (externe) → 5000 (interne)

## 🚀 Tester Localement

### 1. Créer le fichier .env

```bash
cat > .env << 'EOF'
JWT_SECRET=test-local-123456
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your-email@example.com
ADMIN_EMAIL=admin@example.com
EOF
```

### 2. Build les images

```bash
docker-compose build
```

### 3. Démarrer les containers

```bash
docker-compose up
```

### 4. Accès Local

- **Frontend**: http://localhost:9064
- **Backend**: http://localhost:9050
- **Admin**: http://localhost:9064/login (admin/admin)
- **Health check**: http://localhost:9050/api/health

## ✅ Vérifications

### Tester le Backend

```bash
# Health check
curl http://localhost:9050/api/health

# Devrait retourner:
# {"status":"OK","timestamp":"..."}
```

### Tester le Frontend

1. Ouvrir http://localhost:9064
2. Créer un ticket
3. Se connecter en admin (admin/admin)
4. Voir le ticket créé

### Voir les logs

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service
docker-compose logs backend
docker-compose logs frontend
```

## 🛠️ Dépannage

### Arrêter les containers

```bash
docker-compose down
```

### Rebuild complet

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Voir les containers

```bash
docker ps
docker-compose ps
```

### Accès au shell du container

```bash
docker exec -it ticket-backend sh
docker exec -it ticket-frontend sh
```

## 📊 Commandes Utiles

```bash
# Tout arrêter
docker-compose down

# Redémarrer
docker-compose restart

# Voir les ports utilisés
netstat -an | grep 9064
netstat -an | grep 9050

# Inspecter le réseau
docker network inspect ticket-network
```

## 🎯 C'est Prêt!

Une fois démarré:
- Frontend: http://localhost:9064
- Backend: http://localhost:9050
- Admin: http://localhost:9064/login (admin/admin)

**Tous les tickets sont visibles pour l'admin!** ✅

