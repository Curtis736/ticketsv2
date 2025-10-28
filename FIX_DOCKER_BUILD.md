# 🔧 Instructions pour Corriger le Build Docker

## Sur le serveur, exécutez ces commandes dans l'ordre :

### 1. Arrêter et nettoyer tout
```bash
cd ~/ticketsv2
docker-compose down
docker system prune -af
```

### 2. Récupérer les derniers changements
```bash
git pull
```

### 3. Rebuild sans cache
```bash
docker-compose build --no-cache
```

### 4. Démarrer les services
```bash
docker-compose up -d
```

### 5. Vérifier les logs
```bash
docker-compose logs -f
```

---

## Si ça ne fonctionne toujours pas, forcez la suppression des containers corrompus :

```bash
# Arrêter Docker Compose
docker-compose down

# Supprimer les containers manquants
docker ps -a | grep ticket | awk '{print $1}' | xargs docker rm -f 2>/dev/null

# Supprimer les images
docker images | grep ticket | awk '{print $3}' | xargs docker rmi -f 2>/dev/null

# Nettoyer le cache Docker
docker system prune -af --volumes

# Rebuild complet
docker-compose build --no-cache --pull

# Démarrer
docker-compose up -d

# Vérifier
docker-compose ps
docker-compose logs -f
```

---

## Vérifier que les changements ont été appliqués

```bash
# Vérifier le Dockerfile backend
cat backend/Dockerfile | grep "npm install"

# Vérifier le Dockerfile frontend
cat frontend/Dockerfile | grep "npm install"

# Vous devriez voir "npm install" (et non "npm ci")
```

