# Application de Gestion d'Assemblées Générales - Copropriété

Application HTML5 pour iPad permettant de gérer les assemblées générales de copropriété en mode hors ligne.

## Fonctionnalités

- ✅ **Gestion de la copropriété** : Configuration des lots, copropriétaires et tantièmes
- ✅ **Gestion des assemblées** : Création et suivi des assemblées générales (AGO/AGE)
- ✅ **Présences** : Enregistrement des présences avec calcul automatique du quorum
- ✅ **Procurations** : Gestion des procurations entre lots
- ✅ **Résolutions** : Création et suivi des résolutions
- ✅ **Votes pondérés** : Saisie des votes avec calcul automatique selon les tantièmes
- ✅ **Calculs en temps réel** : Quorum et résultats de votes mis à jour instantanément
- ✅ **Génération de rapports PDF** : Export des résultats au format PDF
- ✅ **Export de données** : Export CSV des présences et votes
- ✅ **Partage par email** : Intégration avec l'application Mail d'iOS
- ✅ **Mode hors ligne** : Fonctionne entièrement sans connexion internet (après installation)

## Installation

### Sur iPad (Safari)

1. Ouvrir Safari sur l'iPad
2. Naviguer vers l'URL de l'application
3. Appuyer sur le bouton de partage (carré avec flèche)
4. Sélectionner "Sur l'écran d'accueil"
5. L'application sera installée comme une Progressive Web App (PWA)

### Serveur local (développement)

Pour tester l'application localement :

```bash
# Avec Python 3
python -m http.server 8000

# Ou avec Node.js (http-server)
npx http-server -p 8000

# Puis ouvrir http://localhost:8000 dans Safari
```

**Important** : L'application doit être servie via HTTPS (ou localhost) pour que le Service Worker fonctionne.

## Structure du projet

```
assemblee-generale-copro/
├── index.html          # Structure HTML principale
├── styles.css          # Styles optimisés pour iPad
├── app.js             # Logique principale de l'application
├── db.js              # Gestion de la base de données IndexedDB
├── service-worker.js  # Service Worker pour le mode hors ligne
├── manifest.json      # Manifest PWA
├── specifications.md  # Spécifications fonctionnelles
└── README.md         # Ce fichier
```

## Utilisation

### 1. Configuration initiale

1. Aller dans l'onglet **Copropriété**
2. Renseigner le nom et l'adresse de la copropriété
3. Ajouter les lots avec leurs copropriétaires et tantièmes

### 2. Créer une assemblée

1. Aller dans l'onglet **Assemblées**
2. Cliquer sur "Nouvelle assemblée" ou sélectionner une assemblée existante
3. Renseigner la date et le type (AGO/AGE)

### 3. Enregistrer les présences

1. Dans la vue de l'assemblée, cliquer sur "Marquer une présence"
2. Sélectionner les lots présents
3. Le quorum est calculé automatiquement

### 4. Ajouter des procurations

1. Cliquer sur "Ajouter une procuration"
2. Sélectionner le lot mandant (qui donne) et le lot mandataire (qui reçoit)
3. Les voix du mandant sont ajoutées au mandataire pour le calcul du quorum

### 5. Créer des résolutions

1. Cliquer sur "Ajouter une résolution"
2. Renseigner le numéro, le libellé et le type de majorité requise
3. Les résolutions apparaissent dans la liste

### 6. Enregistrer les votes

1. Cliquer sur l'icône de vote (🗳️) d'une résolution
2. Pour chaque lot présent, sélectionner : Pour / Contre / Abstention
3. Les résultats sont calculés en temps réel avec les tantièmes
4. Le statut (approuvé/rejeté) s'affiche selon la majorité requise

### 7. Générer le rapport

1. Cliquer sur "Générer le rapport PDF"
2. Le PDF est téléchargé avec toutes les informations de l'assemblée

### 8. Exporter et partager

- **Export CSV** : Exporte les présences au format CSV
- **Partage par email** : Ouvre l'application Mail avec un brouillon prérempli

## Stockage des données

Toutes les données sont stockées localement sur l'iPad dans IndexedDB :
- Copropriété et lots
- Assemblées
- Présences et procurations
- Résolutions et votes
- Rapports générés

Les données sont sauvegardées automatiquement après chaque action.

## Compatibilité

- **iPad** : iPadOS 13.0 ou supérieur
- **Navigateur** : Safari (recommandé pour PWA)
- **Mode hors ligne** : Fonctionne entièrement sans connexion après installation

## Limitations connues

- Le partage par email avec pièce jointe PDF nécessite une manipulation manuelle (le PDF doit être ajouté depuis l'application Fichiers)
- Les icônes PWA doivent être créées (icon-192.png et icon-512.png)
- L'export ZIP complet n'est pas encore implémenté (seul le CSV est disponible)

## Technologies utilisées

- HTML5 / CSS3
- JavaScript (ES6+)
- IndexedDB pour le stockage local
- Service Worker pour le mode hors ligne
- jsPDF pour la génération de PDF
- Progressive Web App (PWA)

## Support

Pour toute question ou problème, consulter le fichier `specifications.md` pour les détails fonctionnels.
