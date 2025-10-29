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
VOLUME_PATH=$(docker volume inspect ticketsv2_db-data --format '{{ .Mountpoint }}' 2>/dev/null)

if [ -n "$VOLUME_PATH" ] && [ -f "$VOLUME_PATH/tickets.db" ]; then
    # Copier depuis le volume Docker directement (méthode la plus fiable)
    sudo cp "$VOLUME_PATH/tickets.db" "$BACKUP_FILE"
    sudo chown $USER:$USER "$BACKUP_FILE"
    echo "✅ Sauvegarde créée : $BACKUP_FILE"
elif docker ps | grep -q ticket-backend; then
    # Si le container est en cours d'exécution, copier depuis le container
    docker cp ticket-backend:/app/data/tickets.db "$BACKUP_FILE"
    echo "✅ Sauvegarde créée : $BACKUP_FILE"
else
    echo "⚠️  Attention : Impossible de trouver la base de données"
    echo "   Le volume Docker 'ticketsv2_db-data' existe-t Sud ?"
    echo "   Vérification : docker volume inspect ticketsv2_db-data"
    echo ""
    echo "💡 La base sera créée automatiquement au premier démarrage du container"
    exit 0  # Ne pas échouer, c'est peut-être juste que la DB n'existe pas encore
fi

# Compter les tickets dans la sauvegarde
if command -v sqlite3 &> /dev/null; then
    TICKET_COUNT=$(sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM tickets;" 2>/dev/null)
    echo "📊 Nombre de tickets sauvegardés : $TICKET_COUNT"
fi

echo ""
echo "💡 Pour restaurer : docker cp $BACKUP_FILE ticket-backend:/app/data/tickets.db"
echo "   Puis : docker-compose restart backend"

