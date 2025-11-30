# Actualizaciones v2 - Sistema de Pasantías

## 🆕 Cambios Importantes

Esta versión incorpora:
- ✅ WebSockets para actualizaciones en tiempo real
- ✅ Campos custom dinámicos por oferta
- ✅ Sessions según OWASP guidelines
- ✅ Manejo de cambios en requisitos de ofertas
- ✅ Política de retención de notificaciones
- ✅ Borrado diferido de usuarios
- ✅ Integración con sistema universitario

---

## 🔌 WebSockets y Tiempo Real

### Implementación con Encore.ts PubSub

**Casos de uso:**

#### 1. Notificaciones en tiempo real
```typescript
// Publicar notificación
await pubsub.publish('user:123:notifications', {
  type: 'APPLICATION_ACCEPTED',
  notificationId: 1000,
  data: { applicationId: 500 }
});

// Frontend escucha
subscription.on('user:123:notifications', (msg) => {
  showToast(msg);
  refreshNotificationBadge();
});
```

#### 2. Estado de ofertas (crítico para UX)
```typescript
// Cuando oferta se borra/cierra/expira
await pubsub.publish('offer:100:status', {
  status: 'CLOSED',
  reason: 'deleted',
  timestamp: now()
});

// Usuario editando draft de esa oferta
subscription.on('offer:100:status', (msg) => {
  showModal({
    title: 'Oferta no disponible',
    message: 'Esta oferta ya no está activa',
    action: () => router.push('/offers')
  });
});
```

#### 3. Cambios en requisitos de ofertas
```typescript
// Admin modifica requisitos
await pubsub.publish('offer:100:requirements', {
  action: 'added',
  documentTypes: [{ id: 5, name: 'Certificado de Estudios' }]
});

// Usuario con application PENDING
subscription.on('offer:100:requirements', async (msg) => {
  if (msg.action === 'added') {
    // Backend ya bloqueó la application
    await checkApplicationStatus(applicationId);
    // Si BLOCKED: mostrar banner "Documentos adicionales requeridos"
  }
});
```

#### 4. Ediciones simultáneas (admin)
```typescript
// Admin A edita oferta
await pubsub.publish('offer:100:editing', {
  userId: 456,
  userName: 'Admin A',
  fields: ['title'],
  timestamp: now()
});

// Admin B ve banner en UI
subscription.on('offer:100:editing', (msg) => {
  if (msg.userId !== currentUser.id) {
    showBanner(`${msg.userName} está editando esta oferta. Recarga para ver cambios.`);
  }
});
```

### Topics Recomendados

```
user:{userId}:notifications          // Notificaciones personales
offer:{offerId}:status               // Estado de oferta
offer:{offerId}:requirements         // Requisitos modificados
offer:{offerId}:editing              // Ediciones simultáneas
application:{applicationId}:status   // Estado de application
system:announcements                 // Broadcast general
```

### Polling como fallback

```typescript
// Si WebSocket falla, polling cada 10s
setInterval(async () => {
  const unreadCount = await fetch('/api/v1/notifications?unreadOnly=true');
  updateBadge(unreadCount);
}, 10000);
```

---

## 📝 Campos Custom Dinámicos

### Schema

