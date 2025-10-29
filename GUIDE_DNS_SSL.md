# 🌐 Guide Complet : Configuration DNS + HTTPS (SSL)

## 📋 Étape 1 : Configuration DNS

### Obtenir l'IP de votre serveur

```bash
# Sur votre serveur, exécutez :
curl -s ifconfig.me
# ou
hostname -I | awk '{print $1}'
```

Notez cette IP (exemple: `192.168.1.100` ou `185.123.45.67`)

### Configurer l'enregistrement DNS

#### Option A : Chez votre registrar de domaine (OVH, Namecheap, GoDaddy, etc.)

1. Connectez-vous à votre panneau de gestion de domaine
2. Accédez à la gestion DNS de Shelydomain (ex: `sedi-ati.com`)
3. Créez un **enregistrement A** :
   - **Type** : A
   - **Nom/Sous-domaine** : `sedi-tickets` (ou `tickets`)
   - **Valeur/IP** : L'IP de votre serveur (ex: `185.123.45.67`)
   - **TTL** : 3600 (1 heure) ou 300 (5 minutes) pour tester rapidement

#### Option B : Si vous utilisez Cloudflare

1. Connectez-vous à Cloudflare
2. Sélectionnez votre domaine `sedi-ati.com`
3. Allez dans **DNS** → **Records**
4. Ajoutez :
   - **Type** : A
   - **Name** : sedi-tickets
   - **IPv4 address** : L'IP de votre serveur
   - **Proxy status** : **DNS only** (désactiver le proxy orange pour SSL natif)
   - **TTL** : Auto

### Vérifier la propagation DNS

```bash
# Vérifier si le DNS fonctionne
dig +short sedi-tickets.sedi-ati.com

# ou
nslookup sedi-tickets.sedi-ati.com

# Doit retourner l'IP de votre serveur
```

⏱️ **Temps d'attente** : 5 minutes à 24 heures (généralement 5-30 minutes)

---

## 🔒 Étape 2 : Configuration HTTPS avec Let's Encrypt (GRATUIT)

### Prérequis
- DNS configuré et fonctionnel (voir étape 1)
- Nginx installé sur le serveur
- Port 80 et 443 ouverts dans le firewall

### Installation de Certbot

```bash
# Mettre à jour le système
sudo apt update

# Installer Certbot pour Nginx
sudo apt install certbot python3-certbot-nginx -y
```

### Installation du certificat SSL

```bash
# Obtenir et installer automatiquement le certificat SSL
sudo certbot --nginx -d sedi-tickets.sedi-ati.com

# Répondez aux questions :
# - Email : votre email (pour notifications de renouvellement)
# - Terms : Accepter (A)
# - Share email : Au choix (Y/N)
# - Redirect HTTP to HTTPS : Oui (2)
```

Certbot va :
- ✅ Obtenir le certificat SSL depuis Let's Encrypt
- ✅ Modifier automatiquement votre config Nginx
- ✅ Configurer le renouvellement automatique

### Vérifier l'installation

```bash
# Vérifier que le certificat est bien installé
sudo certbot certificates

# Tester le renouvellement (dry-run)
sudo certbot renew --dry-run
```

### Renouvellement automatique

Le certificat est renouvelé automatiquement par un cron job. Vérifiez :

```bash
# Voir les tâches cron de Certbot
systemctl status certbot.timervar

# Activer le timer (généralement déjà actif)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📝 Étape 3 : Configuration Nginx sur le serveur

### 1. Copier la configuration sur le serveur

```bash
# Sur votre serveur, copiez nginx-tickets.conf
sudo cp ~/ticketsv2/nginx-tickets.conf /etc/nginx/sites-available/sedi-tickets

