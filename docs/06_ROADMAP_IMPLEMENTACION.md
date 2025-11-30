# Roadmap de Implementación - Sistema de Pasantías

## 🎯 Objetivo

Este documento define la secuencia de implementación recomendada, desde setup inicial hasta MVP completo y mejoras futuras.

---

## 📋 Pre-Requisitos

### Herramientas Necesarias
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ (local o servicio managed)
- [ ] Encore.ts CLI instalado
- [ ] Git configurado
- [ ] Editor (VSCode recomendado)

### Servicios Externos (opcional para MVP)
- [ ] Servicio de email (SendGrid/Resend) para notificaciones
- [ ] CDN (Cloudflare) para archivos estáticos
- [ ] Redis (futuro, para cache)

### Cuentas/Acceso
- [ ] Repositorio Git creado
- [ ] PostgreSQL database creada
- [ ] Credenciales de API SIU Guaraní (si disponible)

---

## 🚀 Fase 1: Setup y Core (Semanas 1-2)

### 1.1 Setup de Proyecto

**Prioridad: 🔴 Crítica**

```bash
# Crear proyecto Encore
encore app create sistema-pasantias

# Setup Prisma
npm install prisma @prisma/client
npx prisma init

# Dependencies básicas
npm install bcrypt
npm install --save-dev @types/bcrypt
```

**Deliverables:**
- [ ] Proyecto Encore inicializado
- [ ] Prisma configurado
- [ ] Git repo con .gitignore apropiado
- [ ] README.md básico

---

### 1.2 Base de Datos Core

**Prioridad: 🔴 Crítica**

Implementar en este orden:

**Schema básico (día 1-2):**
```prisma
// Comenzar con:
- User (sin deletedAt/anonymizedAt por ahora)
- Session (versión completa OWASP)
- Course
- Skill
- Company
- DocumentType
```

**Schema relacional (día 3-4):**
```prisma
// Agregar:
- ProfileSkill
- Offer
- OfferSkill
- RequiredDocument
- Document (sin campos de integración por ahora)
```

**Schema de postulaciones (día 5):**
```prisma
// Agregar:
- ApplicationDraft
- DraftDocument
- Application
- ApplicationDocument
- Notification
```

**Comandos:**
```bash
npx prisma migrate dev --name initial_schema
npx prisma generate
```

**Deliverables:**
- [ ] Schema Prisma completo (versión básica)
- [ ] Migraciones aplicadas
- [ ] Seed script con datos de prueba
- [ ] Índices en todas las FKs

---

### 1.3 Autenticación

**Prioridad: 🔴 Crítica**

**Endpoints:**
```
POST /auth/register
POST /auth/login
POST /auth/logout
```

**Features:**
- Hashing de passwords con bcrypt (10 rounds)
- Creación de sessions con OWASP settings
- Cookies httpOnly + secure + sameSite
- Middleware de autenticación
- Validación de sessions (idle + absolute timeout)
- Rate limiting en login (5 req/min por IP)

**Testing crítico:**
- [ ] Registro exitoso
- [ ] Login exitoso
- [ ] Login con credenciales inválidas → 401
- [ ] Session expira tras 30min idle
- [ ] Session expira tras 12h absolute
- [ ] Rate limit funciona (intento 6 → 429)

**Deliverables:**
- [ ] Auth completamente funcional
- [ ] Middleware de autenticación reutilizable
- [ ] Tests de auth pasando

---

## 🏗️ Fase 2: Funcionalidad Base (Semanas 3-4)

### 2.1 Gestión de Perfiles

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET    /profile
PATCH  /profile
```

**Features:**
- Ver perfil completo con skills y carrera
- Actualizar campos básicos
- Agregar/quitar skills

**Deliverables:**
- [ ] Endpoints funcionando
- [ ] Validaciones de input
- [ ] Tests básicos

---

### 2.2 Catálogos Públicos

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET /courses
GET /courses/:id
GET /skills
GET /skills/:id
GET /companies
GET /companies/:id
GET /companies/:id/offers
```

**Features:**
- Paginación en skills y companies
- Sin paginación en courses (<50)
- Filtrado OData básico
- Búsqueda simple con ?q=

