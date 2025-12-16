# Casos Edge y Consideraciones Especiales

## 🎯 Objetivo

Este documento cubre escenarios edge, comportamientos especiales y decisiones de negocio que afectan el funcionamiento del sistema.

---

## 🔄 Ciclos de Vida y Estados

### 1. Draft → Oferta Expira Antes de Confirmar

**Escenario:**
```
1. Usuario crea draft para Oferta A
2. Usuario sube documentos
3. Oferta A expira (expiresAt < now(), job cambia status a EXPIRED)
4. Usuario intenta confirmar draft
```

**Comportamiento:**
```
PATCH /offers/A/draft/confirm
→ 400 Bad Request
{
  "type": "offer-expired",
  "title": "Offer Expired",
  "detail": "Cannot apply to expired offer",
  "offerId": A
}
```

**Limpieza:**
- Draft se mantiene (usuario puede ver que perdió la oportunidad)
- Job de cleanup borra drafts de ofertas expiradas tras 7 días
- Documentos NO se borran (pueden reutilizarse)

---

### 2. Usuario Postula → Admin Borra Oferta

**Escenario:**
```
1. Usuario tiene Application PENDING en Oferta A
2. Admin hace DELETE /admin/offers/A (soft delete)
```

**Comportamiento:**
```
Offer.deletedAt = now()
Application se MANTIENE (no se borra en cascada)

GET /my-applications/X
→ 200 OK
{
  "offer": {
    "id": A,
    "title": "Pasantía...",
    "status": "CLOSED",
    "deletedAt": "2025-11-10T10:00:00Z"
  },
  "status": "PENDING"
}
```

**Decisión de negocio:**
- Application se mantiene para historial del estudiante
- Admin debe cambiar status de Applications antes de borrar Offer
- UI muestra oferta como "Cerrada/Eliminada"

**Mejor práctica:**
- Admin workflow: primero rechazar todas las applications, luego borrar oferta

---

### 3. Admin Cambia Requisitos de Oferta con Applications Existentes

**Escenario:**
```
1. Oferta requiere: CV, DNI
2. 10 usuarios postulan con CV y DNI
3. Admin agrega requisito: Certificado de Estudios
```

**Comportamiento:**
```
POST /admin/offers/A/required-documents
{ "documentTypeId": 3 }

→ 201 Created (se agrega RequiredDocument)

Applications existentes:
- NO se invalidan
- Quedan con 2 documentos (CV, DNI)
- NO se fuerza retroactivamente

Nuevas applications:
- DEBEN incluir los 3 documentos
```

**Validación en confirm:**
```
PATCH /offers/A/draft/confirm

Valida contra RequiredDocument ACTUAL (no histórico)
→ Si faltan docs: 400 Bad Request
```

**Consideración:**
- Admin debe cambiar requisitos solo en ofertas DRAFT
- Si oferta está ACTIVE: mostrar warning en UI
- Alternativa: versionado de RequiredDocument (futuro)

---

### 4. Dos Admins Editan la Misma Entidad Simultáneamente

**Escenario:**
```
T0: Admin A lee Offer X (updatedAt: 2025-11-10 10:00:00)
T1: Admin B lee Offer X (updatedAt: 2025-11-10 10:00:00)
T2: Admin A actualiza título
T3: Admin B actualiza descripción (sobrescribe cambio de A)
```

**Comportamiento actual: Last Write Wins**
```
Sin optimistic locking por defecto
→ Cambio de Admin A se pierde
```

**Solución MVP: NINGUNA**
- Aceptable para sistema pequeño (pocos admins)
- Conflictos son raros

**Solución futura (si se necesita):**
```
1. Agregar campo `version` a entidades críticas
2. Validar version en PATCH:

PATCH /admin/offers/X
{
  "version": 5,
  "title": "Nuevo título"
}

→ Si version != actual: 409 Conflict
{
  "type": "version-conflict",
  "title": "Resource Modified",
  "detail": "Resource was modified by another user"
}
```

---

### 5. Usuario Intenta Postularse a Oferta Expirada/Cerrada

**Escenario:**
```
Usuario en GET /offers/:id (oferta activa)
Mientras lee, oferta expira (job automático)
Usuario hace PATCH /offers/:id/draft
```

**Comportamiento:**
```
PATCH /offers/123/draft
→ 400 Bad Request
{
  "type": "offer-not-active",
  "title": "Offer Not Available",
  "detail": "Cannot apply to non-active offer",
  "offerStatus": "EXPIRED"
}
```

**Validación en endpoint:**
```typescript
if (offer.status !== 'ACTIVE') {
  throw new APIError(400, 'offer-not-active');
}
```

---

### 6. Usuario Borra Cuenta con Applications Activas

