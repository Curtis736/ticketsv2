# 📧 Exemples d'Emails - Système de Tickets SEDI-ATI

## Email 1 : Pour les Utilisateurs (Announcement)

**Objet:** Nouveau système de demandes SEDI-ATI

Bonjour,

Nous sommes heureux de vous informer de la mise en place d'un nouveau système de gestion des demandes pour l'équipe SEDI-ATI.

### 🎯 Objectif
Simplifier la soumission et le suivi de vos demandes techniques, administratives ou autre.

### 📋 Comment créer une demande ?

1. Rendez-vous sur : **http://IP_DE_VOTRE_SERVEUR:3064**
   *(Remplacez IP_DE_VOTRE_SERVEUR par l'adresse IP de votre serveur)*
2. Remplissez le formulaire avec :
   - Votre nom
   - Un titre descriptif
   - La description de votre demande
   - La catégorie (Technique, Administratif, Finance, etc.)
   - La priorité (Faible, Moyenne, Haute, Urgente)
3. Cliquez sur "Envoyer la demande"

### 📱 Comment suivre votre demande ?

Après la création de votre demande, vous recevrez un **numéro de ticket** (ex: #15).

Vous pouvez suivre l'évolution de votre demande à tout moment en accédant à :
**http://IP_DE_VOTRE_SERVEUR:3064/track/15**
*(Remplacez 15 par votre numéro de ticket et IP_DE_VOTRE_SERVEUR par l'adresse IP de votre serveur)*

### ✨ Avantages
- ✅ Suivi en temps réel de votre demande
- ✅ Notification automatique à l'équipe
- ✅ Réponse rapide garantie
- ✅ Accès 24/7

### 🆘 Besoin d'aide ?
Pour toute question, n'hésitez pas à contacter l'équipe support.

Cordialement,
L'équipe SEDI-ATI

---

## Email 2 : Pour l'Admin/Manager

**Objet:** Nouveau système de tickets SEDI-ATI - Guide Administrateur

Bonjour,

Un nouveau système de gestion des tickets a été déployé pour faciliter le traitement des demandes.

### 🔐 Accès Admin
- **URL:** http://IP_DE_VOTRE_SERVEUR:3064/admin
- **Identifiants:** admin / admin
- ⚠️ **Important:** Changez le mot de passe à la première connexion
- *(Remplacez IP_DE_VOTRE_SERVEUR par l'adresse IP de votre serveur)*

###  Fonctionnalités

#### 1. Gestion des tickets
- **Voir tous les tickets** avec leur statut (Ouvert, En cours, Résolu, Fermé)
- **Filtrer par statut** pour une meilleure organisation
- **Modifier le statut** d'un ticket rapidement
- **Ajouter des notes** administratives

#### 2. Actions disponibles
- ✅ **Changer le statut** via le menu déroulant
- ✅ **Ajouter des notes** pour le suivi interne
- ✅ **Supprimer** les tickets résolus (optionnel)
- ✅ **Voir les détails** en cliquant sur un ticket

#### 3. Notifications
Vous recevrez un email automatique pour chaque nouveau ticket créé avec :
- Nom du demandeur
- Titre et description
- Catégorie et priorité
- Numéro du ticket
- Date de création

### 📈 Statistiques
Le tableau de bord affiche en temps réel :
- Nombre total de tickets
- Nombre de tickets ouverts
- Nombre de tickets en cours
- Nombre de tickets résolus

### 💡 Bonnes pratiques
1. **Vérifiez régulièrement** les nouveaux tickets
2. **Changez le statut** dès que vous commencez à traiter un ticket
3. **Ajoutez des notes** pour faciliter le suivi
4. **Fermez les tickets** une fois résolus

### 🚀 Interface publique
Les utilisateurs peuvent créer des demandes sur :
**http://IP_DE_VOTRE_SERVEUR:3064**
*(Remplacez IP_DE_VOTRE_SERVEUR par l'adresse IP de votre serveur)*

N'hésitez pas si vous avez des questions !

Cordialement,
L'équipe technique

---

## Email 3 : Email Automatique reçu par l'Admin (Exemple)

**Objet:** Nouveau ticket créé - #15

```
Nouveau ticket créé

Demandeur: Jean Dupont
Titre: Problème avec le serveur de production
Description: Le serveur principal ne répond plus depuis ce matin. 
            Toutes les applications sont inaccessibles.
Catégorie: Technique
Priorité: Urgente
ID: #15
Date: 28/10/2025, 16:30:00

Connectez-vous à l'interface admin pour traiter ce ticket.
```

---

## Email 4 : Template pour la réponse utilisateur (Manuel)

**Objet:** Suivi de votre demande #15

Bonjour [Nom du demandeur],

Nous avons bien reçu votre demande concernant : **[Titre]**

**Référence ticket:** #15  
**Date de soumission:** 28/10/2025 à 16:30  
**Statut actuel:** En cours de traitement  
**Priorité:** [Priorité]

**Actions en cours:**
[Description des actions prises]

**Prochaines étapes:**
[Indication des prochaines étapes]

**Suivez votre demande en temps réel:**
http://IP_DE_VOTRE_SERVEUR:3064/track/15
*(Remplacez IP_DE_VOTRE_SERVEUR par l'adresse IP de votre serveur)*

Nous vous tiendrons informé de l'évolution de votre demande.

Cordialement,
L'équipe SEDI-ATI

---

## Notes importantes pour l'utilisation

### URLs importantes
- **Interface publique:** http://IP_DE_VOTRE_SERVEUR:3064
- **Interface admin:** http://IP_DE_VOTRE_SERVEUR:3064/admin
- **Suivi ticket:** http://IP_DE_VOTRE_SERVEUR:3064/track/[ID]

*(Remplacez IP_DE_VOTRE_SERVEUR par l'adresse IP de votre serveur)*

### Sécurité
- Changez le mot de passe admin par défaut
- Configurez correctement les variables d'environnement
- Surveillez les logs pour détecter les problèmes

### Support
Pour toute question technique, contactez l'équipe IT.