**Deliverables:**
- [ ] Todos los endpoints públicos funcionando
- [ ] Paginación cursor-based implementada
- [ ] Filtrado OData básico (eq, contains)
- [ ] HATEOAS links en responses

---

### 2.3 Ofertas Públicas

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET /offers
GET /offers/:id
```

**Features:**
- Lista ofertas ACTIVE con paginación
- Detalle con company, skills, requiredDocuments
- Filtrado por status, company, skills
- Ordenamiento por publishedAt, expiresAt

**Deliverables:**
- [ ] Endpoints funcionando
- [ ] Queries optimizadas con índices
- [ ] Filtrado avanzado (múltiples skills, etc)

---

### 2.4 File Upload

**Prioridad: 🟡 Alta**

**Endpoints:**
```
POST   /documents
GET    /documents
GET    /documents/:id (download)
DELETE /documents/:id
```

**Features:**
- Upload binario directo (no multipart inicialmente)
- Headers para metadata (X-Document-Type-Id, X-Original-Filename)
- Validación de tamaño (max 10MB)
- Validación de tipo (PDF, DOC, DOCX, JPG, PNG)
- Sanitización de nombres
- Storage en filesystem local (/uploads/users/:userId/)
- Rate limiting (10 uploads/hour)

**Deliverables:**
- [ ] Upload funcionando
- [ ] Download con Content-Disposition
- [ ] Validaciones completas
- [ ] Manejo de errores (tamaño, tipo)
- [ ] Delete con verificación de ownership

---

## 🎯 Fase 3: Flujo de Postulación (Semanas 5-6)

### 3.1 Borradores

**Prioridad: 🔴 Crítica**

**Endpoints:**
```
GET    /offers/:offerId/draft
PATCH  /offers/:offerId/draft
PUT    /offers/:offerId/draft/documents/:reqDocId
POST   /offers/:offerId/draft/documents/use-existing
GET    /offers/:offerId/draft/documents
DELETE /offers/:offerId/draft/documents/:reqDocId
DELETE /offers/:offerId/draft
```

**Features:**
- Crear draft automáticamente (PATCH idempotente)
- Subir documentos nuevos
- Reutilizar documentos existentes
- Ver progreso (completedDocuments / totalDocuments)
- Validar que oferta esté ACTIVE

**Testing crítico:**
- [ ] Crear draft en oferta ACTIVE → 200
- [ ] Crear draft en oferta EXPIRED → 400
- [ ] Subir documento → asocia a draft
- [ ] Reutilizar documento → lastUsedAt actualizado
- [ ] Borrar documento del draft → no borra Document

**Deliverables:**
- [ ] Todos los endpoints de draft funcionando
- [ ] Reutilización de documentos probada
- [ ] Validaciones de estado de oferta

---

### 3.2 Confirmación de Postulación

**Prioridad: 🔴 Crítica**

**Endpoints:**
```
PATCH /offers/:offerId/draft/confirm
```

**Features:**
- Validar todos los requisitos cumplidos
- Crear Application
- Copiar DraftDocument → ApplicationDocument
- DELETE ApplicationDraft
- Crear Notification (APPLICATION_SUBMITTED)
- Rate limiting (1 req/10sec)

**Side effects críticos:**
- Application creada con status PENDING
- Draft borrado
- Documents con lastUsedAt actualizado
- Notificación enviada

**Testing crítico:**
- [ ] Confirmar con docs completos → Application creada
- [ ] Confirmar con docs faltantes → 400
- [ ] Confirmar dos veces → 409 (unique constraint)
- [ ] Draft se borra tras confirmar
- [ ] Notificación creada

**Deliverables:**
- [ ] Flujo completo de postulación funcionando
- [ ] Validaciones exhaustivas
- [ ] Tests end-to-end

---

### 3.3 Mis Postulaciones

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET    /my-applications
GET    /my-applications/:id
DELETE /my-applications/:id (cancelar)
```

**Features:**
- Lista con paginación
- Filtrado por status
- Detalle con documentos adjuntos
- Cancelar (solo si PENDING)

**Side effects de cancelar:**
- Application.status = CANCELLED
- DELETE ApplicationDocument
- Marcar Documents sin referencias para borrado

