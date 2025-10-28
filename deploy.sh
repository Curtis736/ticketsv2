#!/bin/bash

echo "🚀 Déploiement de l'application..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé!"
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your-email@example.com
ADMIN_EMAIL=admin@example.com
EOF
    echo "✅ Fichier .env créé"
fi

# Build et start
echo "🔨 Build des images Docker..."
docker-compose build

echo "🚀 Démarrage des containers..."
docker-compose up -d

echo "✅ Application déployée!"
echo ""
echo "📊 Accès:"
echo "  - Frontend: http://$(hostname -I | awk '{print $1}'):3064"
echo "  - Backend: http://$(hostname -I | awk '{print $1}'):5050"
echo "  - Admin: http://$(hostname -I | awk '{print $1}'):3064/login (admin/admin)"
echo ""
echo "📝 Voir les logs: docker-compose logs -f"

