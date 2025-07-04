# 🚀 Inicio Rápido - Query Builder con PostgreSQL

## Opción 1: Script Automático (Recomendado)

### Windows (PowerShell)
```powershell
# Ejecutar como administrador
.\start.ps1
```

### Linux/macOS (Bash)
```bash
chmod +x start.sh
./start.sh
```

## Opción 2: Paso a Paso

### 1. Iniciar PostgreSQL
```bash
docker-compose up -d postgres
```

### 2. Iniciar Backend
```bash
cd server
npm install
npm start
```

### 3. Iniciar Frontend
```bash
# En otra terminal, desde el directorio raíz
npm install
npm run dev
```

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health
- **Schema**: http://localhost:3001/api/schema

## Comandos Útiles

```bash
# Ver estado de PostgreSQL
docker-compose ps

# Ver logs
docker-compose logs postgres

# Conectar a la base de datos
docker exec -it query_builder_db psql -U postgres -d query_builder

# Parar todo
docker-compose down
```

## Troubleshooting

### Puerto en uso
```bash
# Cambiar puerto de PostgreSQL
# Editar docker-compose.yml: "5433:5432"
# Editar server/.env: DB_PORT=5433
```

### Reiniciar PostgreSQL
```bash
docker-compose restart postgres
```

### Ver datos de ejemplo
```sql
-- Conectar a PostgreSQL
docker exec -it query_builder_db psql -U postgres -d query_builder

-- Ver tablas
\dt

-- Ver algunos datos
SELECT * FROM users LIMIT 5;
SELECT * FROM orders LIMIT 5;
```

## Estructura de Datos

### Tablas Creadas
- `users`: 10 usuarios de ejemplo
- `categories`: 5 categorías de productos
- `products`: 13 productos
- `orders`: 30 órdenes

### Funcionalidades
- ✅ Semantic Layer dinámico
- ✅ Drag & Drop para construir queries
- ✅ Visualización de resultados
- ✅ Export a CSV
- ✅ Guardar/Cargar queries
- ✅ Editor SQL avanzado
- ✅ Conexión real a PostgreSQL
