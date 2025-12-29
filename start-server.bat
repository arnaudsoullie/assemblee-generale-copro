@echo off
echo ========================================
echo Serveur local pour AG Copropriete
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python detecte - Demarrage du serveur...
    echo.
    echo L'application sera accessible sur: http://localhost:8000
    echo.
    echo Appuyez sur Ctrl+C pour arreter le serveur
    echo.
    python -m http.server 8000
    goto :end
)

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js detecte - Demarrage du serveur...
    echo.
    echo Installation de http-server...
    npx --yes http-server -p 8000 -o
    goto :end
)

echo.
echo ERREUR: Python ou Node.js n'est pas installe.
echo.
echo Options:
echo 1. Installer Python depuis https://www.python.org/
echo 2. Installer Node.js depuis https://nodejs.org/
echo.
echo Ou utilisez un autre serveur HTTP de votre choix.
echo.

:end
pause