```prisma
model CustomField {
  id              Int              @id @default(autoincrement())
  offerId         Int
  fieldType       CustomFieldType
  label           String           @db.VarChar(200)
  description     String?          @db.Text
  placeholder     String?          @db.VarChar(200)
  isRequired      Boolean          @default(false)
  
  // Para validaciones
  validationRules Json?            // { "maxLength": 100, "pattern": "^\\d{11}$", "options": [...] }
  
  order           Int              @default(0)
  createdAt       DateTime         @default(now())
  
  offer           Offer            @relation(fields: [offerId], references: [id], onDelete: Cascade)
  responses       CustomFieldResponse[]
  draftResponses  DraftCustomFieldResponse[]
  
  @@index([offerId, order])
}

enum CustomFieldType {
  TEXT          // Input corto (ej: CUIL)
  TEXTAREA      // Input largo (ej: motivación)
  EMAIL         // Validación de email
  PHONE         // Validación de teléfono
  DATE          // Date picker
  NUMBER        // Input numérico
  SELECT        // Dropdown (opciones en validationRules.options)
  CHECKBOX      // Sí/No
  FILE          // Documento adicional
}

// Respuestas confirmadas (en Application)
model CustomFieldResponse {
  id              Int         @id @default(autoincrement())
  applicationId   Int
  customFieldId   Int
  value           String      @db.Text      // JSON para valores complejos
  fileDocumentId  Int?                      // Si fieldType = FILE
  
  application     Application  @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  customField     CustomField  @relation(fields: [customFieldId], references: [id])
  fileDocument    Document?    @relation("CustomFieldDocument", fields: [fileDocumentId], references: [id])
  
  @@unique([applicationId, customFieldId])
  @@index([applicationId])
}

// Respuestas temporales (en Draft)
model DraftCustomFieldResponse {
  id              Int                @id @default(autoincrement())
  userId          Int
  offerId         Int
  customFieldId   Int
  value           String             @db.Text
  fileDocumentId  Int?
  
  draft           ApplicationDraft   @relation(fields: [userId, offerId], references: [userId, offerId], onDelete: Cascade)
  customField     CustomField        @relation(fields: [customFieldId], references: [id])
  fileDocument    Document?          @relation("DraftCustomFieldDocument", fields: [fileDocumentId], references: [id])
  
  @@unique([userId, offerId, customFieldId])
  @@index([userId, offerId])
}

// Actualizar ApplicationDraft
model ApplicationDraft {
  // ... campos existentes
  customFieldResponses DraftCustomFieldResponse[]
}

// Actualizar Application
model Application {
  // ... campos existentes
  customFieldResponses CustomFieldResponse[]
}

// Actualizar Document para soportar custom fields
model Document {
  // ... campos existentes
  customFieldResponses      CustomFieldResponse[]  @relation("CustomFieldDocument")
  draftCustomFieldResponses DraftCustomFieldResponse[] @relation("DraftCustomFieldDocument")
}
```

### Ejemplo Real: Oferta VITOLEN

**Admin crea oferta:**
```json
POST /admin/offers
{
  "companyId": 20,
  "title": "Pasantía VITOLEN S.A.",
  "description": "Documentar módulos de ERP...",
  "requiredDocuments": [1, 2, 3],  // CV, Carta Presentación, Certificado
  "customFields": [
    {
      "fieldType": "TEXT",
      "label": "CUIL",
      "description": "11 dígitos sin guiones",
      "placeholder": "20123456789",
      "isRequired": true,
      "validationRules": {
        "pattern": "^\\d{11}$",
        "maxLength": 11
      },
      "order": 1
    },
    {
      "fieldType": "TEXT",
      "label": "Domicilio actual",
      "isRequired": true,
      "order": 2
    },
    {
      "fieldType": "TEXT",
      "label": "Localidad y Provincia",
      "placeholder": "Rafaela, Santa Fe",
      "isRequired": true,
      "order": 3
    },
    {
      "fieldType": "PHONE",
      "label": "Teléfono de contacto",
      "placeholder": "+54 341 1234567",
      "isRequired": true,
      "validationRules": {
        "pattern": "^\\+?\\d{10,15}$"
      },
      "order": 4
    },
    {
      "fieldType": "TEXTAREA",
      "label": "¿Por qué te interesa esta pasantía?",
      "description": "Opcional - Cuéntanos tu motivación",
      "isRequired": false,
      "validationRules": {
        "maxLength": 500
      },
      "order": 5
    }
  ]
}
```

