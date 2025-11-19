# Script PowerShell pour démarrer le système de tickets en local

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Démarrage du système de tickets en local" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js installé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Node.js n'est pas installé. Veuillez installer Node.js d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm installé: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] npm n'est pas installé. Veuillez installer npm d'abord." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/4] Vérification des dépendances backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances backend..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dépendances backend déjà installées." -ForegroundColor Green
}
Set-Location ..

Write-Host ""
Write-Host "[2/4] Vérification des dépendances frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances frontend..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dépendances frontend déjà installées." -ForegroundColor Green
}
Set-Location ..

Write-Host ""
Write-Host "[3/4] Démarrage du backend sur http://localhost:5050" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[4/4] Démarrage du frontend sur http://localhost:5173" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Serveurs démarrés!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5050" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Admin:    http://localhost:5173/login" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester l'email:" -ForegroundColor Yellow
Write-Host "http://localhost:5050/api/tickets/preview-email" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")











