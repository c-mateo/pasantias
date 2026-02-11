# 🏗️ Arquitectura del Sistema - Vista General

Documento técnico sobre la arquitectura implementada del Sistema de Gestión de Pasantías.

---

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR WEB                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React SPA (Single Page Application)                       │ │
│  │  • React Router v7 - Enrutamiento                          │ │
│  │  • Fetch API - Comunicación HTTP                           │ │
│  │  • Context API - Estado global                             │ │
│  │  • Vite - Build tool                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │ Cookie: adonis-session
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                      SERVIDOR NODE.JS                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AdonisJS Framework (v7)                                    │ │
│  │                                                             │ │
│  │  ┌───────────────────────────────────────────────────────┐ │ │
│  │  │  CAPA HTTP                                            │ │ │
│  │  │  • Router (start/routes.ts)                          │ │ │
│  │  │  • Middleware: Auth, CORS, Validation                │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  │                           │                                 │ │
│  │  ┌───────────────────────▼───────────────────────────────┐ │ │
│  │  │  CAPA DE LÓGICA DE NEGOCIO                           │ │ │
│  │  │  • Controllers (app/controllers/)                    │ │ │
│  │  │    - AuthController                                  │ │ │
│  │  │    - ProfileController                               │ │ │
│  │  │    - OfferController                                 │ │ │
│  │  │    - ApplicationController                           │ │ │
│  │  │    - DraftController                                 │ │ │
│  │  │    - ...más (11 total)                               │ │ │
│  │  │  • Validators (app/validators/)                      │ │ │
│  │  │    - VineJS schemas                                  │ │ │
│  │  │  • Jobs (app/jobs/)                                  │ │ │
│  │  │    - SendTemplatedEmail                              │ │ │
│  │  │    - CreateNotifications                             │ │ │
│  │  └──────────────────────────────────────────────���────────┘ │ │
│  │                           │                                 │ │
│  │  ┌───────────────────────▼───────────────────────────────┐ │ │
│  │  │  CAPA DE ACCESO A DATOS                              │ │ │
│  │  │  • Prisma Client ORM                                 │ │ │
│  │  │  • Extensions: Pagination, GuardedCreate             │ │ │
│  │  │  • Type-safe queries                                 │ │ │
│  │  └───────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ SQL (via Prisma)
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    PostgreSQL Database                            │
│                                                                   │
│  • 16 tablas principales                                         │
│  • Constraints: PK, FK, UNIQUE, CHECK                            │
│  • Índices optimizados                                           │
│  • Transacciones ACID                                            │
│  • Prisma Migrations para versionado de esquema                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Principios Arquitectónicos

### 1. Separación de Responsabilidades (SoC)

- **Frontend:** Presentación y experiencia de usuario
- **Backend:** Lógica de negocio, validación, autorización
- **Base de Datos:** Persistencia y consultas

### 2. Arquitectura Cliente-Servidor

Comunicación unidireccional:
```
Cliente hace request → Servidor procesa → Servidor responde
```

No hay comunicación bidireccional en tiempo real — **NO HAY WebSockets ni otros mecanismos de comunicación en tiempo real**.

### 3. API REST Stateless

Cada request es independiente. El estado de sesión se mantiene mediante cookie que el cliente incluye automáticamente.

### 4. MVC en Backend

```
Model (Prisma) ← Controller → View (JSON Response)
                    ↓
                Validator
```

---

## 🔐 Flujo de Autenticación

```
1. Usuario → POST /api/v1/auth/login {email, password}
              ↓
2. Backend valida credenciales (bcrypt)
              ↓
3. Backend crea sesión y devuelve cookie:
   Set-Cookie: adonis-session=<encrypted-token>; HttpOnly; Secure
              ↓
4. Cliente (navegador) guarda cookie automáticamente
              ↓
5. Todas las requests subsecuentes incluyen cookie
              ↓
6. Middleware 'auth' valida cookie y recupera usuario
```

**Ventajas sobre JWT:**
- Cookie HttpOnly = protección contra XSS
- Revocación inmediata de sesiones (logout)
- No requiere almacenamiento en cliente

---

## 📦 Flujo de una Request Típica

**Ejemplo:** Usuario estudiante postulándose a una oferta