**Usuario completa en draft:**
```json
PATCH /offers/100/draft/custom-fields
{
  "responses": [
    { "customFieldId": 501, "value": "20123456789" },
    { "customFieldId": 502, "value": "Bv. Roca 1234" },
    { "customFieldId": 503, "value": "Rafaela, Santa Fe" },
    { "customFieldId": 504, "value": "+54 341 9876543" },
    { "customFieldId": 505, "value": "Me interesa porque..." }
  ]
}
```

**Validación al confirmar:**
```typescript
PATCH /offers/100/draft/confirm

Validaciones:
1. Todos los requiredDocuments subidos ✓
2. Todos los customFields required completados ✓
3. Validar patterns y rules de cada campo ✓
4. Si fieldType=FILE: verificar que fileDocumentId existe ✓

→ Copia DraftCustomFieldResponse → CustomFieldResponse
→ Crea Application
```

### Endpoints Nuevos

```
Admin - Gestión de campos custom:
GET    /admin/offers/:id/custom-fields
POST   /admin/offers/:id/custom-fields
PATCH  /admin/offers/:id/custom-fields/:fieldId
DELETE /admin/offers/:id/custom-fields/:fieldId

Usuario - Ver campos:
GET    /offers/:id/custom-fields

Usuario - Completar en draft:
GET    /offers/:id/draft/custom-fields
PATCH  /offers/:id/draft/custom-fields

Admin - Ver respuestas:
GET    /admin/applications/:id/custom-fields
```

**Total endpoints: 67 + 8 = 75**

---

## 🔐 Sessions según OWASP

### Schema Actualizado

```prisma
model Session {
  id             String   @id @default(cuid())
  userId         Int
  createdAt      DateTime @default(now())
  lastActivityAt DateTime @default(now())  // Para sliding window
  expiresAt      DateTime
  ipAddress      String?  @db.VarChar(45)   // IPv6 compatible
  userAgent      String?  @db.Text
  
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
  @@index([lastActivityAt])
}
```

### Política de Expiración

**Idle Timeout:** 30 minutos sin actividad
**Absolute Timeout:** 12 horas desde creación

```typescript
// Middleware en cada request autenticado
async function validateSession(sessionId: string) {
  const session = await db.session.findUnique({ where: { id: sessionId } });
  
  if (!session) {
    throw new SessionNotFound();
  }
  
  const now = new Date();
  const idleLimit = new Date(Date.now() - 30 * 60 * 1000);      // 30 min
  const absoluteLimit = new Date(session.createdAt.getTime() + 12 * 60 * 60 * 1000); // 12h
  
  // Expirada por inactividad
  if (session.lastActivityAt < idleLimit) {
    await db.session.delete({ where: { id: sessionId } });
    throw new SessionExpired('idle');
  }
  
  // Expirada por tiempo absoluto
  if (now > absoluteLimit) {
    await db.session.delete({ where: { id: sessionId } });
    throw new SessionExpired('absolute');
  }
  
  // Renovar si quedan menos de 15 min de idle
  const renewThreshold = new Date(Date.now() - 15 * 60 * 1000);
  if (session.lastActivityAt < renewThreshold) {
    await db.session.update({
      where: { id: sessionId },
      data: { lastActivityAt: now }
    });
  }
  
  return session;
}
```

### Cookie Settings

```typescript
res.cookie('sessionId', session.id, {
  httpOnly: true,        // No acceso desde JavaScript
  secure: true,          // Solo HTTPS
  sameSite: 'strict',    // CSRF protection
  maxAge: 12 * 60 * 60 * 1000,  // 12 horas
  path: '/'
});
```

### Job de Limpieza

```typescript
// Diario a las 02:00
async function cleanupExpiredSessions() {
  const idleLimit = new Date(Date.now() - 30 * 60 * 1000);
  
  await db.session.deleteMany({
    where: {
      OR: [
        { lastActivityAt: { lt: idleLimit } },
        { expiresAt: { lt: new Date() } }
      ]
    }
  });
}
```

