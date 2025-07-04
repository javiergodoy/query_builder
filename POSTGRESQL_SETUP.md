# Query Builder con PostgreSQL

Esta aplicación ahora soporta PostgreSQL como base de datos real en lugar de datos simulados.

## Configuración de PostgreSQL

### Opción 1: PostgreSQL con Docker (Recomendado)

**Requisitos:**
- Docker Desktop instalado
- Docker Compose

**Pasos:**

1. **Iniciar PostgreSQL en Docker:**
```bash
# Desde el directorio raíz del proyecto
docker-compose up -d postgres
```

2. **Verificar que está funcionando:**
```bash
# Ver logs
docker-compose logs postgres

# Verificar estado
docker-compose ps
```

3. **Conectar a la base de datos (opcional):**
```bash
# Conectar directamente al contenedor
docker exec -it query_builder_db psql -U postgres -d query_builder
```

### Opción 2: PostgreSQL Instalado Localmente

**Windows:**
- Descargar desde: https://www.postgresql.org/download/windows/
- Instalar con usuario `postgres` y contraseña que recuerdes

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Configuración del Proyecto

### 1. Configurar Variables de Entorno

Los archivos `.env` ya están configurados para Docker. Si usas instalación local, edita:

**Backend (`server/.env`):**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=query_builder
DB_USER=postgres
DB_PASSWORD=postgres
```

**Frontend (`.env`):**
```bash
VITE_API_URL=http://localhost:3001/api
VITE_USE_REAL_DB=true
```

### 2. Iniciar el Servidor Backend

```bash
# Ir al directorio del servidor
cd server

# Instalar dependencias (si no están instaladas)
npm install

# Iniciar el servidor
npm start

# O en modo desarrollo con auto-reload
npm run dev
```

### 3. Iniciar la Aplicación Frontend

```bash
# Desde el directorio raíz del proyecto
npm install

# Iniciar en modo desarrollo
npm run dev
```

## Inicio Rápido con Docker

```bash
# 1. Iniciar PostgreSQL
docker-compose up -d postgres

# 2. Esperar a que PostgreSQL esté listo (30 segundos aprox)
docker-compose logs -f postgres

# 3. Iniciar el backend (nueva terminal)
cd server && npm install && npm start

# 4. Iniciar el frontend (nueva terminal)
npm install && npm run dev
```

## Verificación

1. **PostgreSQL funcionando**: 
   ```bash
   docker-compose ps
   ```
2. **Backend funcionando**: Visita `http://localhost:3001/api/health`
3. **Esquema cargado**: Visita `http://localhost:3001/api/schema`
4. **Frontend conectado**: La aplicación en `http://localhost:5173` debería mostrar "PostgreSQL Connected"

## Comandos Útiles de Docker

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Conectar a PostgreSQL
docker exec -it query_builder_db psql -U postgres -d query_builder

# Parar PostgreSQL
docker-compose stop postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Eliminar todo (¡cuidado, borra todos los datos!)
docker-compose down -v
```

## Estructura de Datos

### Tablas Principales

**users**
- id, name, email, created_at

**categories**
- id, name, description

**products**
- id, name, price, category_id, description, created_at

**orders**
- id, user_id, product_id, quantity, total, order_date, created_at

### Datos de Ejemplo

- 10 usuarios
- 5 categorías (Electronics, Home & Kitchen, Books, Sports, Clothing)
- 13 productos
- 30 órdenes de ejemplo

## Características

### Semantic Layer Dinámico
- **Dimensiones**: Automáticamente detecta campos de texto, fecha y booleanos para agrupar
- **Métricas**: Genera automáticamente COUNT, SUM, AVG, MIN, MAX para campos numéricos
- **Filtros**: Crea filtros para campos comúnmente filtrados

### Ejemplos de Consultas

**Ventas por categoría:**
```sql
SELECT c.name as category_name, SUM(o.total) as total_revenue
FROM orders o
JOIN products p ON o.product_id = p.id  
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY total_revenue DESC;
```

**Clientes más activos:**
```sql
SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY total_spent DESC;
```

## Troubleshooting

### Error de Conexión a la Base de Datos

**Con Docker:**
```bash
# Verificar que el contenedor está corriendo
docker-compose ps

# Ver logs para errores
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

**Sin Docker:**
1. Verificar que PostgreSQL está corriendo:
   ```bash
   # Windows
   services.msc -> PostgreSQL
   
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Verificar credenciales en `.env`
3. Verificar que la base de datos `query_builder` existe
4. Verificar que el usuario tiene permisos

### Puerto en Uso

Si el puerto 5432 está en uso, cambiar en `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Cambiar puerto local
```

Y actualizar `server/.env`:
```bash
DB_PORT=5433
```

### Problemas con el Esquema

Si el semantic layer no se carga:
1. Verificar que las tablas existen: 
   ```bash
   docker exec -it query_builder_db psql -U postgres -d query_builder -c "\dt"
   ```
2. Verificar permisos del usuario en las tablas
3. Revisar logs del servidor backend

### Datos No Se Cargan

Si el script `setup.sql` no se ejecutó:
```bash
# Ejecutar manualmente
docker exec -i query_builder_db psql -U postgres -d query_builder < server/setup.sql
```

## Desarrollo

### Agregar Nuevas Tablas

1. Crear tabla en PostgreSQL
2. Insertar datos de ejemplo
3. Reiniciar el servidor backend
4. El semantic layer se regenerará automáticamente

### Personalizar el Semantic Layer

Editar `src/services/semanticLayerService.ts` para:
- Cambiar lógica de detección de tipos de campo
- Personalizar nombres de display
- Agregar categorías personalizadas
- Modificar agregaciones por defecto