**Deliverables:**
- [ ] Ver postulaciones propias
- [ ] Cancelar postulaciones PENDING
- [ ] No puede cancelar ACCEPTED/REJECTED → 409

---

## 🎛️ Fase 4: Panel Admin (Semanas 7-8)

### 4.1 Admin - Usuarios y Empresas

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id
DELETE /admin/users/:id

GET    /admin/companies
GET    /admin/companies/:id
PATCH  /admin/companies/:id
DELETE /admin/companies/:id
```

**Features:**
- CRUD completo
- Soft delete de empresas
- Borrado diferido de usuarios (si tienen applications activas)
- Paginación y filtrado

**Deliverables:**
- [ ] Admin puede gestionar usuarios
- [ ] Admin puede gestionar empresas
- [ ] Borrado de usuario con applications → soft delete + anonimización

---

### 4.2 Admin - Ofertas

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET    /admin/offers
GET    /admin/offers/:id
PATCH  /admin/offers/:id
DELETE /admin/offers/:id
```

**Features:**
- Crear ofertas (status DRAFT)
- Publicar ofertas (status ACTIVE, publishedAt)
- Cerrar ofertas (status CLOSED, closedAt)
- Soft delete
- Asociar requiredDocuments y skills

**Deliverables:**
- [ ] CRUD completo de ofertas
- [ ] Transiciones de estado correctas
- [ ] Warning en UI si borra oferta con applications

---

### 4.3 Admin - Postulaciones

**Prioridad: 🔴 Crítica**

**Endpoints:**
```
GET   /admin/applications
GET   /admin/applications/:id
PATCH /admin/applications/:id/status
DELETE /admin/applications/:id
```

**Features:**
- Ver todas las applications con filtros
- Cambiar status (PENDING → REVIEWING → ACCEPTED/REJECTED)
- Ver documentos adjuntos
- Agregar feedback

**Side effects al ACEPTAR/RECHAZAR:**
- Application.finalizedAt = now()
- DELETE ApplicationDocument
- Marcar Documents sin referencias para borrado (+30 días)
- Crear Notification al estudiante

**Testing crítico:**
- [ ] Cambiar a ACCEPTED → documents borrados, notificación enviada
- [ ] Cambiar a REJECTED → ídem
- [ ] Documentos sin referencias → scheduledForDeletion seteado

**Deliverables:**
- [ ] Gestión completa de applications
- [ ] Ciclo de vida de documentos funcionando
- [ ] Notificaciones enviadas correctamente

---

### 4.4 Admin - Catálogos

**Prioridad: 🟢 Media**

**Endpoints:**
```
POST   /admin/courses
PATCH  /admin/courses/:id
DELETE /admin/courses/:id

GET    /admin/skills
GET    /admin/skills/:id
POST   /admin/skills
PATCH  /admin/skills/:id
DELETE /admin/skills/:id
POST   /admin/skills/:id/merge

GET    /admin/document-types
POST   /admin/document-types
DELETE /admin/document-types/:id
```

**Features:**
- CRUD de catálogos
- Validar que no se borren tipos en uso (onDelete: Restrict)
- Skill merge (mover referencias y borrar)

**Deliverables:**
- [ ] Admin puede gestionar catálogos
- [ ] Merge de skills funcionando
- [ ] Restricciones de borrado funcionando

---

## 🔔 Fase 5: Notificaciones y Tiempo Real (Semana 9)

### 5.1 Sistema de Notificaciones

**Prioridad: 🟡 Alta**

**Endpoints:**
```
GET    /notifications
GET    /notifications/:id
PATCH  /notifications/:id/read
DELETE /notifications/:id

POST   /admin/notifications/broadcast
```

**Features:**
- Lista con paginación (sin filtrado OData)
- Parámetro unreadOnly=true
- Marcar como leída
- Borrado manual
- Broadcast de admin (individual o todos)

**Triggers automáticos:**
- APPLICATION_SUBMITTED (al confirmar)
- APPLICATION_ACCEPTED (admin acepta)
- APPLICATION_REJECTED (admin rechaza)
- OFFER_PUBLISHED (admin publica, futuro)
- OFFER_CLOSING_SOON (job diario)

