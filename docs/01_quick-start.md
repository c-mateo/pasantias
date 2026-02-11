# ⚡ Quick Start - Sistema de Pasantías

Levanta el proyecto completo en **5 minutos**.

---

## ✅ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18 → [Descargar](https://nodejs.org/)
- **PostgreSQL** >= 13 → [Descargar](https://www.postgresql.org/download/)
- **npm** o **yarn** (incluido con Node.js)
- **Git** → [Descargar](https://git-scm.com/)

### Verificar instalación:

```bash
node --version   # Debe mostrar v18.x o superior
npm --version
psql --version   # Debe mostrar 13.x o superior
```

---

## 🚀 Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/c-mateo/pasantias.git
cd pasantias
```

---

## 🗄️ Paso 2: Configurar Base de Datos

### Opción A: PostgreSQL Local

1. **Crear base de datos:**

```bash
psql -U postgres
```

```sql
CREATE DATABASE pasantias;
CREATE USER pasantias_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE pasantias TO pasantias_user;
\q
```

2. **Crear archivo `.env` en `backend/`:**

```bash
cd backend
cp .env.example .env  # Si existe, sino crear manualmente
```

3. **Editar `backend/.env`:**

```env
DATABASE_URL="postgresql://pasantias_user:tu_password_seguro@localhost:5432/pasantias"
APP_URL="http://localhost:5173"
APP_KEY="<genera-uno-con-el-comando-de-abajo>"
NODE_ENV="development"
PORT=3333
SESSION_DRIVER="cookie"
```

4. **Generar APP_KEY:**

```bash
node ace generate:key
# Copia el resultado a APP_KEY en .env
```

### Opción B: Docker Compose (Más Rápido)

Si tienes Docker instalado:

```bash
# Desde la raíz del proyecto
docker-compose up -d postgres
```

Usa esta DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pasantias"
```

---

## 🔧 Paso 3: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

---

## 📊 Paso 4: Ejecutar Migraciones y Seeds

```bash
# Ejecutar migraciones (crea las tablas)
npm run prisma:migrate

# Ejecutar seeds (datos de prueba: empresas, carreras, skills)
npm run prisma:seed
```

**Resultado esperado:**
- ✅ 16 tablas creadas
- ✅ Datos seed insertados (4 carreras, 8 skills, 6 empresas, 5 tipos de documentos)

---

## 🎨 Paso 5: Instalar Dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## ▶️ Paso 6: Levantar Todo

### Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

**Debe mostrar:**
```
[ info ] Starting HTTP server...
[ info ] Server running on http://localhost:3333
```

### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

**Debe mostrar:**
```
VITE ready in X ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

---

## 🎉 Paso 7: ¡Acceder al Sistema!

Abre tu navegador en: **http://localhost:5173**

### Crear tu primera cuenta:

1. Haz clic en **"Registrarse"**
2. Completa el formulario
3. ¡El **primer usuario** se convierte en **ADMIN** automáticamente! 🎊

### Credenciales de prueba (si existen seeds):

Si los seeds incluyen usuarios:
```
Email: admin@pasantias.com
Password: password123
```
_(Verifica en `backend/prisma/seed.ts` si se crean usuarios)_

---

## 🧪 Verificar que Todo Funciona

### Test 1: Backend funcionando

```bash
curl http://localhost:3333/api/v1/courses
```

**Respuesta esperada:** JSON con lista de carreras

### Test 2: Frontend funcionando

Abre http://localhost:5173 - debes ver la interfaz de login/registro

### Test 3: Base de datos conectada

```bash
cd backend
npm run prisma:studio
```

Abre http://localhost:5555 - debes ver Prisma Studio con todas las tablas

---

## 🐛 Troubleshooting

### Error: "Port 3333 already in use"

Hay otro proceso usando el puerto. Cámbialo en `backend/.env`:
```env
PORT=3334
```

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # macOS/Linux
   sudo systemctl status postgresql
   # o
   brew services list
   ```

2. Verifica la URL de conexión en `.env`

3. Prueba conectarte manualmente:
   ```bash
   psql -U pasantias_user -d pasantias -h localhost
   ```

### Error: "Module not found"

Reinstala dependencias:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error en migraciones de Prisma

Resetea la base de datos (⚠️ BORRA TODO):
```bash
npm run prisma:migrate reset
```

### Frontend no carga la API

Verifica que `frontend/vite.config.ts` tenga el proxy configurado:
```typescript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
}
```

---

## 📚 Siguientes Pasos

Ahora que el sistema está funcionando:

1. **Explora la API:**  
   → Lee **[03_api-essentials.md](03_api-essentials.md)** para endpoints clave

2. **Entiende la arquitectura:**  
   → Revisa **[02_architecture.md](02_architecture.md)**

3. **Usa el sistema:**  
   → Sigue **[manual-usuario.md](manual-usuario.md)** para flujos completos

4. **Desarrolla features:**  
   → Consulta **[api.md](api.md)** para documentación completa de la API

---

## 🛑 Detener el Sistema

```bash
# En cada terminal, presiona:
Ctrl + C

# Si usaste Docker:
docker-compose down
```

---

## 🔄 Comandos Útiles de Desarrollo

```bash
# Backend
npm run dev          # Modo desarrollo con hot-reload
npm run build        # Build para producción
npm start            # Ejecutar en producción
npm run prisma:studio # Explorar BD visualmente

# Frontend
npm run dev          # Modo desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build

# Prisma
npm run prisma:migrate         # Ejecutar migraciones pendientes
npm run prisma:generate        # Regenerar cliente de Prisma
npm run prisma:migrate reset   # ⚠️ Resetear BD (borra todo)
npm run prisma:seed            # Ejecutar seeds
```

---

**¿Listo?** 🚀 Ahora tienes el sistema funcionando localmente.

**Siguiente:** [03_api-essentials.md](03_api-essentials.md) - Aprende los endpoints esenciales