**Escenario:**
```
Usuario tiene:
- 3 Applications PENDING
- 5 Documents
- 1 Draft activo
```

**Comportamiento:**
```
DELETE /admin/users/:id

onDelete: Cascade →
- Documents: borrados (archivos físicos también)
- Applications: borradas
- Drafts: borrados
- Sessions: borradas
- Notifications: borradas
```

**Consideración:**
- ⚠️ Pérdida de datos de Applications para empresas
- ⚠️ Empresas pierden visibilidad de candidatos

**Mejor práctica:**
- Admin debe revisar applications del usuario antes de borrar
- Alternativa: soft delete de User
- UI: mostrar warning "Usuario tiene X applications activas"

**Solución futura:**
```
Anonimizar en vez de borrar:
- User.email = "deleted_user_123@system.local"
- User.firstName = "Usuario"
- User.lastName = "Eliminado"
- Applications se mantienen (anónimas)
```

---

## 📂 Gestión de Archivos

### 7. Documento en Uso → Usuario lo Borra

**Escenario:**
```
Document 123 está en:
- DraftDocument (offerId: 100)
- ApplicationDocument (applicationId: 50, status: PENDING)

Usuario hace DELETE /documents/123
```

**Comportamiento:**
```
DELETE /documents/123
→ 409 Conflict
{
  "type": "document-in-use",
  "title": "Document In Use",
  "detail": "Cannot delete document while in use",
  "usedIn": {
    "drafts": [100],
    "applications": [50]
  }
}
```

**Validación:**
```typescript
const inDrafts = await db.draftDocument.count({ where: { documentId: 123 } });
const inApps = await db.applicationDocument.count({ where: { documentId: 123 } });

if (inDrafts > 0 || inApps > 0) {
  throw new APIError(409, 'document-in-use');
}
```

---

### 8. Upload Falla a Mitad (Red, Timeout)

**Escenario:**
```
PUT /offers/100/draft/documents/1
Upload 5MB de 10MB → desconexión
```

**Comportamiento:**
```
Encore.ts timeout (30s por defecto)
→ 504 Gateway Timeout

Archivo parcial guardado en /tmp/upload_xyz
```

**Limpieza:**
```
Job de cleanup (diario):
- Buscar archivos en /tmp/upload_* más viejos de 24h
- Borrar archivos huérfanos
```

**Alternativa futura:**
```
Chunked upload (para archivos grandes):
1. POST /uploads/init → uploadId
2. PUT /uploads/:uploadId/chunk/1 (1MB)
3. PUT /uploads/:uploadId/chunk/2 (1MB)
4. POST /uploads/:uploadId/complete → crea Document
```

---

### 9. Dos Usuarios Suben el Mismo Archivo

**Escenario:**
```
Usuario A sube CV.pdf (hash: abc123)
Usuario B sube CV.pdf (mismo hash: abc123)
```

**Comportamiento actual:**
```
Se guardan 2 archivos separados:
- /uploads/users/123/cv_uuid1.pdf
- /uploads/users/456/cv_uuid2.pdf

2 registros Document distintos
```

**Ventajas:**
- Simple, sin complejidad
- Cada usuario "posee" su archivo

**Desventajas:**
- Duplicación de storage

**Solución futura (deduplicación):**
```
1. Calcular hash SHA256 del archivo
2. Buscar Document con mismo hash y userId
3. Si existe: reutilizar path
4. Si no: guardar nuevo archivo

model Document {
  fileHash String? // SHA256
  @@unique([userId, fileHash])
}
```

---

## 🔔 Notificaciones

### 10. Notificación Broadcast a 1000+ Usuarios

**Escenario:**
```
POST /admin/notifications/broadcast
{
  "title": "Mantenimiento",
  "message": "...",
  "userIds": [] // broadcast a todos los alumnos (role STUDENT)
}

1000 usuarios en BD
```

**Comportamiento:**
```
Loop síncrono:
for (userId in allUsers) {
  await db.notification.create({ userId, ... })
}

→ Tarda ~10 segundos
→ Admin espera respuesta
```

**Problema:**
- Timeout si son muchos usuarios
- Bloquea request

**Solución futura:**
```
Job queue (Bull, BullMQ):

POST /admin/notifications/broadcast
→ 202 Accepted
{
  "jobId": "job_xyz",
  "status": "queued"
}

Worker procesa en background:
→ Crea notifications en batches de 100
→ Admin puede consultar progreso: GET /admin/jobs/job_xyz
```

---

### 11. Usuario Tiene 500+ Notificaciones No Leídas

**Escenario:**
```
Usuario inactivo por 6 meses
Acumula notificaciones

GET /notifications
→ Debe paginar eficientemente
```

