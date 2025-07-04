# Script de inicio rápido para Query Builder con PostgreSQL (Windows)

Write-Host "🚀 Iniciando Query Builder con PostgreSQL..." -ForegroundColor Green

# Verificar si Docker está instalado
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado. Por favor, instala Docker Desktop primero." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está disponible
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose no está disponible. Por favor, instala Docker Compose." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Iniciando PostgreSQL en Docker..." -ForegroundColor Blue
docker-compose up -d postgres

Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar si PostgreSQL está listo
$maxAttempts = 30
$attempts = 0
while ($attempts -lt $maxAttempts) {
    try {
        $result = docker exec query_builder_db pg_isready -U postgres 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL está listo!" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar intentando
    }
    $attempts++
    Write-Host "⏳ Esperando PostgreSQL... (intento $attempts/$maxAttempts)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if ($attempts -eq $maxAttempts) {
    Write-Host "❌ PostgreSQL no se pudo iniciar correctamente" -ForegroundColor Red
    docker-compose logs postgres
    exit 1
}

Write-Host "🔧 Instalando dependencias del backend..." -ForegroundColor Blue
Set-Location server
npm install

Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Blue
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow

Set-Location ..

Write-Host "🔧 Instalando dependencias del frontend..." -ForegroundColor Blue
npm install

Write-Host "🎨 Iniciando aplicación frontend..." -ForegroundColor Blue
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow

Write-Host "✅ Todo listo!" -ForegroundColor Green
Write-Host "📊 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 Backend API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "🗄️ PostgreSQL: puerto 5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar todo:" -ForegroundColor Yellow
Write-Host "  - Presiona Ctrl+C" -ForegroundColor Yellow
Write-Host "  - Ejecuta: docker-compose down" -ForegroundColor Yellow

# Esperar a que el usuario presione Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "🛑 Deteniendo procesos..." -ForegroundColor Yellow
    if ($backendProcess -and !$backendProcess.HasExited) {
        $backendProcess.Kill()
    }
    if ($frontendProcess -and !$frontendProcess.HasExited) {
        $frontendProcess.Kill()
    }
}
