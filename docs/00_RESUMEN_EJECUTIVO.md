# Resumen Ejecutivo - Sistema de Pasantías

## 🎯 Descripción del Proyecto

Sistema web para gestionar pasantías universitarias. Estudiantes postulan a ofertas subiendo documentos, administradores gestionan empresas, ofertas y postulaciones.

**Stack Tecnológico:**
- Frontend: React
- Backend: Encore.ts
- Base de datos: PostgreSQL (Prisma ORM)
- Autenticación: Session cookies

---

## 📊 Números Clave

| Métrica | Valor |
|---------|-------|
| **Endpoints API** | 77 |
| **Tablas principales** | 17 (User, UserCourse, Course, Skill, ProfileSkill, Company, Offer, OfferSkill, RequiredDocument, DocumentType, Document, ApplicationDraft, DraftDocument, Application, ApplicationDocument, Session, Notification) |
| **Páginas frontend** | ~21 vistas principales |
| **Roles de usuario** | 2 (STUDENT, ADMIN) |
| **File upload max** | 10MB |
| **Formats permitidos** | PDF, DOC, DOCX, JPG, PNG |
| **Paginación default** | 20 items |
| **Paginación max** | 100 items |
| **Session idle timeout** | 30 minutos |
| **Session absolute timeout** | 12 horas |
| **Campos encriptados** | 6 (email, firstName, lastName, dni, phone, domicilio) |

---

## 🏗️ Arquitectura de Datos

### Entidades Principales

```
USER
├── Profile (integrado)
├── Documents (1:N)
├── Applications (1:N)
├── ApplicationDrafts (1:N)
├── Sessions (1:N)
└── Notifications (1:N)

COMPANY
└── Offers (1:N)

OFFER
├── RequiredDocuments (N:N with DocumentType)
├── Skills (N:N)
├── Applications (1:N)
└── ApplicationDrafts (1:N)

DOCUMENT
├── DraftDocuments (N:N with ApplicationDraft)
└── ApplicationDocuments (N:N with Application)
```

### Características del Schema

**Claves Compuestas:**
- RequiredDocument: `[offerId, documentTypeId]`
- ApplicationDraft: `[userId, offerId]`
- DraftDocument: `[userId, offerId, documentId]`
- ApplicationDocument: `[applicationId, documentId]`

**OnDelete Behaviors:**
- User → Document/Application: CASCADE
- DocumentType → Document: RESTRICT
- Skill → ProfileSkill: CASCADE
- Course → User: SET NULL

**Soft Delete:**
- Company: sí (`deletedAt`)
- Offer: sí (`deletedAt`)
- Application: NO (mantener todo)
- Document: NO (borrado físico tras 30 días sin referencias)

---

## 🔄 Flujos Principales

### 1. Postulación a Oferta

```
1. GET /offers (explorar)
2. GET /offers/:id (ver detalle)
3. PATCH /offers/:id/draft (crear borrador)
4. POST /documents (subir archivo) 
   + PUT /offers/:id/draft/documents/:reqDocId (asociar)
   O POST /offers/:id/draft/documents/use-existing (reutilizar)
5. PATCH /offers/:id/draft/confirm (confirmar)
   → Crea Application
   → Borra Draft
   → Notifica estudiante
```

### 2. Reutilización de Documentos

```
Document (id=1, CV.pdf)
├── ApplicationDocument (app A, doc 1) ✓ Postulación A
└── ApplicationDocument (app B, doc 1) ✓ Postulación B (reutiliza)

Cuando ambas finalizan:
├── Borrar ApplicationDocument (app A)
├── Borrar ApplicationDocument (app B)
├── scheduledForDeletion = now() + 30 días
└── Job cleanup borra archivo tras 30 días
```

### 3. Gestión Admin de Postulaciones

```
1. GET /admin/applications (ver postulantes)
2. GET /admin/applications/:id (detalle)
3. PATCH /admin/applications/:id/status
   { status: 'ACCEPTED', feedback: '...', startDate: '...' }
   → Actualiza Application
   → Borra ApplicationDocument (referencias)
   → Marca Documents sin uso
   → Notifica estudiante
```

---

## 🔔 Sistema de Notificaciones

### Tipos Automáticos

| Trigger | Tipo | Destinatario |
|---------|------|--------------|
| Usuario confirma postulación | APPLICATION_SUBMITTED | Admin (futuro) |
| Admin acepta | APPLICATION_ACCEPTED | Estudiante |
| Admin rechaza | APPLICATION_REJECTED | Estudiante |
| Admin publica oferta | OFFER_PUBLISHED | Matching students (futuro) |
| Oferta cierra en 3 días | OFFER_CLOSING_SOON | Estudiantes con applications |

### Manual
- `POST /admin/notifications/broadcast`
- Tipo: ADMIN_ANNOUNCEMENT
- Permite: envío individual o broadcast a todos

---

## 🔐 Seguridad