**Comportamiento:**
```
GET /notifications?limit=20

Query con índice:
WHERE userId = ? AND isRead = false
ORDER BY createdAt DESC
LIMIT 20

→ Performance OK (índice compuesto)
```

**Limpieza automática (futuro):**
```
Job semanal:
- Borrar notificaciones leídas > 3 meses
- Borrar notificaciones no leídas > 6 meses
```

---

## 🔐 Seguridad y Autenticación

### 12. Session Expira Mientras Usuario Usa el Sistema

**Escenario:**
```
Usuario logueado, session expira en 1 min
Usuario hace PATCH /offers/100/draft (tarda 2 min en completar form)
Submit → session expirada
```

**Comportamiento:**
```
PATCH /offers/100/draft
→ 401 Unauthorized
{
  "type": "session-expired",
  "title": "Session Expired",
  "detail": "Please log in again"
}
```

**UX en frontend:**
- Detectar 401
- Guardar datos en localStorage (draft recovery)
- Redirigir a /login
- Tras login: restaurar draft

**Solución futura:**
```
Sliding sessions:
- Cada request exitoso extiende session +24h
- Usuario activo nunca expira

O refresh token:
- Session corta (1h)
- Refresh token largo (7 días)
- Frontend renueva automáticamente
```

---

### 13. Usuario Intenta Acceder a Recurso de Otro Usuario

**Escenario:**
```
Usuario 123 intenta:
GET /documents/456 (documento del usuario 789)
```

**Comportamiento:**
```
→ 403 Forbidden
{
  "type": "forbidden",
  "title": "Access Denied",
  "detail": "You don't have permission to access this resource"
}
```

**Validación en endpoint:**
```typescript
const document = await db.document.findUnique({ where: { id: 456 } });

if (document.userId !== currentUser.id) {
  throw new APIError(403, 'forbidden');
}
```

**Seguridad:**
- NUNCA retornar 404 para recursos de otros (info leak)
- Siempre 403 si existe pero no tiene permiso

---

### 14. Brute Force en Login

**Escenario:**
```
Atacante intenta:
POST /auth/login (password1) → 401
POST /auth/login (password2) → 401
POST /auth/login (password3) → 401
... x 100
```

**Comportamiento:**
```
Rate limit: 5 intentos/min por IP

Intento 6:
→ 429 Too Many Requests
{
  "type": "rate-limit",
  "title": "Too Many Requests",
  "detail": "Too many login attempts. Try again in 60 seconds",
  "retryAfter": 60
}
```

**Protección adicional (futuro):**
```
1. Account lockout tras N intentos fallidos
   - User.failedLoginAttempts++
   - Si >= 10: User.lockedUntil = now() + 30min

2. CAPTCHA tras 3 intentos

3. Email notification de intento sospechoso
```

---

## 📊 Performance y Escalabilidad

### 15. Query con Miles de Resultados

**Escenario:**
```
GET /admin/applications?filter=status eq 'PENDING'
→ 5000 applications pendientes
```

**Comportamiento:**
```
Cursor pagination limita a 20 por request
→ 200 OK (20 resultados)
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "hasNext": true,
    "next": "cursor_abc123"
  }
}

Query:
SELECT * FROM Application
WHERE status = 'PENDING'
ORDER BY appliedAt DESC
LIMIT 20

→ Performance OK con índice
```

**Sin paginación (error):**
```
Si se intenta limit=10000:
→ 400 Bad Request
{
  "type": "invalid-limit",
  "detail": "Limit must be between 1 and 100"
}
```

---

### 16. Carga de 100 Usuarios Simultáneos

**Escenario:**
```
100 usuarios hacen GET /offers al mismo tiempo
```

**Comportamiento:**
```
PostgreSQL:
- Connection pool (default: 10 connections)
- Queries simples sin joins complejos
- Índices en campos filtrados

Encore.ts:
- Stateless (puede escalar horizontalmente)
- Cache de resultados (futuro)

→ Respuesta < 200ms
```

**Bottleneck potencial:**
```
Si load aumenta a 1000+ req/s:
1. CDN para archivos estáticos
2. Redis cache para queries frecuentes:
   - GET /offers (lista activas)
   - GET /companies
   - GET /skills
3. Read replicas de PostgreSQL
```

---

### 17. Job de Cleanup con Miles de Documentos

**Escenario:**
```
scheduledForDeletion marcó 1000 documents
Job de cleanup corre:

for (doc of 1000 docs) {
  await fs.unlink(doc.path)
  await db.document.delete({ where: { id: doc.id } })
}

→ Tarda 20 minutos
```

**Problema:**
- Job muy largo
- Bloquea siguiente ejecución

