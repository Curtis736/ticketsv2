# 🚀 Configuration Rapide : DNS + SSL

## ⚡ Installation Automatique (Recommandé)

```bash
# Sur votre serveur :
cd ~/ticketsv2
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

Le script va automatiquement :
1. ✅ Installer Certbot
2. ✅ Configurer Nginx
3. ✅ Obtenir le certificat SSL
4. ✅ Configurer le renouvellement automatique

---

## 📋 Installation Manuelle (Étape par étape)

### 1️⃣ Configuration DNS (À faire AVANT tout)

**Dans votre gestionnaire DNS (OVH, Cloudflare, etc.) :**

```
Type: A
Nom: sedi-tickets
Valeur: [IP de votre serveur]
TTL: 3600
```

**Obtenir l'IP de votre serveur :**
```bash
curl -s ifconfig.me
```

⏱️ **Attendre 5-30 minutes** que DNS se propage.

**Vérifier :**
```bash
dig +short sedi-tickets.sedi-ati.com
# Doit retourner l'IP de votre serveur
```

---

### 2️⃣ Installation SSL

```bash
# Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Copier la config Nginx
sudo cp ~/ticketsv2/nginx-tickets.conf /etc/nginx/sites-available/sedi-tickets
sudo ln -sf /etc/nginx/sites-available/sedi-tickets /etc/nginx/sites-enabled/

# Créer le répertoire pour les challenges
sudo mkdir -p /var/www/certbot

# Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx

# Ouvrir les ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Obtenir le certificat SSL
sudo certbot --nginx -d sedi-tickets.sedi-ati.com
```

---

## ✅ Résultat

Une fois terminé :
- ✅ **HTTP** : `http://sedi-tickets.sedi-ati.com` → Redirige vers HTTPS
- ✅ **HTTPS** : `https://sedi-tickets.sedi-ati.com` → Sécurisé 🔒
- ✅ **Certificat** : Renouvellement automatique tous les 90 jours

---

## 🆘 Problèmes courants

### "DNS not resolving"
→ Configurez d'abord le DNS et attendez 5-30 min

### "Port 80 already in use"
→ Nginx ou autre service utilise déjà le port 80. Vérifiez avec `sudo netstat -tlnp | grep :80`

### "Certbot can't verify domain"
→ Vérifiez que le DNS pointe bien vers votre serveur et que le port 80 est ouvert

Pour plus de détails, voir `GUIDE_DNS_SSL.md`

