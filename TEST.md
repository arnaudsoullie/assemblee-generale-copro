# Guide de test local

## Démarrage rapide

### Option 1 : Script automatique (Windows)
Double-cliquez sur `start-server.bat`

### Option 2 : Script automatique (Mac/Linux)
```bash
chmod +x start-server.sh
./start-server.sh
```

### Option 3 : Python manuel
```bash
# Python 3
python -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000
```

### Option 4 : Node.js (http-server)
```bash
# Installation globale (une fois)
npm install -g http-server

# Démarrage
http-server -p 8000 -o
```

### Option 5 : Node.js (npx - pas d'installation)
```bash
npx http-server -p 8000 -o
```

## Accès à l'application

Une fois le serveur démarré, ouvrez votre navigateur et allez sur :

**http://localhost:8000**

## Test sur iPad (même réseau)

1. Trouvez l'adresse IP locale de votre ordinateur :
   - Windows : `ipconfig` (cherchez "IPv4 Address")
   - Mac/Linux : `ifconfig` ou `ip addr`

2. Sur votre iPad, connecté au même réseau Wi-Fi, ouvrez Safari et allez sur :
   **http://VOTRE_IP:8000**
   
   Exemple : `http://192.168.1.100:8000`

3. Pour installer en PWA sur iPad :
   - Appuyez sur le bouton de partage (carré avec flèche)
   - Sélectionnez "Sur l'écran d'accueil"
   - L'application sera installée et fonctionnera hors ligne

## Vérifications

### Console du navigateur
Ouvrez les outils de développement (F12) et vérifiez :
- ✅ Service Worker enregistré
- ✅ Aucune erreur JavaScript
- ✅ IndexedDB initialisée

### Test des fonctionnalités

1. **Configuration copropriété**
   - Ajoutez quelques lots avec tantièmes
   - Vérifiez que les données sont sauvegardées

2. **Création assemblée**
   - Créez une nouvelle assemblée
   - Vérifiez la date et le type

3. **Présences**
   - Marquez des présences
   - Vérifiez que le quorum se calcule automatiquement

4. **Procurations**
   - Ajoutez des procurations
   - Vérifiez que le quorum inclut les voix des procurations

5. **Résolutions et votes**
   - Créez une résolution
   - Enregistrez des votes
   - Vérifiez le calcul des résultats

6. **Export PDF**
   - Générez un rapport PDF
   - Vérifiez que le fichier se télécharge

7. **Mode hors ligne**
   - Arrêtez le serveur
   - Rechargez la page
   - L'application doit toujours fonctionner

## Dépannage

### Le Service Worker ne se charge pas
- Vérifiez que vous utilisez HTTP (pas file://)
- Vérifiez la console pour les erreurs
- Essayez de vider le cache : DevTools > Application > Clear storage

### IndexedDB ne fonctionne pas
- Vérifiez que le navigateur supporte IndexedDB
- Vérifiez la console pour les erreurs
- Essayez en navigation privée pour tester sans cache

### Les styles ne s'appliquent pas
- Vérifiez que `styles.css` est bien chargé
- Vérifiez la console pour les erreurs 404

### jsPDF ne fonctionne pas
- Vérifiez votre connexion internet (CDN)
- Ou téléchargez jsPDF localement et modifiez le chemin dans index.html

## Test sur différents navigateurs

- **Chrome/Edge** : Support complet
- **Firefox** : Support complet
- **Safari** : Support complet (recommandé pour iPad)
- **Safari iOS** : Support complet, nécessaire pour PWA