---

## 🔄 Cambios en Requisitos de Ofertas

### Escenario 1: Admin Agrega Requisitos

```
Estado inicial:
- Oferta requiere: CV, DNI
- Usuario A tiene Application PENDING con CV, DNI

Admin agrega:
- Certificado de Estudios

Comportamiento:
1. Application.status = BLOCKED
2. Crear ApplicationDraft desde Application
3. Copiar ApplicationDocument → DraftDocument
4. Notificar usuario
5. Publicar WebSocket: offer:100:requirements
```

**Endpoint:**
```
POST /admin/offers/:id/required-documents
{ "documentTypeId": 3 }

Side effects:
→ Applications PENDING/REVIEWING → BLOCKED
→ Crear drafts con documentos existentes
→ Notificar usuarios afectados
→ WebSocket broadcast
```

**Usuario completa:**
```
GET /my-applications
→ Ve Application con status: BLOCKED

GET /my-applications/:id
{
  "status": "BLOCKED",
  "blockReason": "MISSING_DOCUMENTS",
  "missingDocuments": [
    { "id": 3, "name": "Certificado de Estudios" }
  ],
  "links": [
    { "rel": "complete-application", "href": "/offers/100/draft", "method": "GET" }
  ]
}

GET /offers/100/draft
→ Ve draft con CV y DNI ya cargados
→ Sube Certificado

PATCH /offers/100/draft/confirm
→ Application.status = PENDING (desbloquea)
→ Borra draft
```

### Escenario 2: Admin Quita Requisitos

```
Estado:
- Oferta requiere: CV, DNI, Certificado
- Usuario A tiene Application PENDING con 3 documentos

Admin quita:
- Certificado de Estudios

Comportamiento:
1. DELETE RequiredDocument(offerId, documentTypeId=3)
2. Applications NO se bloquean (tienen documentos de más)
3. Borrar ApplicationDocument(*, documentTypeId=3)
4. Marcar Documents sin referencias para borrado
5. NO notificar usuarios (no afecta su flujo)
```

**NO se requiere acción del usuario.**

### Schema para tracking

```prisma
model Application {
  // ... campos existentes
  blockReason     String?  // 'MISSING_DOCUMENTS', 'OFFER_CHANGED', etc
  blockedAt       DateTime?
  unblockedAt     DateTime?
}
```

---

## 💬 Política de Retención de Notificaciones

### Reglas

```
Notificaciones NO leídas:
- Mantener: 6 meses
- Luego: DELETE

Notificaciones leídas:
- Mantener: 1 mes
- Luego: DELETE

Usuario puede borrar manualmente en cualquier momento
```

### Job de Limpieza

```typescript
// Semanal, domingos 03:00
async function cleanupOldNotifications() {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  
  // Borrar leídas > 1 mes
  await db.notification.deleteMany({
    where: {
      isRead: true,
      readAt: { lt: oneMonthAgo }
    }
  });
  
  // Borrar no leídas > 6 meses
  await db.notification.deleteMany({
    where: {
      isRead: false,
      createdAt: { lt: sixMonthsAgo }
    }
  });
}
```

### Endpoint de borrado manual

```
DELETE /notifications/:id
→ Usuario puede borrar cualquier notificación propia
→ Response: 204 No Content
```

---

## 👤 Borrado Diferido de Usuarios

### Estrategia

```
Usuario tiene Applications activas (PENDING/REVIEWING/BLOCKED):
→ Soft delete con anonimización
→ Applications se mantienen para empresas

Usuario SIN applications activas:
→ Hard delete inmediato
```

### Schema

```prisma
model User {
  // ... campos existentes
  deletedAt       DateTime?
  anonymizedAt    DateTime?
}
```

### Comportamiento