**Deliverables:**
- [ ] CRUD de notificaciones
- [ ] Triggers automáticos funcionando
- [ ] Broadcast de admin

---

### 5.2 WebSockets

**Prioridad: 🟢 Media (MVP puede funcionar sin esto)**

**Topics:**
```
user:{userId}:notifications
offer:{offerId}:status
offer:{offerId}:requirements
offer:{offerId}:editing
```

**Setup con Encore PubSub:**
```typescript
import { pubsub } from "encore.dev/pubsub";

const notificationTopic = new pubsub.Topic<NotificationMessage>(
  "user-notifications",
  { deliveryGuarantee: "at-least-once" }
);

// Publicar
await notificationTopic.publish({
  userId: 123,
  type: 'APPLICATION_ACCEPTED'
});

// Suscribir (frontend)
subscription.on('user:123:notifications', (msg) => {
  // Actualizar UI
});
```

**Deliverables:**
- [ ] WebSocket setup con Encore PubSub
- [ ] Notificaciones en tiempo real
- [ ] Estado de ofertas en tiempo real
- [ ] Polling como fallback si WS falla

---

## 🎨 Fase 6: Campos Custom y Avanzados (Semana 10-11)

### 6.1 Campos Custom

**Prioridad: 🟢 Media**

**Schema:**
```prisma
CustomField
CustomFieldResponse
DraftCustomFieldResponse
```

**Endpoints:**
```
GET    /admin/offers/:id/custom-fields
POST   /admin/offers/:id/custom-fields
PATCH  /admin/offers/:id/custom-fields/:fieldId
DELETE /admin/offers/:id/custom-fields/:fieldId

GET    /offers/:id/custom-fields
GET    /offers/:id/draft/custom-fields
PATCH  /offers/:id/draft/custom-fields

GET    /admin/applications/:id/custom-fields
```

**Features:**
- Admin define campos dinámicos por oferta
- Tipos: TEXT, TEXTAREA, EMAIL, PHONE, DATE, NUMBER, SELECT, CHECKBOX, FILE
- Validaciones JSON (pattern, maxLength, options)
- Usuario completa en draft
- Validación al confirmar

**Testing crítico:**
- [ ] Crear campo required → validación al confirmar
- [ ] Campo con pattern → validación funciona
- [ ] Campo tipo FILE → asocia documento
- [ ] Campos optional → no bloquean confirmación

**Deliverables:**
- [ ] Schema de custom fields
- [ ] CRUD de admin
- [ ] Validaciones dinámicas
- [ ] UI puede renderizar campos dinámicos

---

### 6.2 Cambios en Requisitos de Ofertas

**Prioridad: 🟡 Alta**

**Features:**
- Admin agrega requisito → Applications PENDING/REVIEWING se BLOQUEAN
- Crear Draft desde Application bloqueada
- Copiar ApplicationDocument → DraftDocument
- Notificar usuarios afectados
- WebSocket broadcast (offer:X:requirements)
- Usuario completa documentos faltantes
- Confirmar → Application.status = PENDING (desbloquea)

**Admin quita requisito:**
- DELETE ApplicationDocument del tipo quitado
- Marcar Documents sin referencias para borrado
- NO bloquear applications (tienen documentos de más)
- NO notificar usuarios

**Deliverables:**
- [ ] Bloqueo automático al agregar requisitos
- [ ] Copia a draft con documentos existentes
- [ ] Desbloqueo al confirmar
- [ ] Borrado silencioso al quitar requisitos

---

### 6.3 Integración Universitaria

**Prioridad: 🟢 Baja (MVP puede funcionar sin esto)**

**Endpoint:**
```
POST /documents/fetch-from-university
```

**Features:**
- Llamada a API SIU Guaraní
- Descarga automática de certificado
- Crear Document con source=UNIVERSITY_API
- Fallback manual si API no disponible

**Schema update:**
```prisma
Document {
  source: UNIVERSITY_API | USER_UPLOAD | ADMIN_UPLOAD
  externalId: string?
  verifiedAt: DateTime?
}
```

**Deliverables:**
- [ ] Endpoint funcionando (si API disponible)
- [ ] Fallback manual implementado
- [ ] Admin puede verificar documentos manualmente

