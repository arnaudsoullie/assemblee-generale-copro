# Instructions pour les icônes PWA

L'application nécessite deux icônes pour fonctionner comme Progressive Web App :

- `icon-192.png` : 192x192 pixels
- `icon-512.png` : 512x512 pixels

## Création des icônes

### Option 1 : Outils en ligne

1. Utiliser un générateur d'icônes PWA comme :
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://favicon.io/

2. Télécharger les icônes aux tailles requises

### Option 2 : Création manuelle

1. Créer une image carrée (512x512 minimum)
2. Redimensionner en 192x192 et 512x512
3. Placer les fichiers à la racine du projet

### Option 3 : Icônes temporaires

Pour tester l'application sans icônes, vous pouvez :
- Commenter la section `icons` dans `manifest.json`
- Ou créer des images PNG simples avec un fond coloré

## Format recommandé

- Format : PNG avec transparence
- Fond : Solide ou transparent
- Contenu : Logo ou initiales "AG" pour Assemblée Générale
- Couleur : Bleu (#007AFF) pour correspondre au thème de l'application

