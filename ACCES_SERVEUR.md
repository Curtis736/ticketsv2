# 🌐 Comment Accéder à Votre Application

## 📍 Sur le Serveur

Une fois que vous avez cloné et démarré l'application sur votre serveur:

### 1️⃣ Sur votre navigateur local (PC/Bureau)

**Rendez-vous à l'adresse de votre serveur :**

```
http://IP-DU-SERVEUR:3064
```

**Exemples:**
- Si votre serveur est à `192.168.1.100` → `http://192.168.1.100:3064`
- Si votre serveur est à `10.0.0.50` → `http://10.0.0.50:3064`
- Si vous avez un domaine → `http://votre-domaine.com:3064`

### 2️⃣ Pour le Login Admin

```
http://IP-DU-SERVEUR:3064/login
```

**Identifiants:**
- Username: `admin`
- Password: `admin`

## 🔍 Comment Trouver l'IP de Votre Serveur

### Sur le Serveur Linux:

```bash
# Voir toutes les IPs
hostname -I

# Ou plus détaillé
ip addr show

# Ou simplement
ifconfig
```

Exemple de sortie:
```
192.168.1.100
```

### Trouver depuis Votre Réseau Local

Si vous êtes sur le même réseau que le serveur:
```bash
# Windows
ipconfig

# Cherchez votre IP, ex: 192.168.1.50
# Le serveur sera sur le même réseau, ex: 192.168.1.100
```

## 🌐 Les Différents Accès

### Accès Local (Même réseau que le serveur)
```
http://192.168.1.100:3064
```

### Accès Internet (Si port ouvert)
```
http://ADRESSE-PUBLIQUE:3064
```

### Accès via Domaine (Si configuré)
```
http://tickets.sedi-ati.com:3064
```

## 🔒 Ouvrir les Ports (Si de l'extérieur)

### Si vous voulez accéder depuis Internet:

```bash
# Sur le serveur
sudo ufw allow 3064/tcp
sudo ufw allow 5050/tcp
sudo ufw reload

# Vérifier
sudo ufw status
```

### Si vous avez un routeur:
- Connectez-vous au routeur (ex: 192.168.1.1)
- Créez une redirection de port:
  - Port 3064 → IP du serveur
  - Port 5050 → IP du serveur

## 📊 Résumé des URLs

| Service | Port | URL |
|---------|------|-----|
| **Application** | 3064 | http://IP:3064 |
| **Admin Login** | 3064 | http://IP:3064/login |
| **API Backend** | 5050 | http://IP:5050/api/health |
| **API Tickets** | 5050 | http://IP:5050/api/tickets |

## ✅ Test Rapide

```bash
# Depuis votre PC (tester la connexion)
ping IP-DU-SERVEUR

# Tester si les ports sont ouverts
curl http://IP-DU-SERVEUR:3064
curl http://IP-DU-SERVEUR:5050/api/health
```

## 🎯 Exemple Complet

Si votre serveur a l'IP **192.168.1.100**:

1. **App**: `http://192.168.1.100:3064`
2. **Admin**: `http://192.168.1.100:3064/login` (admin/admin)
3. **API**: `http://192.168.1.100:5050/api/health`

**C'est tout!** 🚀