```typescript
DELETE /admin/users/:id

const activeApps = await db.application.count({
  where: {
    userId: id,
    status: { in: ['PENDING', 'REVIEWING', 'BLOCKED'] }
  }
});

if (activeApps > 0) {
  // Soft delete + anonimizar
  await db.user.update({
    where: { id },
    data: {
      email: `deleted_user_${id}@system.local`,
      firstName: 'Usuario',
      lastName: 'Eliminado',
      bio: null,
      phone: null,
      deletedAt: new Date(),
      anonymizedAt: new Date()
    }
  });
  
  // Marcar documentos para borrado
  await db.document.updateMany({
    where: { userId: id },
    data: { scheduledForDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  });
  
  // Borrar sesiones
  await db.session.deleteMany({ where: { userId: id } });
  
} else {
  // Hard delete en cascada
  // Borrar archivos físicos primero
  const docs = await db.document.findMany({ where: { userId: id } });
  for (const doc of docs) {
    await fs.unlink(doc.path).catch(() => {});
  }
  
  await db.user.delete({ where: { id } });
}
```

### Job de Purga

```typescript
// Mensual: borrar usuarios soft-deleted sin applications activas tras 90 días
async function purgeDeletedUsers() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  const users = await db.user.findMany({
    where: {
      deletedAt: { lt: ninetyDaysAgo },
      applications: {
        none: {
          status: { in: ['PENDING', 'REVIEWING', 'BLOCKED'] }
        }
      }
    }
  });
  
  for (const user of users) {
    // Borrar archivos
    const docs = await db.document.findMany({ where: { userId: user.id } });
    for (const doc of docs) {
      await fs.unlink(doc.path).catch(() => {});
    }
    
    // Hard delete
    await db.user.delete({ where: { id: user.id } });
  }
}
```

---

## 🎓 Integración con Sistema Universitario

### Certificado de Alumno Regular

**Opción A: API Integration (ideal)**

```typescript
POST /documents/fetch-from-university
{
  "documentTypeId": 3,      // Certificado Alumno Regular
  "studentLegajo": "12345"
}

Flujo:
1. Validar que usuario es dueño del legajo
2. Llamar API SIU Guaraní:
   GET /siu-guarani/api/students/:legajo/certificate?type=regular
   
3. Descargar PDF
4. Guardar en filesystem
5. Crear Document con source=UNIVERSITY_API
6. Asociar a Draft si corresponde

Response:
{
  "data": {
    "documentId": 789,
    "source": "UNIVERSITY_API",
    "verifiedAt": "2025-11-10T10:00:00Z",
    "externalId": "CERT-12345-2025"
  }
}
```

**Schema update:**

```prisma
model Document {
  // ... campos existentes
  source          DocumentSource   @default(USER_UPLOAD)
  externalId      String?          // ID en sistema externo
  verifiedAt      DateTime?
  verifiedBy      Int?
  
  verifier        User?            @relation("DocumentVerifier", fields: [verifiedBy], references: [id])
}

enum DocumentSource {
  USER_UPLOAD
  UNIVERSITY_API
  ADMIN_UPLOAD
}
```

**Opción B: Manual Upload (fallback)**
```
Si API no disponible:
→ Usuario sube PDF manualmente
→ Admin puede verificar contra SIU Guaraní
→ Marca como verificado
```

### Endpoint de Verificación Manual

```
PATCH /admin/documents/:id/verify
{
  "externalId": "CERT-12345-2025",
  "notes": "Verificado contra SIU Guaraní"
}

→ Document.verifiedAt = now()
→ Document.verifiedBy = adminId
```

---

## 🔒 Seguridad: 403 vs 404

### Regla: SIEMPRE 403 para recursos privados

**Razón:** Evitar information disclosure

```typescript
// ❌ MAL
GET /documents/123 (no es tuyo)
→ 404 Not Found
// Atacante sabe que el documento no existe

// ✅ BIEN
GET /documents/123 (no es tuyo)
→ 403 Forbidden
// Atacante NO sabe si existe o no

// ✅ BIEN
GET /documents/999 (no existe)
→ 403 Forbidden
// Mismo mensaje, no distinguible
```

