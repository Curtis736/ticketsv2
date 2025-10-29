#!/bin/bash

# Script de sauvegarde de la base de données
# Usage: ./backup-db.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tickets-$TIMESTAMP.db"

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "💾 Sauvegarde de la base de données..."

# Copier la base depuis le volume Docker
if docker ps | grep -q ticket-backend; then
    # Si le container est en cours d'exécution
    docker cp ticket-backend:/app/data/tickets.db "$BACKUP_FILE"
    echo "✅ Sauvegarde créée : $BACKUP_FILE"
else
    # Si le container n'est pas en cours, copier depuis le volume Docker directement
    VOLUME_PATH=$(docker volume inspect ticketsv2_db-data --format '{{ .Mountpoint }}' 2>/dev/null)
    if [ -n "$VOLUME_PATH" ] && [ -f "$VOLUME_PATH/tickets.db" ]; then
        sudo cp "$VOLUME_PATH/tickets.db" "$BACKUP_FILE"
        sudo chown $USER:$USER "$BACKUP_FILE"
        echo "✅ Sauvegarde créée : $BACKUP_FILE"
    else
        echo "⚠️  Erreur : Impossible de trouver la base de données"
        echo "   Vérifiez que le volume Docker 'ticketsv2_db-data' existe"
        exit 1
    fi
fi

# Compter les tickets dans la sauvegarde
if command -v sqlite3 &> /dev/null; then
    TICKET_COUNT=$(sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM tickets;" 2>/dev/null)
    echo "📊 Nombre de tickets sauvegardés : $TICKET_COUNT"
fi

echo ""
echo "💡 Pour restaurer : docker cp $BACKUP_FILE ticket-backend:/app/data/tickets.db"
echo "   Puis : docker-compose restart backend"

