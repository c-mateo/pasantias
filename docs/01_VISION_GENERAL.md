# Sistema de Gestión de Pasantías Universitarias

## 📋 Descripción General

Sistema web para gestionar pasantías de estudiantes universitarios con empresas. Permite a estudiantes postularse a ofertas laborales subiendo documentos requeridos, mientras que administradores gestionan empresas, ofertas y postulaciones.

---

## 🎯 Objetivos del MVP

1. **Estudiantes** pueden:
   - Ver ofertas de pasantías disponibles
   - Postularse a ofertas con documentos requeridos
   - Reutilizar documentos entre postulaciones
   - Ver estado de sus postulaciones
   - Recibir notificaciones sobre el proceso

2. **Administradores** pueden:
   - Gestionar empresas y sus ofertas
   - Aprobar/rechazar postulaciones
   - Administrar catálogos (carreras, skills, tipos de documento)
   - Enviar notificaciones a estudiantes
   - Ver actividad del sistema

---

## 🏗️ Arquitectura Técnica

### Stack
- **Frontend**: React
- **Backend**: Encore.ts
- **Base de datos**: PostgreSQL
- **ORM**: Prisma

### Autenticación
- Session cookies (no JWT)
- Tabla `Session` en base de datos
- Duración session: **Pendiente definir** (¿24h? ¿7 días?)

### File Storage
- Sistema de archivos local por defecto
- Paths relativos en BD
- Preparado para CDN futuro (URL base configurable)
- Límite por archivo: 10MB
- Formatos permitidos: PDF, DOC, DOCX, JPG, PNG

---

## 👥 Roles del Sistema

### STUDENT (Estudiante)
- Gestionar perfil personal
- Ver ofertas públicas
- Crear/editar borradores de postulación
- Confirmar postulaciones
- Ver historial de postulaciones
- Gestionar documentos personales
- Recibir notificaciones

### ADMIN (Administrador)
- Todo lo que puede hacer STUDENT
- Gestionar usuarios
- Gestionar empresas
- Gestionar ofertas (CRUD completo)
- Gestionar postulaciones (cambiar estados)
- Gestionar catálogos (carreras, skills, tipos documento)
- Ver logs de actividad
- Dashboard de estadísticas
- Enviar notificaciones (broadcast o individuales)

---

## 🔄 Flujos Principales

### Flujo de Postulación (Happy Path)

```
1. Estudiante explora ofertas
   GET /offers
   
2. Estudiante ve detalle de oferta
   GET /offers/:id
   → Ve documentos requeridos
   
3. Estudiante crea borrador
   PATCH /offers/:offerId/draft (se crea automáticamente)
   
4. Estudiante sube documentos
   POST /documents (nuevo documento)
   PUT /offers/:offerId/draft/documents/:reqDocId (asocia al borrador)
   
   O reutiliza existente:
   POST /offers/:offerId/draft/documents/use-existing
   
5. Estudiante revisa borrador
   GET /offers/:offerId/draft
   GET /offers/:offerId/draft/documents
   
6. Estudiante confirma postulación
   PATCH /offers/:offerId/draft/confirm
   → Crea Application
   → Borra Draft
   → Crea notificación APPLICATION_SUBMITTED
   
7. Admin revisa postulación
   GET /admin/applications
   GET /admin/applications/:id
   
8. Admin acepta/rechaza
   PATCH /admin/applications/:id/status
   → Actualiza Application.status
   → Si ACCEPTED/REJECTED:
      - Borra ApplicationDocument (referencias)
      - Marca Documents sin referencias para borrado (30 días)
      - Crea notificación (APPLICATION_ACCEPTED/REJECTED)
```

### Flujo de Gestión de Ofertas

```
1. Admin crea empresa
   POST /admin/companies
   
2. Admin crea oferta
   POST /admin/offers
   → status: DRAFT
   → Agrega required documents
   → Agrega skills requeridas
   
3. Admin publica oferta
   PATCH /admin/offers/:id
   → status: ACTIVE
   → publishedAt: now()
   → Crea notificaciones OFFER_PUBLISHED (a usuarios con skills matching)
   
4. Oferta expira automáticamente
   Job automático (cada hora)
   → Si expiresAt < now(): status = EXPIRED
```

### Flujo de Reutilización de Documentos

```
Usuario tiene CV.pdf subido previamente:
- Document(id=1, path=/uploads/cv.pdf, userId=123)

Postulación A:
- ApplicationDocument(applicationId=A, documentId=1)

Postulación B (reutiliza el mismo CV):
- ApplicationDocument(applicationId=B, documentId=1)

Cuando ambas aplicaciones finalizan:
- Se borran ApplicationDocument(A,1) y ApplicationDocument(B,1)
- Document(1) queda sin referencias
- scheduledForDeletion = now() + 30 días
- Job de cleanup borra archivo tras 30 días
```

---

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones

| Tipo | Trigger | Destinatario |
|------|---------|--------------|
| APPLICATION_SUBMITTED | Usuario confirma postulación | Admin (futuro) |
| APPLICATION_ACCEPTED | Admin acepta postulación | Estudiante |
| APPLICATION_REJECTED | Admin rechaza postulación | Estudiante |
| OFFER_PUBLISHED | Admin publica oferta | Estudiantes con skills matching (futuro) |
| OFFER_CLOSING_SOON | Job diario (3 días antes) | Usuarios con postulaciones pendientes |
| ADMIN_ANNOUNCEMENT | Admin envía mensaje | Especificado por admin |

### Creación de Notificaciones

**Automáticas**: Triggers en código cuando ocurren eventos
**Manuales**: `POST /admin/notifications/broadcast`

---

## 🗄️ Ciclo de Vida de Datos