---

## 🤖 Fase 7: Jobs Automatizados (Semana 12)

### 7.1 Jobs Críticos

**Implementar con Encore CronJobs:**

```typescript
import { CronJob } from "encore.dev/cron";

// 1. Expirar ofertas (cada hora)
const expireOffers = new CronJob("expire-offers", {
  schedule: "0 * * * *",
  endpoint: expireOffersJob
});

// 2. Limpiar drafts (diario 03:00)
const cleanupDrafts = new CronJob("cleanup-drafts", {
  schedule: "0 3 * * *",
  endpoint: cleanupDraftsJob
});

// 3. Limpiar documentos (diario 04:00)
const cleanupDocuments = new CronJob("cleanup-documents", {
  schedule: "0 4 * * *",
  endpoint: cleanupDocumentsJob
});

// 4. Limpiar sessions (diario 02:00)
const cleanupSessions = new CronJob("cleanup-sessions", {
  schedule: "0 2 * * *",
  endpoint: cleanupSessionsJob
});

// 5. Limpiar notificaciones (semanal domingo 03:00)
const cleanupNotifications = new CronJob("cleanup-notifications", {
  schedule: "0 3 * * 0",
  endpoint: cleanupNotificationsJob
});

// 6. Purgar usuarios eliminados (mensual día 1 05:00)
const purgeDeletedUsers = new CronJob("purge-deleted-users", {
  schedule: "0 5 1 * *",
  endpoint: purgeDeletedUsersJob
});
```

**Testing de jobs:**
- [ ] Ejecutar manualmente cada job
- [ ] Verificar side effects correctos
- [ ] Verificar que no borra datos necesarios
- [ ] Logs apropiados

**Deliverables:**
- [ ] 6 jobs implementados y testeados
- [ ] Scheduling configurado
- [ ] Logs y monitoring

---

## 🎯 Fase 8: Testing y Pulido (Semana 13-14)

### 8.1 Testing Exhaustivo

**Tests unitarios:**
- [ ] Validaciones de input
- [ ] Lógica de negocio
- [ ] Helpers y utils

**Tests de integración:**
- [ ] Flujo completo de postulación
- [ ] Flujo de gestión admin
- [ ] Jobs automatizados

**Tests de seguridad:**
- [ ] Rate limiting funciona
- [ ] 403 vs 404 correcto
- [ ] Session expiration
- [ ] Password hashing
- [ ] SQL injection (Prisma previene)
- [ ] File upload validations

**Tests de performance:**
- [ ] Query con 1000 applications < 200ms
- [ ] Upload de 10MB < 5s
- [ ] Paginación con 10000 ofertas funciona
- [ ] 100 usuarios concurrentes sin degradación

---

### 8.2 Documentación

**Documentación de API:**
- [ ] OpenAPI/Swagger spec
- [ ] Examples de requests/responses
- [ ] Error codes documentados

**Documentación de deployment:**
- [ ] Setup de PostgreSQL
- [ ] Variables de entorno
- [ ] Migrar schema
- [ ] Seed de datos iniciales

**Documentación de usuario:**
- [ ] Guía para estudiantes
- [ ] Guía para admins
- [ ] FAQs

---

### 8.3 UI Polish

**Mensajes de error:**
- [ ] User-friendly, no técnicos
- [ ] Traducidos (español)
- [ ] Consistentes

**UX:**
- [ ] Loading states
- [ ] Empty states
- [ ] Confirmaciones de acciones destructivas
- [ ] Toasts/notificaciones
- [ ] Validaciones en tiempo real

---

## 🚢 Fase 9: Deployment y Monitoreo (Semana 15)

### 9.1 Deployment

**Backend (Encore Cloud):**
```bash
encore deploy production
```

**Database (Supabase/Railway/Render):**
- [ ] PostgreSQL production setup
- [ ] Backups automáticos configurados
- [ ] Connection pooling

**File Storage:**
- [ ] Filesystem local O
- [ ] S3-compatible storage (MinIO, S3, etc)
- [ ] CDN configurado (opcional)

