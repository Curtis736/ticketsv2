# 🔧 Fix sur le Serveur - Erreur Docker

Si vous avez l'erreur `KeyError: 'ContainerConfig'`, voici la solution :

## 🔥 Solution Rapide

### Sur votre serveur Linux:

```bash
# 1. Arrêter tous les containers
docker-compose down

# 2. Supprimer tous les containers orphelins
docker rm -f $(docker ps -a -q)

# 3. Supprimer toutes les images
docker rmi -f $(docker images -q)

# 4. Nettoyer le système Docker
docker system prune -a -f --volumes

# 5. Aller dans le dossier du projet
cd /opt/ticketsv2

# 6. Rebuild complet
docker-compose build --no-cache

# 7. Démarrer
docker-compose up -d

# 8. Vérifier
docker-compose ps
docker-compose logs -f
```

## 🆘 Si Ça Ne Marche Toujours Pas

```bash
# Supprimer le fichier database problématique
rm backend/tickets.db

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## ✅ Vérification

```bash
# Voir les containers
docker ps

# Voir les logs
docker-compose logs backend --tail=50
docker-compose logs frontend --tail=50
```

## 📍 Accès

- Frontend: http://VOTRE-IP:3064
- Login: http://VOTRE-IP:3064/login

