### Autenticación
- Session cookie (httpOnly, secure, sameSite)
- Tabla Session en BD
- Expiración: **Pendiente definir** (¿24h? ¿7 días?)

### Rate Limiting

| Endpoint | Límite |
|----------|--------|
| POST /auth/login | 5/min por IP |
| POST /auth/register | 3/hour por IP |
| POST /documents | 10/hour por user |
| PATCH /draft/confirm | 1/10sec por user |
| GET endpoints | 100/min por user |
| Admin endpoints | 500/min |

### Validaciones
- Email: formato válido, max 255 chars
- Password: min 8 chars, mayúscula + número
- File size: max 10MB
- File types: whitelist de extensiones
- Nombres sanitizados

---

## 🗄️ Ciclos de Vida

### Documents
```
Upload → lastUsedAt actualizado en cada uso
      → Sin referencias tras Application finaliza
      → scheduledForDeletion = +30 días
      → Job borra archivo físico
```

### Applications
```
DRAFT → PENDING → REVIEWING → ACCEPTED/REJECTED
                           └→ finalizedAt
                           └→ Borrar ApplicationDocument
                           └→ Notificar usuario
```

### Offers
```
DRAFT → ACTIVE → EXPIRED (job automático si expiresAt < now())
              └→ CLOSED (admin manual)
```

### ApplicationDrafts
```
Creado → Editado → Confirmado (→ borrado)
                └→ Abandonado > 30 días (→ job borra)
```

---

## 🔧 Jobs Automatizados

| Job | Frecuencia | Función |
|-----|-----------|----------|
| Expirar ofertas | Cada hora | status=EXPIRED si expiresAt < now() |
| Limpiar drafts | Diario 03:00 | Borra drafts con updatedAt > 30 días |
| Limpiar documentos | Diario 04:00 | Borra archivos scheduledForDeletion < now() |
| Notificar cierre | Diario 09:00 | OFFER_CLOSING_SOON (3 días antes) |
| Limpiar sessions | Diario 02:00 | Borra sessions expiradas |

---

## 📋 API REST - Resumen

### Estructura
- Base URL: `/api/v1`
- Total endpoints: **67**
- Paginación: cursor-based (`after`, `before`, `limit`)
- Filtrado: OData (`?filter=field eq 'value'`)
- Búsqueda: `?q=texto`
- HATEOAS: `links` en responses

### Secciones

| Sección | Endpoints | Acceso |
|---------|-----------|--------|
| Autenticación | 3 | Público |
| Perfil | 2 | Autenticado |
| Documentos | 3 | Autenticado |
| Carreras | 2 | Público |
| Skills | 2 | Público |
| Empresas | 3 | Público |
| Ofertas | 2 | Público |
| Borradores | 8 | Autenticado |
| Postulaciones | 3 | Autenticado |
| Notificaciones | 4 | Autenticado |
| Admin Usuarios | 4 | Admin |
| Admin Empresas | 4 | Admin |
| Admin Ofertas | 4 | Admin |
| Admin Aplicaciones | 4 | Admin |
| Admin Carreras | 3 | Admin |
| Admin Skills | 6 | Admin |
| Admin Tipos Doc | 3 | Admin |
| Admin Auditoría | 2 | Admin |
| Admin Notificaciones | 1 | Admin |

### Respuestas

**Éxito:**
```json
{
  "data": { ... },
  "pagination": { limit, hasNext, next, ... },
  "links": [
    { "rel": "self", "href": "/api/v1/...", "method": "GET" }
  ]
}
```

**Error (RFC 9457):**
```json
{
  "type": "validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Email format is invalid",
  "instance": "/api/v1/auth/register"
}
```

---

## ⚠️ Casos Edge Importantes

### Críticos para MVP

1. **Validar status de oferta antes de postular**
   - Solo ACTIVE permite postulaciones
   - Retornar 400 si status != ACTIVE

2. **Documento en uso no se puede borrar**
   - Verificar DraftDocument y ApplicationDocument
   - Retornar 409 si tiene referencias

3. **Application única por usuario-oferta**
   - Constraint `@@unique([userId, offerId])`
   - Retornar 409 si ya existe

4. **Autorización estricta**
   - 403 si recurso existe pero no tiene permiso
   - NUNCA 404 para recursos de otros (info leak)

5. **Rate limiting en login**
   - 5 intentos/min por IP
   - 429 Too Many Requests tras límite

### A Considerar Pronto

1. **Sliding sessions** - evitar expiración abrupta
2. **Warning en UI** - antes de borrar entidades con relaciones
3. **Batch processing** - jobs con muchos elementos
4. **Transiciones de estado** - validar cambios de Application status

---

## 📈 Estimaciones de Crecimiento

### Por Año Académico
- Estudiantes nuevos: ~500
- Empresas: ~50
- Ofertas: ~200
- Applications: ~2000
- Documents: ~4000 (promedio 2 por postulación)