### Documents
```
1. Upload → createdAt
2. Uso en Application → lastUsedAt actualizado
3. Application finaliza → ApplicationDocument borrado
4. Sin referencias → scheduledForDeletion = +30 días
5. Job cleanup → archivo físico borrado + DELETE registro
```

### Applications
```
1. Confirmada desde Draft → status: PENDING
2. Admin revisa → status: REVIEWING (opcional)
3. Admin decide:
   - ACCEPTED → se mantiene indefinidamente (logro del estudiante)
   - REJECTED/CANCELLED → se mantiene (por ahora, sin soft delete)
   
Futuro (si BD crece): filtrar rechazos antiguos en queries
```

### ApplicationDrafts
```
1. Primer interacción con oferta → Draft creado
2. Usuario edita → updatedAt actualizado
3. Usuario confirma → Draft borrado, Application creada
4. Abandonado → Job borra drafts con updatedAt > 30 días
```

### Offers
```
1. Creada → status: DRAFT
2. Publicada → status: ACTIVE, publishedAt
3. Expira → Job automático: status: EXPIRED (si expiresAt < now())
4. Cerrada manualmente → status: CLOSED, closedAt
```

---

## 🔒 Seguridad

### Rate Limiting

| Endpoint | Límite | Razón |
|----------|--------|-------|
| POST /auth/login | 5 req/min por IP | Anti-bruteforce |
| POST /auth/register | 3 req/hour por IP | Anti-spam |
| POST /documents | 10 req/hour por user | Evitar abuso storage |
| PATCH /offers/:id/draft/confirm | 1 req/10sec por user | Evitar postulaciones duplicadas |
| GET endpoints | 100 req/min por user | Uso normal |
| GET públicos | 200 req/min por IP | Tráfico alto esperado |
| /admin/* | 500 req/min | Confianza en admins |

### Validaciones de Archivos
- Tamaño máximo: 10MB
- Extensiones permitidas: .pdf, .doc, .docx, .jpg, .jpeg, .png
- Sanitización de nombres de archivo
- Escaneo de virus: **Pendiente evaluar** (ClamAV?)

---

## 📊 Paginación y Filtrado

### Endpoints CON paginación
- GET /offers
- GET /companies
- GET /skills
- GET /documents
- GET /my-applications
- GET /companies/:id/offers
- GET /notifications
- Todos los GET /admin/*

### Parámetros de paginación
- `limit`: default 20, max 100
- `after`: cursor (cursor-based pagination)
- `before`: cursor (navegación inversa)
- `sort`: campo de ordenamiento

### Filtrado OData
- Disponible en todos los endpoints con paginación EXCEPTO /notifications
- Sintaxis: `?filter=field op 'value'`
- Operadores: eq, ne, gt, lt, ge, le, contains
- Ejemplos:
  - `?filter=status eq 'ACTIVE'`
  - `?filter=title contains 'developer'`
  - `?filter=salary gt 50000`

### Búsqueda simple
- Parámetro `?q=texto`
- Busca en campos principales (title, description, name, etc.)

---

## 🔧 Jobs Automatizados

| Job | Frecuencia | Función |
|-----|-----------|----------|
| Expirar ofertas | Cada hora | status=EXPIRED si expiresAt < now() |
| Limpiar drafts | Diario 03:00 | Borra drafts con updatedAt > 30 días |
| Limpiar documentos | Diario 04:00 | Borra archivos con scheduledForDeletion < now() |
| Notificar ofertas cerrando | Diario 09:00 | OFFER_CLOSING_SOON (3 días antes) |
| Limpiar sessions | Diario 02:00 | Borra sessions con expiresAt < now() |

---

## 📦 Retención de Datos (resumen)

- Ver `docs/07_RETENCION_DATOS.md` para la política completa y justificaciones.  
- Resumen:  
   - `Applications` aceptadas: conservar permanentemente (historial visible).  
   - `Applications` rechazadas/expiradas/retiradas: ocultar tras 30 días y archivar por 365 días, hard delete tras 365 días salvo legal hold.  
   - `Documents` marcados por usuarios: soft delete con 30 días de gracia, luego hard delete si no hay referencias.  
   - `Drafts`: hard delete a los 30 días.  
   - `Sessions`: limpieza por `expiresAt` (job diario).  

Decisiones pendientes: confirmar los plazos definitivos (30/90/365) y proceso de "legal hold".


## 📝 Decisiones Técnicas Pendientes

### Alta Prioridad
- [ ] Duración de session (¿24h? ¿7 días? ¿"Remember me"?)
- [ ] Manejo de casos edge (ver documento separado)

### Media Prioridad
- [ ] Email verification (schema listo, sin implementar en MVP)
- [ ] Escaneo antivirus en file uploads

### Baja Prioridad (post-MVP)
- [ ] Webhooks para integraciones
- [ ] Analytics y estadísticas avanzadas
- [ ] Sistema de permisos más granular
- [ ] Auditoría completa (ApplicationStatusHistory)

---

## 📈 Escalabilidad Futura

### Preparado para:
- ✅ CDN para archivos (URL base configurable)
- ✅ Servicio de email externo (estructura de notificaciones)
- ✅ Rate limiting distribuido (estructura permite Redis)
- ✅ Búsqueda avanzada (índices en BD listos)

### Posibles mejoras:
- Migrar a S3/MinIO para storage
- Full-text search con PostgreSQL o Elasticsearch
- Cache con Redis
- Queue system para jobs (Bull, BullMQ)
- Soft delete de applications si BD crece mucho

---

## 🎯 Métricas de Éxito (Futuras)

- Tiempo promedio de postulación
- Tasa de conversión draft → application
- Tasa de reutilización de documentos
- Tiempo de respuesta de admins
- Ofertas más populares
- Skills más demandadas