# Créer le lien symbolique
sudo ln -sf /etc/nginx/sites-available/sedi-tickets /etc/nginx/sites-enabled/
```

### 2. Avant SSL : Configuration initiale (port 80 uniquement)

Temporairement, commentez la redirection HTTPS dans `/etc/nginx/sites-available/sedi-tickets` :

```nginx
server {
    listen 80;
    server_name sedi-tickets.sedi-ati.com _;
    
    # Temporaire : permettre HTTP pour la vérification SSL
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://localhost:3064;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Tester et recharger Nginx

```bash
# Créer le répertoire pour les challenges SSL
sudo mkdir -p /var/www/certbot

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4. Après SSL : Certbot modifiera automatiquement la config

Une fois Certbot exécuté, il ajoutera automatiquement :
- La configuration SSL
- Le bloc HTTPS
- La redirection HTTP → HTTPS

---

## 🔧 Étape 4 : Configuration du Firewall

```bash
# Ouvrir les ports nécessaires
sudo ufw allow 80/tcp   # HTTP (pour Let's Encrypt)
sudo ufw allow 443/tcp  # HTTPS (SSL)
sudo ufw allow 22/tcp   # SSH (si pas déjà ouvert)

# Appliquer les changements
sudo ufw reload

# Vérifier l'état
sudo ufw status
```

---

## ✅ Étape 5 : Vérification finale

### Test DNS

```bash
dig +short sedi-tickets.sedi-ati.com
# Doit retourner l'IP de votre serveur
```

### Test HTTP (avant SSL)

```bash
curl -I http://sedi-tickets.sedi-ati.com
# Doit retourner 200 OK
```

### Test HTTPS (après SSL)

```bash
curl -I https://sedi-tickets.sedi-ati.com
# Doit retourner 200 OK avec certificat valide
```

### Test depuis un navigateur

1. Ouvrez `https://sedi-tickets.sedi-ati.com`
2. Vérifiez le cadenas vert 🔒 dans la barre d'adresse
3. Vérifiez que vous êtes bien redirigé vers HTTPS

---

## 🎯 Résumé des étapes

1. ✅ **DNS** : Créer enregistrement A `sedi-tickets` → IP serveur
2. ✅ **Attendre** : Propagation DNS (5-30 min)
3. ✅ **Nginx** : Copier config sur serveur + recharger
4. ✅ **Firewall** : Ouvrir ports 80 et 443
5. ✅ **SSL** : Exécuter `certbot --nginx -d sedi-tickets.sedi-ati.com`
6. ✅ **Test** : Accéder à `https://sedi-tickets.sedi-ati.com`

---

## 🐛 Résolution de problèmes

### DNS ne fonctionne pas

```bash
# Vérifier la résolution DNS
dig sedi-tickets.sedi-ati.com

# Si ne retourne rien, vérifier :
# - L'enregistrement A est bien créé
# - L'IP est correcte
# - Attendre plus longtemps (jusqu'à 24h)
```

### Certbot échoue

```bash
# Vérifier les logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Vérifier que le port 80 est ouvert
sudo ufw status

# Vérifier que Nginx écoute sur port 80
sudo netstat -tlnp | grep :80
```

### Nginx ne démarre pas

```bash
# Vérifier la syntaxe
sudo nginx -t

# Voir les erreurs détaillées
sudo nginx -T | grep error

# Voir les logs
sudo tail -f /var/log/nginx/error.log
```

### Certificat expiré ou problème de renouvellement

```bash
# Renouveler manuellement
sudo certbot renew

# Voir les certificats installés
sudo certbot certificates

# Forcer le renouvellement
sudo certbot renew --force-renewal
```

---

## 📧 Mise à jour de l'email avec HTTPS

Après configuration SSL, mettez à jour l'URL dans l'email :

Dans `backend/routes/tickets-sqlite.js`, ligne 111, remplacez :
```javascript
href="${process.env.FRONTEND_URL || 'http://localhost:3064'}/admin"
```

Par :
```javascript
href="https://sedi-tickets.sedi-ati.com/admin"
```

Ou mieux, utilisez une variable d'environnement `FRONTEND_URL=https://sedi-tickets.sedi-ati.com`

---

## 🔐 Sécurité renforcée

### Recommandations supplémentaires

1. **Changer le mot de passe admin par défaut**
2. **Configurer un rate limiting plus strict** (déjà fait)
3. **Ajouter une authentification 2FA** (future amélioration)
4. **Surveiller les logs** régulièrement

### Headers de sécurité

Les headers de sécurité sont déjà configurés dans `nginx-tickets.conf` :
- ✅ Strict-Transport-Security (HSTS)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy

---

## 🎉 Résultat final

Une fois tout configuré :
- ✅ **DNS** : `sedi-tickets.sedi-ati.com` → IP serveur
- ✅ **HTTPS** : Certificat SSL valide et auto-renouvelé
- ✅ **Sécurité** : Headers de sécurité activés
- ✅ **Accès** : `https://sedi-tickets.sedi-ati.com` (sécurisé!)

**Tous les liens HTTP sont automatiquement redirigés vers HTTPS.** 🔒