### Tamaños de Tabla (3 años)
- User: ~1500 filas
- Application: ~6000 filas
- Document: ~2000 filas activas (cleanup automático)
- Notification: ~15000 filas

### Performance
- Queries < 200ms con índices apropiados
- File storage: ~20GB (promedio 5MB/doc × 4000 docs)
- Throughput: 100+ req/s con setup básico

---

## 🚀 Preparado para Futuro

### Escalabilidad
- ✅ CDN para archivos (URL base configurable)
- ✅ Session store puede migrar a Redis
- ✅ Rate limiting distribuido
- ✅ Índices BD optimizados

### Mejoras Posibles
- Email verification (schema listo)
- Soft delete de Applications si BD crece
- Full-text search (PostgreSQL tsvector)
- Job queue (Bull/BullMQ) para tasks pesadas
- Deduplicación de archivos (hash)
- Chunked uploads para archivos grandes
- Webhooks para integraciones

---

## ✅ Estado Actual

### Completado
- [x] Diseño de base de datos v2 (18 tablas, campos custom dinámicos)
- [x] Especificación de API (77 endpoints RESTful)
- [x] WebSockets para tiempo real
- [x] Ciclos de vida definidos (Documents, Applications, Offers)
- [x] Sistema de notificaciones (6 tipos)
- [x] Jobs automatizados (6 jobs críticos)
- [x] Casos edge identificados
- [x] Validaciones especificadas
- [x] Sessions según OWASP guidelines
- [x] Campos custom dinámicos por oferta
- [x] Integración con sistema universitario

### Pendiente de Decisión
- [ ] Implementación específica de API SIU Guaraní (credenciales, endpoints)

### Fuera de Alcance MVP
- Auditoría completa (ApplicationStatusHistory)
- Permisos granulares (más allá de STUDENT/ADMIN)
- Analytics avanzadas
- Webhooks
- Cache distribuido (Redis)

---

## 📚 Documentación Disponible

1. **00_RESUMEN_EJECUTIVO.md** (este archivo)
   - Vista rápida del sistema
   - Referencias cruzadas
   - Números clave actualizados

2. **01_VISION_GENERAL.md**
   - Descripción del sistema
   - Flujos principales
   - Arquitectura técnica
   - Decisiones de diseño

3. **02_DATABASE_SCHEMA.md** ⭐ ACTUALIZADO
   - Schema Prisma completo (17 tablas)
   - User con campos obligatorios encriptados
   - UserCourse para múltiples carreras
   - Document con UUID paths
   - Campos custom con JSON
   - Relaciones y constraints
   - Índices optimizados

4. **03_API_ENDPOINTS.md**
   - 67 endpoints base + 10 adicionales
   - Request/response examples
   - Validaciones y errores
   - HATEOAS y paginación

5. **04_EDGE_CASES.md**
   - 22 casos edge documentados
   - Comportamientos especiales
   - Decisiones de negocio
   - Prioridades de implementación

6. **05_ACTUALIZACIONES_V2.md**
   - WebSockets y tiempo real
   - Campos custom dinámicos (JSON)
   - Sessions OWASP
   - Cambios en requisitos de ofertas
   - Integración universitaria

7. **06_ROADMAP_IMPLEMENTACION.md**
   - 9 fases de implementación
   - Timeline: 15 semanas
   - Checklist por fase
   - Testing strategy
   - Deployment guide

8. **08_SEGURIDAD_Y_FRONTEND.md** ⭐ NUEVO
   - Encriptación AES-256-GCM (6 campos)
   - emailHash para búsquedas
   - UUID paths para archivos
   - 21 páginas frontend esenciales
   - Componentes reutilizables
   - Estado global con Zustand
   - Prioridades de implementación

9. **09_CATALOGO_ERRORES_RFC9457.md**
   - Catálogo de errores con formato RFC 9457
   - 23 tipos de error (autenticación, validación, recursos, conflictos, etc.)
   - Ejemplos JSON y campos adicionales por caso

---

## 🎯 Próximos Pasos

1. **Definir decisiones pendientes**
   - Duración de session
   - Límites de negocio

2. **Implementación**
   - Setup de proyecto (Encore.ts + Prisma)
   - Esquema de BD
   - Endpoints críticos primero
   - Jobs automatizados

3. **Testing**
   - Casos edge críticos
   - Validaciones de seguridad
   - Performance bajo carga

4. **Deployment**
   - PostgreSQL (Railway/Render/Supabase)
   - Encore.ts cloud
   - Storage para archivos
   - Monitoring básico

---

## 💡 Notas Finales

Este es un **MVP bien diseñado** con:
- ✅ Arquitectura sólida y escalable
- ✅ API RESTful profesional
- ✅ Seguridad básica implementada
- ✅ Ciclos de vida bien pensados
- ✅ Casos edge identificados

**Listo para implementar** con especificaciones claras y decisiones de diseño fundamentadas.

