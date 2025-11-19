# 🧪 Tester la Prévisualisation Email en Local

## 🚀 Démarrage Rapide (3 méthodes)

### Méthode 1 : Script Automatique (Windows - PowerShell)

```powershell
.\start-local.ps1
```

### Méthode 2 : Script Automatique (Windows - CMD)

```cmd
start-local.bat
```

### Méthode 3 : Manuel

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # Si première fois
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # Si première fois
npm run dev
```

## ✅ Vérification

Une fois les serveurs démarrés :

1. **Backend** : http://localhost:5050
   - Test de santé : http://localhost:5050/api/health
   - Prévisualisation : http://localhost:5050/api/tickets/preview-email

2. **Frontend** : http://localhost:5173
   - Formulaire public : http://localhost:5173
   - Connexion admin : http://localhost:5173/login
     - Login : `admin`
     - Password : `admin`

## 🎯 Tester la Prévisualisation Email

### Option A : Via le Dashboard Admin (Recommandé)

1. Connectez-vous : http://localhost:5173/login
2. Cliquez sur **"📧 Prévisualiser l'email"** en haut à droite
3. Une nouvelle fenêtre s'ouvre avec l'aperçu

### Option B : Accès Direct API

Ouvrez dans votre navigateur :

```
http://localhost:5050/api/tickets/preview-email
```

**Avec paramètres personnalisés :**

```
http://localhost:5050/api/tickets/preview-email?title=Test%20Urgent&description=Ligne%201%0ALigne%202&priority=Urgente&category=Technique&createdByName=Jean%20Dupont
```

## 🎨 Tester les Différentes Priorités

- **Urgente** (Rouge) : 
  ```
  http://localhost:5050/api/tickets/preview-email?priority=Urgente
  ```

- **Haute** (Orange) : 
  ```
  http://localhost:5050/api/tickets/preview-email?priority=Haute
  ```

- **Moyenne** (Bleu) : 
  ```
  http://localhost:5050/api/tickets/preview-email?priority=Moyenne
  ```

- **Faible** (Vert) : 
  ```
  http://localhost:5050/api/tickets/preview-email?priority=Faible
  ```

## 🧪 Tester avec un Vrai Ticket

1. Créez un ticket via : http://localhost:5173
2. L'email sera généré avec le même template
3. Si SendGrid est configuré, l'email sera envoyé

## 📝 Paramètres de l'URL de Prévisualisation

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `title` | Titre du ticket | `title=Problème%20urgent` |
| `description` | Description (supporte les sauts de ligne) | `description=Ligne1%0ALigne2` |
| `priority` | Priorité (Urgente, Haute, Moyenne, Faible) | `priority=Urgente` |
| `category` | Catégorie | `category=Technique` |
| `createdByName` | Nom du demandeur | `createdByName=Jean%20Dupont` |
| `ticketId` | Numéro du ticket (optionnel) | `ticketId=123` |

## 🔧 Configuration (Optionnel)

Pour recevoir de vrais emails, créez `backend/.env` :

```env
JWT_SECRET=test-secret-key
SENDGRID_API_KEY=SG.votre-cle
SENDGRID_FROM_EMAIL=votre-email@domain.com
ADMIN_EMAIL=votre-email@domain.com
PORT=5050
```

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que le port 5050 est libre : `netstat -ano | findstr :5050`
- Vérifiez que Node.js est installé : `node --version`

### Le frontend ne démarre pas
- Vérifiez que le port 5173 est libre
- Vérifiez que les dépendances sont installées : `cd frontend && npm install`

### La prévisualisation ne s'affiche pas
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Testez directement : http://localhost:5050/api/tickets/preview-email
- Vérifiez que le backend est bien démarré : http://localhost:5050/api/health

### Le proxy ne fonctionne pas
- Vérifiez que `frontend/vite.config.js` pointe vers `http://localhost:5050`
- Redémarrez le serveur frontend

## ✅ Checklist

- [ ] Backend accessible sur http://localhost:5050
- [ ] Frontend accessible sur http://localhost:5173
- [ ] Prévisualisation accessible via le bouton admin
- [ ] Prévisualisation accessible directement via l'API
- [ ] Les 4 priorités affichent les bonnes couleurs
- [ ] Les sauts de ligne dans la description fonctionnent
- [ ] Le bouton "Accéder au Tableau de Bord" est visible et cliquable