```
┌─────────────┐
│  Usuario    │ Clic en "Enviar Postulación"
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React)                                        │
│  • Ejecuta fetch('/api/v1/offers/123/draft/submit')    │
│  • Método: POST                                          │
│  • Cookie incluida automáticamente                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND - Router (start/routes.ts)                     │
│  • Matchea ruta: POST /offers/:offerId/draft/submit     │
│  • Ejecuta middleware: ['auth']                         │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────��────────────────────────┐
│  Middleware 'auth'                                      │
│  • Verifica cookie de sesión                           │
│  • Recupera usuario de BD                              │
│  • Añade `auth.user` al contexto                       │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  DraftController.submit()                               │
│  1. Busca borrador del usuario para la oferta          │
│  2. Valida que todos los documentos requeridos estén   │
│  3. Si falta algo → return 400 con detalles            │
│  4. Crea Application en BD                             │
│  5. Elimina Draft                                       │
│  6. Encola jobs: SendEmail, CreateNotification         │
│  7. Return 200 {applicationId, status, appliedAt}      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Prisma ORM                                             │
│  • Transacción para atomicidad                         │
│  • INSERT INTO applications (...)                       │
│  • DELETE FROM drafts WHERE ...                         │
│  • Commit                                               │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL                                             │
│  • Ejecuta queries SQL                                  │
│  • Valida constraints (FK, UNIQUE)                      │
│  • Retorna resultado                                    │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Response al cliente                                    │
│  HTTP 200 OK                                            │
│  Content-Type: application/json                         │
│  {                                                      │
│    "data": {                                            │
│      "applicationId": 42,                               │
│      "status": "PENDING",                               │
│      "appliedAt": "2026-02-09T15:30:00.000Z"           │
│    }                                                    │
│  }                                                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND - Callback de fetch()                        │
│  • Parsea JSON                                          │
│  • Actualiza estado React                               │
│  • Redirige a /my-applications                          │
│  • Muestra notificación de éxito                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Organización del Código

### Backend (AdonisJS)

```
backend/
├── app/
│   ├── controllers/         # 11 controladores
│   │   └── *.ts             # Métodos async con HttpContext
│   ├── validators/          # Esquemas VineJS
│   │   └── *.ts             # Reglas de validación por recurso
│   ├── middleware/          # Middleware personalizado
│   ├── exceptions/          # Errores estructurados
│   └── jobs/                # Tareas async (email, notificaciones)
├── prisma/
│   ├── schema.prisma        # Definición de modelos
│   ├── migrations/          # SQL generado automáticamente
│   └── extensions.ts        # Métodos custom de Prisma
├── start/
│   ├── routes.ts            # Todas las rutas HTTP (46 endpoints)
│   └── kernel.ts            # Middleware global
├── config/                  # Configuración (auth, cors, etc.)
└── uploads/                 # PDFs subidos por usuarios
```

### Frontend (React)

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── forms/           # Formularios
│   │   ├── layout/          # Header, Footer, Sidebar
│   │   └── ui/              # Buttons, Modals, Cards
│   ├── pages/               # Páginas por ruta
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── OfferList.tsx
│   │   ├── DraftForm.tsx
│   │   └── AdminDashboard.tsx
│   ├── utils/               # API client, helpers
│   ├── App.tsx              # Definición de rutas
│   └── main.tsx             # Entry point
└── public/                  # Assets estáticos
```

---

## 🗄️ Modelo de Datos (Simplificado)

```
User
├── id, email, password, role (STUDENT|ADMIN)
├── firstName, lastName, cuil, phone, address
├── HAS MANY → Application
├── HAS MANY → Draft
├── HAS MANY → Document
└── MANY TO MANY → Course, Skill

Company
├── id, name, description, email, logo
└── HAS MANY → Offer

Offer
├── id, position, description, status (DRAFT|ACTIVE|CLOSED)
├── companyId → Company
├── publishedAt, expiresAt
├── HAS MANY → Application
├── HAS MANY → Draft
├── MANY TO MANY → Course, Skill, DocumentType (requiredDocs)

Draft (Borrador de postulación)
├── userId + offerId (clave compuesta única)
├── HAS MANY → DocumentAttachment
└── Al enviar → se convierte en Application

Application (Postulación enviada)
├── id, userId, offerId
├── status (PENDING|BLOCKED|ACCEPTED|REJECTED|CANCELED)
├── createdAt, finalizedAt, feedback
└── HAS MANY → DocumentAttachment (copia de docs del draft)

Document (PDF subido)
├── id, userId, documentTypeId
├── path, hash (SHA256), size
└── La "reutilización" se realiza a nivel de almacenamiento mediante deduplicación por hash (SHA256): archivos idénticos se almacenan físicamente una sola vez y pueden asociarse a múltiples borradores/postulaciones. Esto es una optimización de almacenamiento y **no** implica una funcionalidad de reuso automático en la interfaz de usuario.
```

