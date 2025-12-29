Voici la **traduction complète en français** des spécifications, adaptée à ton contexte (application iPad, hors-ligne, mono-utilisateur).
Le texte est prêt à être utilisé comme **document fonctionnel / technique**.

---

# Application de Gestion d’Assemblées Générales

**Spécifications Fonctionnelles et Techniques
(iPad – Hors connexion – Utilisateur unique)**

---

## 1. Objectif et périmètre

### 1.1 Objectif

L’application est une **application native iPad** destinée à assister une seule personne dans la gestion des Assemblées Générales (AG / AGE) d’une copropriété.

L’application doit fonctionner **entièrement hors connexion**, à l’exception du premier lancement (installation et éventuelle configuration initiale). Toutes les opérations liées à l’assemblée sont réalisées localement sur l’iPad.

Fonctionnalités principales :

* Gestion des présences et des procurations
* Vérification du **quorum en temps réel**
* Saisie des votes et **comptabilisation pondérée des voix**
* Génération et sauvegarde locale des résultats
* Export des données et documents
* Partage des résultats par email via l’application **Mail** d’iOS

---

## 2. Contraintes d’utilisation et hypothèses

* L’application fonctionne **exclusivement sur iPad (iPadOS)**.
* Un **seul utilisateur** utilise l’application.
* Aucun système d’authentification ou de gestion des rôles n’est requis.
* Aucune connexion internet n’est nécessaire après la première utilisation.
* Toutes les données sont stockées **localement et de manière sécurisée** sur l’appareil.
* La sécurité du périphérique (code, Face ID, Touch ID) est considérée comme suffisante.
* L’envoi d’emails est réalisé via l’application **Mail** d’iOS.

---

## 3. Architecture « hors connexion » (Offline-first)

### 3.1 Connectivité

* La connexion internet est requise uniquement pour :

  * L’installation initiale
  * Les mises à jour éventuelles
* Toutes les fonctionnalités principales doivent être disponibles sans connexion :

  * Création et gestion des assemblées
  * Gestion des présences et procurations
  * Votes et calculs
  * Génération de documents
  * Export des données

### 3.2 Résilience

* L’absence de réseau ne doit jamais bloquer l’utilisation de l’application.
* Tous les calculs et documents sont produits localement.

---

## 4. Stockage local et sécurité des données

### 4.1 Stockage

* Toutes les données sont stockées localement sur l’iPad via :

  * Une base de données locale chiffrée (ex. Core Data ou SQLite sécurisé)
* Les données incluent :

  * Copropriété, copropriétaires, lots
  * Assemblées et résolutions
  * Présences, procurations, votes
  * Rapports générés (PDF)
  * Pièces jointes (scans de procurations)

### 4.2 Protection des données

* Utilisation des mécanismes de protection iOS :

  * Données chiffrées au repos
  * Accès restreint lorsque l’appareil est verrouillé (selon configuration)
* Aucune donnée sensible n’est stockée en clair hors du sandbox de l’application.

### 4.3 Sauvegarde

* Les données doivent être compatibles avec :

  * Les sauvegardes iOS (iCloud ou Finder)
* Possibilité d’export manuel pour sauvegarde externe.

---

## 5. Export et portabilité des données

### 5.1 Formats d’export

L’application doit permettre l’export :

* Du rapport de résultats de l’assemblée (PDF)
* Des données de présence et de vote (CSV ou Excel)
* D’une archive complète (ZIP) contenant :

  * Extraction des données
  * Rapports générés
  * Pièces jointes

### 5.2 Méthodes d’export

* Utilisation de la feuille de partage iOS :

  * Enregistrement dans Fichiers
  * AirDrop
  * Stockage externe ou applications compatibles
* Aucun accès internet requis pour les exports.

**Comportement attendu**
Les fichiers exportés sont des copies non modifiables qui n’altèrent pas les données locales.

---

## 6. Envoi d’email via l’application Mail (iOS)

### 6.1 Principe

* L’application n’envoie pas directement d’email.
* Elle ouvre l’application **Mail** d’iOS avec :

  * Un brouillon prérempli
  * Objet et corps du message
  * Rapport PDF en pièce jointe

### 6.2 Interaction utilisateur

* L’utilisateur peut :

  * Modifier les destinataires
  * Modifier le message
  * Envoyer ou annuler l’email
* L’application ne suit pas l’état de livraison.

**Comportement attendu**
Si aucun compte Mail n’est configuré sur l’iPad, un message d’avertissement est affiché.

---

## 7. Fonctionnalités principales

### 7.1 Calculs en temps réel

* Le quorum et les totaux de vote sont recalculés instantanément.
* Les calculs sont déterministes et reproductibles hors ligne.

### 7.2 Génération de documents

* Les rapports sont générés localement au format PDF.
* Chaque génération est horodatée et versionnée.
* Les documents restent accessibles hors connexion.

### 7.3 Intégrité des données

* Prévention de :

  * La double représentation
  * Le double vote
* Vérifications de cohérence avant la clôture d’une assemblée.

---

## 8. Interface utilisateur (optimisée iPad)

### 8.1 Principes

* Interface pensée pour une utilisation **en séance**
* Cibles tactiles larges
* Indicateurs visuels clairs :

  * Quorum atteint / non atteint
  * Votes manquants
  * État des résolutions (ouverte / clôturée)

### 8.2 Écrans principaux

* Tableau de bord (liste des assemblées)
* Paramétrage de la copropriété (lots, copropriétaires, tantièmes)
* Vue d’ensemble de l’assemblée (présences + quorum)
* Gestion des procurations
* Écran de vote par résolution
* Résultats et synthèse
* Documents et exports

---

## 9. Exigences non fonctionnelles

### 9.1 Performance

* Dimensionnement cible :

  * Jusqu’à 300 lots
  * Jusqu’à 100 résolutions
* Temps de réponse inférieur à 1 seconde pour les opérations courantes.

### 9.2 Fiabilité

* Aucune perte de données lors de la mise en arrière-plan de l’application.
* Sauvegarde automatique après chaque action critique.

---

## 10. Hors périmètre (version initiale)

* Multi-utilisateurs
* Synchronisation cloud
* Suivi de l’envoi des emails
* Signature électronique à valeur juridique

---

## 11. Points à définir ultérieurement

* Activation optionnelle de Face ID / Touch ID au lancement
* Protection par mot de passe des exports
* Règles légales prédéfinies (quorum / majorités spécifiques)
* Politique d’archivage long terme