**Variables de entorno:**
```
DATABASE_URL
SESSION_SECRET
FILE_STORAGE_PATH
CDN_BASE_URL (opcional)
SIU_GUARANI_API_URL (opcional)
SIU_GUARANI_API_KEY (opcional)
EMAIL_SERVICE_API_KEY (opcional)
```

---

### 9.2 Monitoreo

**Métricas clave:**
- [ ] Request rate
- [ ] Error rate
- [ ] Response time (p50, p95, p99)
- [ ] Database queries time
- [ ] File upload success rate
- [ ] Job execution status

**Alertas:**
- [ ] Error rate > 5%
- [ ] Response time > 1s
- [ ] Database connection issues
- [ ] Filesystem lleno > 90%
- [ ] Jobs fallando

**Logging:**
- [ ] Application logs (info, warn, error)
- [ ] Audit logs de cambios admin
- [ ] Security logs (logins fallidos, etc)

---

## 🔮 Post-MVP: Mejoras Futuras

### Prioridad Alta
- [ ] Email verification (schema ya listo)
- [ ] Forgot password flow
- [ ] Cache con Redis (ofertas activas, skills, etc)
- [ ] Full-text search (PostgreSQL tsvector)
- [ ] Dashboard de analytics para admin

### Prioridad Media
- [ ] Chunked uploads para archivos grandes
- [ ] Deduplicación de archivos (hash)
- [ ] Webhooks para integraciones
- [ ] Export de datos (CSV, Excel)
- [ ] Auditoría completa (ApplicationStatusHistory)

### Prioridad Baja
- [ ] Sistema de permisos granular
- [ ] Multi-tenancy (múltiples universidades)
- [ ] API pública para integraciones
- [ ] Mobile app (React Native)
- [ ] Notificaciones push

---

## ✅ Checklist de "Definition of Done"

### Para cada Feature:
- [ ] Código implementado y funciona
- [ ] Tests escritos y pasando
- [ ] Validaciones completas
- [ ] Error handling apropiado
- [ ] Logging adecuado
- [ ] Documentación actualizada
- [ ] Code review hecho
- [ ] Testeado en staging
- [ ] Performance aceptable

### Para MVP Completo:
- [ ] Todos los endpoints core funcionando
- [ ] Flujo completo de postulación OK
- [ ] Panel admin completo
- [ ] Jobs automatizados corriendo
- [ ] Tests de seguridad pasando
- [ ] Tests de performance OK
- [ ] Documentación completa
- [ ] Deployed a producción
- [ ] Monitoreo configurado
- [ ] Usuarios de prueba validaron

---

## 📊 Timeline Estimado

| Fase | Duración | Sprint |
|------|----------|--------|
| Setup y Core | 2 semanas | Sprint 1 |
| Funcionalidad Base | 2 semanas | Sprint 2 |
| Flujo de Postulación | 2 semanas | Sprint 3 |
| Panel Admin | 2 semanas | Sprint 4 |
| Notificaciones + WS | 1 semana | Sprint 5 |
| Campos Custom | 2 semanas | Sprint 6 |
| Jobs Automatizados | 1 semana | Sprint 7 |
| Testing y Pulido | 2 semanas | Sprint 8 |
| Deployment | 1 semana | Sprint 9 |
| **TOTAL MVP** | **15 semanas** | **~3-4 meses** |

**Nota:** Timeline asume 1 desarrollador full-time. Con equipo más grande, puede paralelizarse.

---

## 🎯 ¿Qué Sigue Después de Este Chat?

1. **Crear proyecto Encore** y setup inicial
2. **Implementar Fase 1** (Setup y Core)
3. **Validar con stakeholders** el diseño de BD y API
4. **Iteración rápida** en sprints de 1-2 semanas
5. **Testing continuo** desde el principio
6. **Deployment a staging** lo antes posible
7. **Feedback temprano** de usuarios reales

**Documentación disponible:**
- 00_RESUMEN_EJECUTIVO.md
- 01_VISION_GENERAL.md
- 02_DATABASE_SCHEMA.md
- 03_API_ENDPOINTS.md
- 04_EDGE_CASES.md
- 05_ACTUALIZACIONES_V2.md
- 06_ROADMAP_IMPLEMENTACION.md (este archivo)

**¡Todo listo para comenzar la implementación! 🚀**

