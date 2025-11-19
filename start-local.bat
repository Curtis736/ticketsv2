@echo off
echo ============================================
echo  Démarrage du système de tickets en local
echo ============================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe. Veuillez installer Node.js d'abord.
    pause
    exit /b 1
)

REM Vérifier si npm est installé
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] npm n'est pas installe. Veuillez installer npm d'abord.
    pause
    exit /b 1
)

echo [1/4] Verification des dependances backend...
cd backend
if not exist "node_modules" (
    echo Installation des dependances backend...
    call npm install
) else (
    echo Dependances backend deja installees.
)
cd ..

echo.
echo [2/4] Verification des dependances frontend...
cd frontend
if not exist "node_modules" (
    echo Installation des dependances frontend...
    call npm install
) else (
    echo Dependances frontend deja installees.
)
cd ..

echo.
echo [3/4] Demarrage du backend sur http://localhost:5050
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo.
echo [4/4] Demarrage du frontend sur http://localhost:5173
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo  Serveurs demarres!
echo ============================================
echo.
echo  Backend:  http://localhost:5050
echo  Frontend: http://localhost:5173
echo  Admin:    http://localhost:5173/login
echo.
echo  Pour tester l'email:
echo  http://localhost:5050/api/tickets/preview-email
echo.
echo  Appuyez sur une touche pour fermer cette fenetre...
pause >nul











