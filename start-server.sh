#!/bin/bash

echo "========================================"
echo "Serveur local pour AG Copropriete"
echo "========================================"
echo ""

# Vérifier si Python est installé
if command -v python3 &> /dev/null; then
    echo "Python détecté - Démarrage du serveur..."
    echo ""
    echo "L'application sera accessible sur: http://localhost:8000"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter le serveur"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Python détecté - Démarrage du serveur..."
    echo ""
    echo "L'application sera accessible sur: http://localhost:8000"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter le serveur"
    echo ""
    python -m http.server 8000
# Vérifier si Node.js est installé
elif command -v node &> /dev/null; then
    echo "Node.js détecté - Démarrage du serveur..."
    echo ""
    npx --yes http-server -p 8000 -o
else
    echo ""
    echo "ERREUR: Python ou Node.js n'est pas installé."
    echo ""
    echo "Options:"
    echo "1. Installer Python: sudo apt-get install python3"
    echo "2. Installer Node.js depuis https://nodejs.org/"
    echo ""
    echo "Ou utilisez un autre serveur HTTP de votre choix."
    echo ""
fi

