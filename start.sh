#!/bin/bash
# Script de inicio rápido para Query Builder con PostgreSQL

echo "🚀 Iniciando Query Builder con PostgreSQL..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker Desktop primero."
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está disponible. Por favor, instala Docker Compose."
    exit 1
fi

echo "📦 Iniciando PostgreSQL en Docker..."
docker-compose up -d postgres

echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar si PostgreSQL está listo
max_attempts=30
attempts=0
while [ $attempts -lt $max_attempts ]; do
    if docker exec query_builder_db pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL está listo!"
        break
    fi
    echo "⏳ Esperando PostgreSQL... (intento $((attempts+1))/$max_attempts)"
    sleep 2
    attempts=$((attempts+1))
done

if [ $attempts -eq $max_attempts ]; then
    echo "❌ PostgreSQL no se pudo iniciar correctamente"
    docker-compose logs postgres
    exit 1
fi

echo "🔧 Instalando dependencias del backend..."
cd server
npm install

echo "🚀 Iniciando servidor backend..."
npm start &
BACKEND_PID=$!

cd ..

echo "🔧 Instalando dependencias del frontend..."
npm install

echo "🎨 Iniciando aplicación frontend..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Todo listo!"
echo "📊 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:3001/api"
echo "🗄️ PostgreSQL: puerto 5432"
echo ""
echo "Para parar todo:"
echo "  - Presiona Ctrl+C"
echo "  - Ejecuta: docker-compose down"

# Esperar a que el usuario presione Ctrl+C
wait
