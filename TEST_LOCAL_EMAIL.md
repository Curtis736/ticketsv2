# 📧 Guide de Test Local - Prévisualisation Email

Ce guide vous explique comment tester la prévisualisation de l'email en local.

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend

```bash
cd backend
npm install  # Si ce n'est pas déjà fait
npm start
```

Le serveur backend démarre sur **http://localhost:5050**

### 2. Démarrer le Frontend (dans un nouveau terminal)

```bash
cd frontend
npm install  # Si ce n'est pas déjà fait
npm run dev
```

Le serveur frontend démarre sur **http://localhost:5173**

## 🎯 Tester la Prévisualisation

### Méthode 1 : Via l'Interface Admin (Recommandé)

1. Ouvrez votre navigateur : **http://localhost:5173**
2. Connectez-vous en tant qu'admin :
   - URL : **http://localhost:5173/login**
   - Identifiant : `admin`
   - Mot de passe : `admin`
3. Dans le dashboard admin, cliquez sur le bouton **"📧 Prévisualiser l'email"** en haut à droite
4. Une nouvelle fenêtre s'ouvre avec l'aperçu de l'email

### Méthode 2 : Accès Direct à l'API

Ouvrez directement dans votre navigateur :

**URL de base avec valeurs par défaut :**
```
http://localhost:5050/api/tickets/preview-email
```

**URL avec paramètres personnalisés :**
```
http://localhost:5050/api/tickets/preview-email?title=Problème%20urgent&description=Description%20du%20problème&priority=Urgente&category=Technique&createdByName=Jean%20Dupont
```

### Paramètres disponibles :

- `title` : Titre du ticket
- `description` : Description du ticket (les sauts de ligne `\n` seront convertis en `<br>`)
- `priority` : Priorité (`Urgente`, `Haute`, `Moyenne`, `Faible`)
- `category` : Catégorie (ex: `Technique`, `Administratif`, `Finance`)
- `createdByName` : Nom du demandeur
- `ticketId` : Numéro du ticket (optionnel)

## 🧪 Tester avec un Vrai Ticket

Pour voir comment l'email apparaît lors de la création réelle d'un ticket :

1. Créez un ticket via le formulaire public : **http://localhost:5173**
2. Un email sera envoyé à l'adresse configurée dans `ADMIN_EMAIL`
3. L'email utilise le même template que la prévisualisation

## 🔧 Configuration Email (Optionnel)

Pour recevoir de vrais emails en local, créez un fichier `.env` dans `backend/` :

```env
JWT_SECRET=cle-secrete-test
SENDGRID_API_KEY=SG.votre-cle-api-sendgrid
SENDGRID_FROM_EMAIL=votre-email@domain.com
ADMIN_EMAIL=votre-email@domain.com
PORT=5050
```

**Note** : Sans configuration SendGrid, l'email ne sera pas envoyé, mais le template sera toujours généré et visible dans les logs.

## 📝 Exemple de Requête avec curl

Pour tester depuis la ligne de commande :

```bash
curl "http://localhost:5050/api/tickets/preview-email?title=Test&description=Ligne%201%0ALigne%202&priority=Moyenne&category=Technique&createdByName=Test%20User" > preview.html
```

Puis ouvrez `preview.html` dans votre navigateur.

## 🎨 Vérifier les Différentes Priorités

Testez les 4 niveaux de priorité :

- **Urgente** : Rouge
```
http://localhost:5050/api/tickets/preview-email?priority=Urgente
```

- **Haute** : Orange
```
http://localhost:5050/api/tickets/preview-email?priority=Haute
```

- **Moyenne** : Bleu (par défaut)
```
http://localhost:5050/api/tickets/preview-email?priority=Moyenne
```

- **Faible** : Vert
```
http://localhost:5050/api/tickets/preview-email?priority=Faible
```

## ✅ Vérifications

- [ ] Backend accessible sur http://localhost:5050
- [ ] Frontend accessible sur http://localhost:5173
- [ ] Prévisualisation accessible via le bouton admin
- [ ] Prévisualisation accessible directement via l'API
- [ ] Les couleurs de priorité s'affichent correctement
- [ ] Les sauts de ligne dans la description fonctionnent
- [ ] Le bouton "Accéder au Tableau de Bord" est visible

## 🐛 Dépannage

### Le proxy ne fonctionne pas
- Vérifiez que le backend tourne sur le port 5050
- Vérifiez `frontend/vite.config.js` : le proxy doit pointer vers `http://localhost:5050`

### La prévisualisation ne s'affiche pas
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que le backend est bien démarré
- Testez directement : `http://localhost:5050/api/tickets/preview-email`

### Les styles ne s'affichent pas correctement
- Les emails utilisent des styles inline (normal pour les emails)
- Testez dans différents clients email : Gmail, Outlook, etc.
- Certains clients email ne supportent pas tous les styles CSS