---

## 🔄 Estados de una Postulación

```
                  ┌─────────────┐
                  │    DRAFT    │
                  │ (borrador)  │
                  └──────┬──────┘
                         │ submit()
                         ▼
                  ┌─────────────┐
             ┌───▶│   PENDING   │◀───┐
             │    │ (en revisión)│    │
             │    └──────┬──────┘    │
             │           │            │
             │     Admin decide       │
             │           │            │
     unblock │    ┌──────┴──────┐    │
             │    │             │    │
             │    ▼             ▼    │
          ┌──┴────────┐   ┌──────────┴──┐
          │  BLOCKED  │   │  ACCEPTED   │
          │ (requiere │   │ (aprobado)  │
          │  acción)  │   └─────────────┘
          └───────────┘        │
                  │             │ Estados
                  ▼             ▼ finales
          ┌─────────────┐   ┌─────────────┐
          │  REJECTED   │   │  CANCELED   │
          │ (rechazado) │   │ (cancelado) │
          └─────────────┘   └─────────────┘
```

**Transiciones permitidas:**
- PENDING → BLOCKED, ACCEPTED, REJECTED, CANCELED
- BLOCKED → PENDING, ACCEPTED, REJECTED, CANCELED
- ACCEPTED, REJECTED, CANCELED → ninguna (estado final)

---

## 🔒 Seguridad Implementada

### Autenticación
- ✅ Contraseñas hasheadas con **bcrypt** (10 rounds)
- ✅ Sesiones con cookies **HttpOnly** (XSS-proof)
- ✅ Tokens de recuperación con expiración (60 min)

### Autorización
- ✅ Middleware `auth` para rutas protegidas
- ✅ Middleware `admin` para rutas administrativas
- ✅ Verificación de ownership: usuario solo accede a sus recursos

### Validación
- ✅ Validación exhaustiva con **VineJS** en todos los endpoints
- ✅ Prisma previene **SQL injection** (queries parametrizadas)
- ✅ Validación de archivos: tipo, tamaño, hash

### Integridad de Datos
- ✅ Constraints de BD: UNIQUE, FK, CHECK
- ✅ Transacciones para operaciones atómicas
- ✅ Soft deletes con `deletedAt` (no implementado en todas las tablas)

---

## ⚡ Rendimiento

### Paginación
- **Cursor-based** en todos los listados
- Parámetros: `limit` (max 100), `after` (último ID)
- Más eficiente que offset para grandes datasets

### Índices de BD
- Índices en campos frecuentemente filtrados:
  - `User(email)`, `Application(userId, status)`, `Offer(status, publishedAt)`
- Creados automáticamente por Prisma según `@@index` en schema

### Deduplicación de Archivos
- Deduplicación a nivel de almacenamiento mediante hash SHA256: archivos idénticos se almacenan físicamente una sola vez.
- Los mismos bytes (mismo hash) pueden ser referenciados por múltiples usuarios/postulaciones; esto es una optimización de almacenamiento y **no** una funcionalidad de "reutilización automática" en la UX.

---

## 🧩 Extensibilidad

### Añadir nuevo endpoint:

1. **Definir ruta** en `start/routes.ts`:
   ```typescript
   router.get('/admin/stats', [StatsController, 'index'])
   ```

2. **Crear controlador** en `app/controllers/stats_controller.ts`:
   ```typescript
   export default class StatsController {
     async index({ response }: HttpContext) {
       const stats = await prisma.application.groupBy({...})
       return response.ok({ data: stats })
     }
   }
   ```

3. **Añadir validación** (opcional) en `app/validators/stats.ts`

4. **Documentar** en `docs/openapi.yaml`

### Añadir nueva tabla:

1. **Modificar** `prisma/schema.prisma`:
   ```prisma
   model Feedback {
     id     Int    @id @default(autoincrement())
     userId Int
     text   String
     user   User   @relation(fields: [userId], references: [id])
   }
   ```

2. **Generar migración**:
   ```bash
   npm run prisma:migrate -- --name add_feedback
   ```

3. **Usar en controllers**:
   ```typescript
   await prisma.feedback.create({ data: {...} })
   ```

---

## 📚 Para Profundizar

- **API completa:** [api.md](api.md)
- **OpenAPI spec:** [openapi.yaml](openapi.yaml)
- **Informe técnico:** [informe.md](informe.md)

---

**Autor:** [[COMPLETAR]]  
**Última actualización:** Febrero 2026