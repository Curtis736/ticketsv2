# 💾 Sauvegarde des Tickets

## ⚠️ IMPORTANT : Sauvegarder AVANT tout git pull/rebuild

### Méthode 1 : Script automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x backup-db.sh

# Sauvegarder avant de faire quoi que ce soit
./backup-db.sh
```

Le script va créer un fichier dans `./backups/tickets-YYYYMMDD-HHMMSS.db`

### Méthode 2 : Sauvegarde manuelle

#### Si le container est en cours d'exécution :

```bash
# Créer un dossier de sauvegarde
mkdir -p backups

# Copier la base de données depuis le container
docker cp ticket-backend:/app/data/tickets.db ./backups/tickets-$(date +%Y%m%d-%H%M%S).db

# Vérifier que la sauvegarde existe
ls -lh backups/
```

#### Si le container n'est pas en cours d'exécution :

```bash
# Trouver le chemin du volume Docker
docker volume inspect ticketsv2_db-data

# Copier depuis le volume (remplacez le chemin si différent)
sudo cp /var/lib/docker/volumes/ticketsv2_db-data/_data/tickets.db ./backups/tickets-$(date +%Y%m%d-%H%M%S).db

# Donner les permissions à votre utilisateur
sudo chown $USER:$USER ./backups/tickets-*.db
```

## ✅ Procédure SÉCURISÉE pour git pull + rebuild

```bash
# 1. SAUVEGARDER D'ABORD (OBLIGATOIRE)
./backup-db.sh
# OU
docker cp ticket-backend:/app/data/tickets.db ./backups/tickets-$(date +%Y%m%d-%H%M%S).db

# 2. Vérifier que la sauvegarde a bien été créée
ls -lh backups/

# 3. Faire le pull
git pull

# 4. Reconstruire (la base de données sera préservée car dans un volume)
docker-compose up --build -d

# 5. Vérifier que les tickets sont toujours là
docker exec ticket-backend sqlite3 /app/data/tickets.db "SELECT COUNT(*) FROM tickets;"
```

## 🔄 Restaurer une sauvegarde (si problème)

```bash
# 1. Arrêter le backend
docker-compose stop backend

# 2. Copier la sauvegarde dans le container
docker cp ./backups/tickets-YYYYMMDD-HHMMSS.db ticket-backend:/app/data/tickets.db

# 3. Redémarrer le backend
docker-compose start backend

# 4. Vérifier
docker exec ticket-backend sqlite3 /app/data/tickets.db "SELECT COUNT(*) FROM tickets;"
```

## 📊 Vérifier les tickets sans restaurer

```bash
# Voir tous les tickets dans une sauvegarde
sqlite3 ./backups/tickets-YYYYMMDD-HHMMSS.db "SELECT * FROM tickets ORDER BY id DESC;"

# Compter les tickets
sqlite3 ./backups/tickets-YYYYMMDD-HHMMSS.db "SELECT COUNT(*) FROM tickets;"

# Voir les tickets par statut
sqlite3 ./backups/tickets-YYYYMMDD-HHMMSS.db "SELECT status, COUNT(*) FROM tickets GROUP BY status;"
```

## 🔒 Sécurité : La base est dans un VOLUME Docker

**Bonne nouvelle :** La base de données est stockée dans un **volume Docker persistant** (`ticketsv2_db-data`), donc :

- ✅ `git pull` ne supprime PAS la base
- ✅ `docker-compose down` ne supprime PAS la base (sauf avec `-v`)
- ✅ `docker-compose up --build` ne supprime PAS la base
- ❌ `docker-compose down -v` **SUPPRIME** la base (attention !)
- ❌ `docker volume rm ticketsv2_db-data` **SUPPRIME** la base (attention !)

## 💡 Bonnes pratiques

1. **TOUJOURS** sauvegarder avant un `docker-compose down -v`
2. **TOUJOURS** sauvegarder avant de supprimer un volume
3. **FAIRE** une sauvegarde quotidienne automatique (cron)
4. **GARDER** plusieurs sauvegardes (les plus récentes)

## 📅 Sauvegarde automatique quotidienne (Optionnel)

Créer un cron job pour sauvegarder automatiquement :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (sauvegarde tous les jours à 2h du matin)
0 2 * * * cd /home/maintenance/ticketsv2 && ./backup-db.sh >> /var/log/tickets-backup.log 2>&1

# Sauvegarder et quitter
```

## ✅ Résumé : Protocole de sécurité

```
AVANT git pull/rebuild :
1. ./backup-db.sh  ← TOUJOURS FAIRE ÇA
2. git pull
3. docker-compose up --build -d
4. Vérifier que tout est OK
```

**La base de données ne sera JAMAIS supprimée par git pull, mais il vaut mieux sauvegarder par précaution !** 🛡️