**Solución:**
```
Batch processing:

const BATCH_SIZE = 100;
const docsToDelete = await db.document.findMany({
  where: { scheduledForDeletion: { lte: new Date() } },
  take: BATCH_SIZE
});

for (const doc of docsToDelete) {
  await fs.unlink(doc.path).catch(err => log.error(err));
}

await db.document.deleteMany({
  where: { id: { in: docsToDelete.map(d => d.id) } }
});

→ Procesa 100 por ejecución
→ Si hay más: próxima ejecución continúa
```

---

## 🔄 Concurrencia

### 18. Usuario Crea Draft → Confirma → Crea Otro Draft Rápidamente

**Escenario:**
```
T0: PATCH /offers/100/draft (crea draft)
T1: PATCH /offers/100/draft/confirm (crea application, borra draft)
T2: PATCH /offers/100/draft (intenta crear draft otra vez)
```

**Comportamiento:**
```
T2 → 409 Conflict
{
  "type": "application-exists",
  "title": "Application Already Exists",
  "detail": "You already applied to this offer",
  "applicationId": 500
}
```

**Validación:**
```typescript
const existingApp = await db.application.findUnique({
  where: { userId_offerId: { userId: 123, offerId: 100 } }
});

if (existingApp) {
  throw new APIError(409, 'application-exists');
}
```

**Constraint en BD:**
```prisma
model Application {
  @@unique([userId, offerId])
}
```

---

### 19. Admin Acepta y Rechaza Application Simultáneamente

**Escenario:**
```
Admin A: PATCH /admin/applications/500/status { status: 'ACCEPTED' }
Admin B: PATCH /admin/applications/500/status { status: 'REJECTED' }

Ambos simultáneos
```

**Comportamiento actual:**
```
Last write wins
→ Uno sobrescribe al otro
```

**Problema:**
- Estado inconsistente
- Notificaciones duplicadas

**Solución (futuro):**
```
1. Validar transición de estados:
   PENDING → ACCEPTED ✅
   PENDING → REJECTED ✅
   ACCEPTED → REJECTED ❌ (409 Conflict)
   REJECTED → ACCEPTED ❌ (409 Conflict)

2. Optimistic locking (version field)
```

---

## 🎯 Decisiones de Negocio Pendientes

### 20. Usuario Cancela Application Aceptada

**Escenario:**
```
Application status: ACCEPTED
Usuario hace DELETE /my-applications/500
```

**Comportamiento actual:**
```
→ 409 Conflict (solo PENDING se puede cancelar)
```

**Pregunta de negocio:**
- ¿Usuario puede cancelar aceptada? (ej: encontró otra pasantía)
- ¿Admin debe aprobar la cancelación?
- ¿Se penaliza al usuario?

**Opciones:**
```
A) No permitir (actual)
B) Permitir con confirmación
C) Requiere aprobación de admin
```

---

### 21. Oferta Sin Fecha de Expiración

**Escenario:**
```
Admin crea oferta sin expiresAt
```

**Comportamiento actual:**
```
expiresAt = null
→ Oferta nunca expira (válido)

Job de expiración:
WHERE status = 'ACTIVE' AND expiresAt < now()
→ No afecta a ofertas sin expiresAt
```

**Pregunta:**
- ¿Es válido tener ofertas sin expiración?
- ¿O debe ser obligatorio?

---

### 22. Usuario Postula 10+ Veces

**Escenario:**
```
Usuario postula a 20 ofertas diferentes
```

**Comportamiento actual:**
```
Sin límite
→ Permitido
```

**Pregunta:**
- ¿Debe haber límite de postulaciones activas?
- ¿O total por período (ej: max 5 por mes)?

**Riesgo:**
- Usuario spam (postula sin leer)
- Carga administrativa para empresas

**Posible solución:**
```
Validar en confirm:
const activeApps = await db.application.count({
  where: {
    userId: 123,
    status: { in: ['PENDING', 'REVIEWING'] }
  }
});

if (activeApps >= 10) {
  throw new APIError(429, 'too-many-active-applications');
}
```

---

## ✅ Resumen de Prioridades

### 🔴 Crítico (implementar en MVP)
- [x] Validar status de oferta antes de postular
- [x] Validar documento en uso antes de borrar
- [x] Rate limiting en login
- [x] Autorización (403 vs 404)
- [x] Unique constraint en Application

### 🟡 Importante (considerar pronto)
- [ ] Sliding sessions (evitar expiración abrupta)
- [ ] Warning al admin antes de borrar oferta/usuario con relaciones
- [ ] Batch processing en jobs pesados
- [ ] Validar transiciones de estado en Application

### 🟢 Futuro (post-MVP)
- [ ] Optimistic locking (version fields)
- [ ] Chunked uploads para archivos grandes
- [ ] Deduplicación de archivos
- [ ] Job queue para notifications broadcast
- [ ] Account lockout tras intentos fallidos
- [ ] Anonimización en vez de borrado de usuarios

