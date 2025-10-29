#!/bin/bash

# Script d'installation SSL pour sedi-tickets.sedi-ati.com
# Usage: sudo ./setup-ssl.sh

set -e

DOMAIN="sedi-tickets.sedi-ati.com"
NGINX_CONF="/etc/nginx/sites-available/sedi-tickets"

echo "🔒 Installation SSL pour $DOMAIN"
echo ""

# Vérifier qu'on est root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Veuillez exécuter avec sudo"
    exit 1
fi

# 1. Mettre à jour le système
echo "📦 Mise à jour du système..."
apt update

# 2. Installer Certbot
echo "📦 Installation de Certbot..."
apt install -y certbot python3-certbot-nginx

# 3. Créer le répertoire pour les challenges SSL
echo "📁 Création du répertoire pour les challenges SSL..."
mkdir -p /var/www/certbot

# 4. Vérifier que Nginx est installé
if ! command -v nginx &> /dev/null; then
    echo "📦 Installation de Nginx..."
    apt install -y nginx
fi

# 5. Vérifier que la config Nginx existe
if [ ! -f "$NGINX_CONF" ]; then
    echo "⚠️  Configuration Nginx non trouvée : $NGINX_CONF"
    echo "📝 Création de la configuration de base..."
    
    cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://localhost:3064;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:5050;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Créer le lien symbolique
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
fi

# 6. Tester la configuration Nginx
echo "🧪 Test de la configuration Nginx..."
nginx -t

# 7. Recharger Nginx
echo "🔄 Rechargement de Nginx..."
systemctl reload nginx

# 8. Vérifier le firewall
echo "🔥 Configuration du firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable 2>/dev/null || true

# 9. Vérifier DNS
echo "🌐 Vérification DNS..."
DNS_IP=$(dig +short $DOMAIN | tail -n1)
if [ -z "$DNS_IP" ]; then
    echo "⚠️  ATTENTION: Le DNS pour $DOMAIN ne résout pas !"
    echo "   Configurez d'abord le DNS avant de continuer."
    echo "   Type A: $DOMAIN → IP_de_votre_serveur"
    read -p "Continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ DNS résolu : $DOMAIN → $DNS_IP"
fi

# 10. Obtenir le certificat SSL
echo ""
echo "🔐 Installation du certificat SSL..."
echo "   Répondez aux questions suivantes :"
echo "   - Email : votre email (pour notifications)"
echo "   - Terms : Accepter (A)"
echo "   - Redirect : Oui (2)"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

certbot --nginx -d $DOMAIN

# 11. Activer le renouvellement automatique
echo "⏰ Activation du renouvellement automatique..."
systemctl enable certbot.timer
systemctl start certbot.timer

# 12. Vérifier l'installation
echo ""
echo "✅ Installation terminée !"
echo ""
echo "🔍 Vérification..."
certbot certificates

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Testez : https://$DOMAIN"
echo "   2. Vérifiez le cadenas vert 🔒 dans le navigateur"
echo "   3. Le certificat sera renouvelé automatiquement"
echo ""
echo "🔧 Commandes utiles :"
echo "   - Renouveler manuellement : sudo certbot renew"
echo "   - Voir les certificats : sudo certbot certificates"
echo "   - Tester le renouvellement : sudo certbot renew --dry-run"

