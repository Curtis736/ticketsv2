# 🔒 Checklist de Sécurité

## ✅ Ce qui est DÉJÀ configuré dans le code

### Backend (Express.js)
- ✅ **Helmet.js** : Headers de sécurité HTTP
- ✅ **Rate Limiting** : Protection contre les attaques DDoS
  - Routes générales : 100 requêtes / 15 min
  - Authentification : 5 tentatives / 15 min
  - Tickets : 50 requêtes / 15 min
- ✅ **CORS** : Contrôle des origines autorisées
- ✅ **Trust Proxy** : Gestion correcte des IP derrière proxy
- ✅ **Compression** : Optimisation des performances
- ✅ **Input validation** : Limite de taille des requêtes (10mb)

### Nginx (Configuration)
- ✅ **Headers de sécurité** :
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
- ✅ **Redirection HTTP → HTTPS** : Forcer les connexions sécurisées
- ✅ **Configuration HTTPS** : Prête pour SSL/TLS

### Frontend
- ✅ **Pas de secrets exposés**
- ✅ **Authentification JWT** sécurisée
- ✅ **Gestion sécurisée des tokens**

---

## ⚠️ Ce qui reste à faire SUR LE SERVEUR

### 1️⃣ Configuration DNS
- [ ] Créer l'enregistrement A : `sedi-tickets.sedi-ati.com` → IP serveur
- [ ] Vérifier la propagation DNS : `dig +short sedi-tickets.sedi-ati.com`

### 2️⃣ Installation SSL (HTTPS)
- [ ] Copier `nginx-tickets.conf` sur le serveur
- [ ] Installer Certbot : `sudo apt install certbot python3-certbot-nginx`
- [ ] Obtenir le certificat : `sudo certbot --nginx -d sedi-tickets.sedi-ati.com`
- [ ] Vérifier le renouvellement automatique : `sudo systemctl status certbot.timer`

### 3️⃣ Configuration Nginx sur le serveur
- [ ] Copier la config : `sudo cp nginx-tickets.conf /etc/nginx/sites-available/sedi-tickets`
- [ ] Activer : `sudo ln -sf /etc/nginx/sites-available/sedi-tickets /etc/nginx/sites-enabled/`
- [ ] Tester : `sudo nginx -t`
- [ ] Recharger : `sudo systemctl reload nginx`

### 4️⃣ Firewall
- [ ] Ouvrir port 80 : `sudo ufw allow 80/tcp`
- [ ] Ouvrir port 443 : `sudo ufw allow 443/tcp`
- [ ] Vérifier : `sudo ufw status`

---

## 🔍 Vérification de l'état actuel

### Sur votre serveur, exécutez :

```bash
# 1. Vérifier DNS
dig +short sedi-tickets.sedi-ati.com

# 2. Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# 3. Vérifier les certificats SSL
sudo certbot certificates

# 4. Vérifier les ports
sudo netstat -tlnp | grep -E ':(80|443)'

# 5. Test HTTPS
curl -I https://sedi-tickets.sedi-ati.com
```

---

## ✅ État final souhaité

Une fois tout configuré :
- ✅ DNS résout vers votre serveur
- ✅ HTTP redirige automatiquement vers HTTPS
- ✅ HTTPS avec certificat valide (🔒 vert dans le navigateur)
- ✅ Headers de sécurité actifs
- ✅ Rate limiting actif
- ✅ Renouvellement SSL automatique

---

## 🚀 Commandes rapides

### Installation automatique (recommandé)
```bash
cd ~/ticketsv2
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

### Installation manuelle
Voir `QUICK_SETUP_DNS_SSL.md` ou `GUIDE_DNS_SSL.md`

---

## ⚠️ Actuellement (sans SSL)

**Sans SSL installé sur le serveur :**
- ⚠️ Le site fonctionne mais **N'EST PAS sécurisé**
- ⚠️ Les données sont transmises en **clair** (HTTP)
- ⚠️ Pas de cadenas vert 🔒
- ⚠️ Risque d'interception des données

**Pour sécuriser :**
1. Configurez DNS (5-30 min)
2. Exécutez le script `setup-ssl.sh` (5 min)
3. ✅ Site sécurisé avec HTTPS !

