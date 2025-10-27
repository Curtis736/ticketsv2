# 🌐 Configurer un Nom de Domaine

## Option 1: Configuration Simple (Port Direct)

### Utiliser le domaine avec le port:
```
http://tickets.sedi-ati.com:3064
```

**Configuration DNS:**
- Créez un **enregistrement A** pointant vers l'IP de votre serveur
- Exemple: `tickets.sedi-ati.com` → `192.168.1.100`

## Option 2: Configuration avec Reverse Proxy (Recommandé)

Cette option permet d'accéder **SANS** le port (http://tickets.sedi-ati.com).

### 1. Installer Nginx sur le Serveur

```bash
sudo apt update
sudo apt install nginx -y

# Vérifier
sudo systemctl status nginx
```

### 2. Créer la Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/tickets
```

**Collez cette configuration:**
```nginx
server {
    listen 80;
    server_name tickets.sedi-ati.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3064;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /api/health {
        proxy_pass http://localhost:5050;
    }
}
```

### 3. Activer le Site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/tickets /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### 4. Configurer le Firewall

```bash
# Ouvrir le port 80 (HTTP)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Pour HTTPS plus tard
sudo ufw reload
```

## 🌍 Configuration DNS

### Chez Votre Fournisseur de Domaine (ex: OVH, Cloudflare)

**Créer un enregistrement A:**
- Type: `A`
- Nom: `tickets` (ou `@` pour le domaine principal)
- Valeur: L'IP de votre serveur
- TTL: `3600` (1 heure)

### Exemple chez OVH:
```
Type    Nom         Valeur          TTL
A       tickets     192.168.1.100    3600
```

### Exemple chez Cloudflare:
```
Type    Name        IPv4 address    Proxy status
A       tickets     192.168.1.100   DNS only
```

## ✅ Test

Après configuration DNS (peut prendre 5-60 minutes):

```bash
# Vérifier le DNS
nslookup tickets.sedi-ati.com

# Tester l'accès
curl http://tickets.sedi-ati.com
```

## 🔒 Ajouter HTTPS (SSL) (Optionnel mais Recommandé)

### Avec Certbot (Let's Encrypt):

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d tickets.sedi-ati.com

# Le certificat sera auto-renouvelé
```

**Résultat:** `https://tickets.sedi-ati.com` (sécurisé!)

## 📊 Configuration Complète

Une fois configuré:

### Avec Nginx (Configuration Recommandée):
- **Accès**: `http://tickets.sedi-ati.com`
- **Admin**: `http://tickets.sedi-ati.com/login`
- **API**: `http://tickets.sedi-ati.com/api/health`

### Sans Nginx (Accès Direct):
- **Accès**: `http://tickets.sedi-ati.com:3064`
- **Admin**: `http://tickets.sedi-ati.com:3064/login`
- **API**: `http://192.168.1.100:5050/api/health`

## 🔧 Vérification Rapide

```bash
# Sur le serveur, vérifier que Docker tourne
docker-compose ps

# Vérifier Nginx
sudo systemctl status nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🎯 Exemple Complet

Si vous voulez `tickets.sedi-ati.com`:

1. **DNS**: A record `tickets.sedi-ati.com` → `192.168.1.100`
2. **Nginx**: Configure comme ci-dessus
3. **Firewall**: Port 80 ouvert
4. **Accès**: http://tickets.sedi-ati.com (sans port!)

## 📝 Notes Importantes

- Les changements DNS peuvent prendre du temps (5 min à 24h)
- Nginx écoute sur port 80, Docker sur 3064/5050
- Le nom de domaine doit pointer vers l'IP publique du serveur si accès Internet
- Pour accès local uniquement, utilisez l'IP (192.168.1.100)