**Implementación:**

```typescript
async function getDocument(id: number, userId: number) {
  const doc = await db.document.findUnique({ where: { id } });
  
  // No existe O no es del usuario → mismo error
  if (!doc || doc.userId !== userId) {
    throw new APIError(403, 'forbidden', 'Access denied');
  }
  
  return doc;
}
```

**Excepción: Recursos públicos**
```typescript
GET /offers/999 (no existe)
→ 404 Not Found  // OK, es público
```

---

## 📊 Resumen de Cambios en Schema

### Nuevas Tablas (3)
```
CustomField
CustomFieldResponse
DraftCustomFieldResponse
```

### Enums Nuevos (2)
```
CustomFieldType
DocumentSource
```

### Enums Actualizados (1)
```
ApplicationStatus → agregado BLOCKED
```

### Campos Nuevos

**Session:**
- lastActivityAt
- ipAddress
- userAgent

**Application:**
- blockReason
- blockedAt
- unblockedAt

**Document:**
- source
- externalId
- verifiedAt
- verifiedBy

**User:**
- deletedAt (ya existía en spec)
- anonymizedAt

---

## 🔧 Jobs Actualizados

| Job | Frecuencia | Función |
|-----|-----------|----------|
| Expirar ofertas | Cada hora | status=EXPIRED si expiresAt < now() |
| Limpiar drafts | Diario 03:00 | Borra drafts con updatedAt > 30 días |
| Limpiar documentos | Diario 04:00 | Borra archivos scheduledForDeletion < now() |
| Limpiar sessions | Diario 02:00 | Borra sessions expiradas (idle + absolute) |
| Limpiar notificaciones | Semanal Dom 03:00 | Borra según política de retención |
| Purgar usuarios | Mensual día 1 05:00 | Borra usuarios soft-deleted tras 90 días |

---

## 📋 API Endpoints - Nuevos

### Custom Fields (8 nuevos)
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

### Certificados Universitarios (1 nuevo)
```
POST   /documents/fetch-from-university
```

### Verificación de Documentos (1 nuevo)
```
PATCH  /admin/documents/:id/verify
```

**Total endpoints: 67 + 10 = 77**

---

## ✅ Decisiones Finalizadas

1. ✅ **WebSockets**: Sí, para notificaciones + estado de ofertas + ediciones simultáneas
2. ✅ **Campos custom**: Schema dinámico con CustomField + validaciones JSON
3. ✅ **Sessions OWASP**: 30min idle, 12h absolute, sliding renewal
4. ✅ **Cambio requisitos**: BLOCKED status + copiar a Draft si agregan requisitos
5. ✅ **Cambio requisitos**: Silencioso si quitan requisitos (borrar referencias)
6. ✅ **403 vs 404**: Siempre 403 para recursos privados ajenos
7. ✅ **Notificaciones**: 1 mes (leídas) / 6 meses (no leídas), borrado manual permitido
8. ✅ **Borrar usuario**: Soft delete + anonimización si tiene applications activas
9. ✅ **Certificados**: API integración + fallback manual
10. ✅ **ApplicationStatus**: BLOCKED (sin sufijo largo)

---

## 🎯 Siguiente en el Pipeline

### Implementación Prioritaria
1. Schema completo con todas las tablas
2. Endpoints core (auth, offers, applications)
3. WebSocket setup básico
4. Custom fields (UI + validaciones)
5. Sessions con renovación

### Testing Crítico
1. WebSocket bajo carga (100 usuarios concurrentes)
2. Validaciones de campos custom
3. Bloqueo/desbloqueo de applications
4. Session renewal y expiración
5. Borrado en cascada vs diferido

### Optimizaciones Futuras
- Cache de ofertas activas (Redis)
- CDN para archivos
- Rate limiting distribuido
- Full-text search en ofertas
- Analytics de uso

