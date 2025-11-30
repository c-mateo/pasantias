# Catálogo de Errores RFC 9457

## 📋 Formato Estándar

Todos los errores siguen el estándar RFC 9457 (Problem Details for HTTP APIs):

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/{error-type}",
  "title": "Human-readable summary",
  "status": 400,
  "detail": "Specific explanation of this error occurrence",
  "instance": "/api/v1/endpoint/that/failed",
  ...additional fields
}
```

**Campos obligatorios:**
- `type` - URI que identifica el tipo de error
- `title` - Resumen corto y legible
- `status` - Código de estado HTTP
- `detail` - Explicación específica de este error

**Campos opcionales:**
- `instance` - URI de la request que falló
- Cualquier campo adicional relevante al error

---

## 🔴 Total: 23 Tipos de Error

---

## 1️⃣ AUTENTICACIÓN (401 Unauthorized) - 3 tipos

### `invalid-credentials`

**Cuándo:** Login con credenciales incorrectas

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/invalid-credentials",
  "title": "Invalid credentials",
  "status": 401,
  "detail": "The provided email or password is incorrect",
  "instance": "/api/v1/auth/login"
}
```

---

### `session-expired`

**Cuándo:** Session expiró por inactividad (30min) o tiempo máximo (12h)

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/session-expired",
  "title": "Session expired",
  "status": 401,
  "detail": "Your session has expired due to inactivity. Please log in again",
  "instance": "/api/v1/offers/100/draft",
  "reason": "idle"
}
```

**Campos adicionales:**
- `reason`: `"idle"` (30min inactivo) o `"absolute"` (12h desde creación)

---

### `authentication-required`

**Cuándo:** Acceso a endpoint protegido sin sesión

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/authentication-required",
  "title": "Authentication required",
  "status": 401,
  "detail": "You must be logged in to access this resource",
  "instance": "/api/v1/my-applications"
}
```

---

## 2️⃣ AUTORIZACIÓN (403 Forbidden) - 2 tipos

### `forbidden`

**Cuándo:** Usuario autenticado pero sin permisos para el recurso específico

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/forbidden",
  "title": "Access denied",
  "status": 403,
  "detail": "You do not have permission to access this resource",
  "instance": "/api/v1/documents/456"
}
```

---

### `insufficient-permissions`

**Cuándo:** Acción requiere rol específico (ej: ADMIN)

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/insufficient-permissions",
  "title": "Insufficient permissions",
  "status": 403,
  "detail": "This action requires ADMIN role",
  "instance": "/api/v1/admin/users",
  "requiredRole": "ADMIN",
  "currentRole": "STUDENT"
}
```

**Campos adicionales:**
- `requiredRole`: Rol necesario
- `currentRole`: Rol actual del usuario

---

## 3️⃣ VALIDACIÓN (400 Bad Request) - 3 tipos

### `validation-error`

**Cuándo:** Uno o más campos no pasan validación

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/validation-error",
  "title": "Validation error",
  "status": 400,
  "detail": "One or more fields contain invalid data",
  "instance": "/api/v1/auth/register",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters and contain uppercase and number"
    },
    {
      "field": "dni",
      "message": "DNI must be exactly 8 digits"
    }
  ]
}
```

**Campos adicionales:**
- `errors`: Array de objetos con `field` y `message`

**Usado en:**
- Registro de usuarios
- Actualizar perfil
- Crear/editar ofertas
- Cualquier endpoint con validación de campos

---

### `invalid-file`

**Cuándo:** Archivo subido no cumple requisitos

**Por tamaño:**
```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/invalid-file",
  "title": "Invalid file",
  "status": 400,
  "detail": "Uploaded file does not meet requirements",
  "instance": "/api/v1/documents",
  "errors": [
    {
      "reason": "size",
      "maxSize": 10485760,
      "actualSize": 15728640,
      "message": "File size exceeds maximum of 10MB"
    }
  ]
}
```

**Por tipo:**
```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/invalid-file",
  "title": "Invalid file",
  "status": 400,
  "detail": "Uploaded file does not meet requirements",
  "instance": "/api/v1/documents",
  "errors": [
    {
      "reason": "type",
      "allowedTypes": [".pdf", ".doc", ".docx", ".jpg", ".png"],
      "actualType": ".exe",
      "message": "File type not allowed"
    }
  ]
}
```

**Campos adicionales:**
- `errors`: Array de objetos FileError
  - `reason`: `"size"` o `"type"`
  - Para size: `maxSize`, `actualSize`
  - Para type: `allowedTypes`, `actualType`
  - `message`: Explicación legible

---

### `missing-required-fields`

**Cuándo:** Faltan campos obligatorios (incluyendo campos custom)

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/missing-required-fields",
  "title": "Missing required fields",
  "status": 400,
  "detail": "Cannot proceed with missing required information",
  "instance": "/api/v1/offers/100/draft/confirm",
  "missingFields": [
    {
      "field": "cuil",
      "label": "CUIL"
    },
    {
      "field": "motivacion",
      "label": "Motivación"
    }
  ]
}
```

**Campos adicionales:**
- `missingFields`: Array con `field` y `label`

---

## 4️⃣ RECURSOS (404, 410) - 3 tipos

### `not-found`

**Cuándo:** Recurso no existe

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "The requested offer does not exist",
  "instance": "/api/v1/offers/999",
  "resourceType": "Offer",
  "resourceId": "999"
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso (User, Offer, Application, etc)
- `resourceId`: ID del recurso

**Usado para:**
- Offer, User, Company, Course, Skill, DocumentType, Document, Application

---

### `resource-deleted`

**Cuándo:** Recurso fue eliminado (soft delete)

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/resource-deleted",
  "title": "Resource deleted",
  "status": 410,
  "detail": "This user has been deleted",
  "instance": "/api/v1/admin/users/123",
  "resourceType": "User",
  "resourceId": "123",
  "deletedAt": "2025-11-01T10:00:00Z",
  "anonymized": true
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso
- `resourceId`: ID del recurso
- `deletedAt`: Timestamp de eliminación
- `anonymized`: Solo para User (true/false)

**Usado para:**
- User (con anonymized)
- Company
- Offer

---

### `resource-unavailable`

**Cuándo:** Recurso existe pero no disponible para la acción

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/resource-unavailable",
  "title": "Resource not available",
  "status": 400,
  "detail": "Cannot perform this action on offer with status EXPIRED",
  "instance": "/api/v1/offers/100/draft",
  "resourceType": "Offer",
  "resourceId": "100",
  "currentStatus": "EXPIRED",
  "requiredStatus": "ACTIVE",
  "expiredAt": "2025-11-10T23:59:59Z"
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso
- `resourceId`: ID del recurso
- `currentStatus`: Estado actual
- `requiredStatus`: Estado requerido (opcional)
- Campos adicionales según contexto (ej: `expiredAt`)

**Usado para:**
- Postular a oferta no ACTIVE
- Cancelar application no PENDING
- Editar oferta CLOSED

---

## 5️⃣ CONFLICTOS (409) - 6 tipos

### `already-exists`

**Cuándo:** Violación de constraint unique

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/already-exists",
  "title": "Resource already exists",
  "status": 409,
  "detail": "A user with this email already exists",
  "instance": "/api/v1/auth/register",
  "resourceType": "User",
  "field": "email",
  "value": "user@example.com"
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso
- `field`: Campo duplicado
- `value`: Valor duplicado

**Usado para:**
- Email duplicado en registro
- Nombre duplicado en Course/Skill
- Usuario ya postulado a oferta (userId + offerId unique)

---

### `email-already-registered`

**Cuándo:** Email duplicado en registro (versión específica de already-exists)

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/email-already-registered",
  "title": "Email already registered",
  "status": 409,
  "detail": "The provided email is already associated with an existing account",
  "instance": "/api/v1/auth/register",
  "email": "user@example.com"
}
```

**Campos adicionales:**
- `email`: Email duplicado

---

### `already-applied`

**Cuándo:** Usuario ya postuló a la oferta

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/already-applied",
  "title": "Already applied",
  "status": 409,
  "detail": "You have already applied to this offer",
  "instance": "/api/v1/offers/100/draft/confirm",
  "applicationId": "500",
  "appliedAt": "2025-11-08T16:00:00Z",
  "applicationStatus": "PENDING"
}
```

**Campos adicionales:**
- `applicationId`: ID de la application existente
- `appliedAt`: Timestamp de postulación
- `applicationStatus`: Estado actual

---

### `resource-in-use`

**Cuándo:** No se puede borrar recurso porque está en uso

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/resource-in-use",
  "title": "Resource in use",
  "status": 409,
  "detail": "Cannot delete document type that is currently in use",
  "instance": "/api/v1/admin/document-types/1",
  "resourceType": "DocumentType",
  "resourceId": "1",
  "resourceName": "CV",
  "usageCount": {
    "requiredByOffers": 15,
    "usedInDocuments": 234
  },
  "suggestion": "Remove this requirement from all offers first"
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso
- `resourceId`: ID del recurso
- `resourceName`: Nombre del recurso
- `usageCount`: Objeto con contadores de uso
- `suggestion`: Sugerencia de cómo proceder (opcional)

**Usado para:**
- DocumentType (en ofertas o documentos)
- Course (tiene estudiantes)
- Skill (en perfiles u ofertas)
- Document (en drafts o applications)

---

### `invalid-state-transition`

**Cuándo:** Transición de estado no permitida

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/invalid-state-transition",
  "title": "Invalid state transition",
  "status": 409,
  "detail": "Cannot change status from ACCEPTED to PENDING",
  "instance": "/api/v1/admin/applications/500",
  "resourceType": "Application",
  "resourceId": "500",
  "currentStatus": "ACCEPTED",
  "requestedStatus": "PENDING",
  "allowedTransitions": ["ACCEPTED -> (none)"]
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso
- `resourceId`: ID del recurso
- `currentStatus`: Estado actual
- `requestedStatus`: Estado solicitado
- `allowedTransitions`: Array de transiciones permitidas

**Usado para:**
- PATCH /admin/applications/:id/status
- Cambios de status de Application u Offer

---

### `operation-not-allowed`

**Cuándo:** Operación lógicamente inválida

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/operation-not-allowed",
  "title": "Operation not allowed",
  "status": 409,
  "detail": "Cannot merge a skill into itself",
  "instance": "/api/v1/admin/skills/10/merge",
  "operation": "skill-merge",
  "sourceId": "10",
  "targetId": "10"
}
```

**Campos adicionales:**
- `operation`: Nombre de la operación
- Campos adicionales según contexto

**Usado para:**
- Merge de skill consigo mismo
- Operaciones que no tienen sentido lógico

---

## 6️⃣ ESTADO DEL RECURSO (423 Locked, 400, 409) - 3 tipos

### `resource-blocked`

**Cuándo:** Recurso bloqueado, requiere acción del usuario

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/resource-blocked",
  "title": "Resource blocked",
  "status": 423,
  "detail": "This application requires action before it can proceed",
  "instance": "/api/v1/my-applications/500",
  "resourceType": "Application",
  "resourceId": "500",
  "blockReason": "MISSING_DOCUMENTS",
  "blockedAt": "2025-11-10T15:00:00Z",
  "requiredActions": [
    {
      "documentTypeId": "5",
      "documentTypeName": "Certificado de Estudios"
    }
  ],
  "unblockUrl": "/api/v1/offers/100/draft"
}
```

**Campos adicionales:**
- `resourceType`: Tipo de recurso
- `resourceId`: ID del recurso
- `blockReason`: Razón del bloqueo
- `blockedAt`: Timestamp de bloqueo
- `requiredActions`: Array de acciones necesarias
- `unblockUrl`: URL para desbloquear (opcional)

**Usado para:**
- Application con status BLOCKED

---

### `incomplete-draft`

**Cuándo:** Intentar confirmar draft sin completar todos los requisitos

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/incomplete-draft",
  "title": "Incomplete draft",
  "status": 400,
  "detail": "Cannot confirm application. 2 requirement(s) missing",
  "instance": "/api/v1/offers/100/draft/confirm",
  "completed": 1,
  "total": 3,
  "missing": {
    "documents": [
      {
        "documentTypeId": "2",
        "name": "DNI"
      }
    ],
    "customFields": [
      {
        "fieldId": "cuil",
        "label": "CUIL"
      }
    ]
  }
}
```

**Campos adicionales:**
- `completed`: Cantidad completada
- `total`: Cantidad total de requisitos
- `missing`: Objeto con documentos y/o campos custom faltantes

---

### `offer-requirements-changed`

**Cuándo:** Requisitos de oferta cambiaron mientras completabas draft

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/offer-requirements-changed",
  "title": "Offer requirements changed",
  "status": 409,
  "detail": "The offer requirements changed. Your draft has been updated. Please complete the new requirements",
  "instance": "/api/v1/offers/100/draft/confirm",
  "offerId": "100",
  "changedAt": "2025-11-11T10:00:00Z",
  "newRequirements": [
    {
      "documentTypeId": "5",
      "name": "Certificado de Estudios"
    }
  ]
}
```

**Campos adicionales:**
- `offerId`: ID de la oferta
- `changedAt`: Timestamp del cambio
- `newRequirements`: Nuevos requisitos agregados

---

## 7️⃣ RATE LIMITING (429) - 2 tipos

### `rate-limit-exceeded`

**Cuándo:** Demasiadas requests al endpoint

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/rate-limit-exceeded",
  "title": "Too many requests",
  "status": 429,
  "detail": "Too many requests. Try again in 45 seconds",
  "instance": "/api/v1/auth/login",
  "limit": 5,
  "window": 60,
  "retryAfter": 45
}
```

**Campos adicionales:**
- `limit`: Cantidad máxima de requests
- `window`: Ventana de tiempo en segundos
- `retryAfter`: Segundos hasta poder reintentar

**Headers HTTP incluidos:**
```
Retry-After: 45
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699789200
```

**Usado en:**
- POST /auth/login (5 req/min)
- POST /auth/register (3 req/hora)
- POST /documents (10 req/hora)

---

### `quota-exceeded`

**Cuándo:** Límite de recursos alcanzado

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/quota-exceeded",
  "title": "Quota exceeded",
  "status": 429,
  "detail": "You have reached the maximum active applications (10)",
  "instance": "/api/v1/offers/100/draft/confirm",
  "quotaType": "active-applications",
  "limit": 10,
  "current": 10,
  "suggestion": "Wait for some applications to be reviewed before applying to more offers"
}
```

**Campos adicionales:**
- `quotaType`: Tipo de cuota
- `limit`: Límite máximo
- `current`: Cantidad actual
- `suggestion`: Sugerencia (opcional)

**Usado para:**
- Límite de applications activas (futuro)
- Límite de storage por usuario (futuro)

---

## 8️⃣ SERVIDOR (500, 502, 503) - 3 tipos

### `internal-error`

**Cuándo:** Error inesperado del servidor

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/internal-error",
  "title": "Internal server error",
  "status": 500,
  "detail": "An unexpected error occurred. Our team has been notified. Please try again later",
  "instance": "/api/v1/offers/100/draft/confirm",
  "errorId": "err_a1b2c3d4e5f6",
  "timestamp": "2025-11-11T10:30:00Z",
  "supportEmail": "bienestaruniversitario@unraf.edu.ar"
}
```

**Campos adicionales:**
- `errorId`: ID único para tracking
- `timestamp`: Momento del error
- `supportEmail`: Email de soporte

**IMPORTANTE:** NO incluir stack traces, database errors, o detalles internos en producción.

---

### `external-service-error`

**Cuándo:** Servicio externo falló (ej: API SIU Guaraní)

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/external-service-error",
  "title": "External service error",
  "status": 502,
  "detail": "Unable to communicate with SIU-Guarani. You can upload the certificate manually instead",
  "instance": "/api/v1/certificates/fetch",
  "service": "SIU-Guarani",
  "fallback": "You can upload the certificate manually instead"
}
```

**Campos adicionales:**
- `service`: Nombre del servicio externo
- `fallback`: Acción alternativa (opcional)

---

### `service-unavailable`

**Cuándo:** Mantenimiento o servicio caído

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/service-unavailable",
  "title": "Service temporarily unavailable",
  "status": 503,
  "detail": "System maintenance in progress. Service will resume at 14:00 ART",
  "instance": "/api/v1/offers",
  "retryAfter": 3600,
  "maintenanceEnd": "2025-11-11T14:00:00Z"
}
```

**Campos adicionales:**
- `retryAfter`: Segundos hasta reintento (opcional)
- `maintenanceEnd`: Timestamp de fin de mantenimiento (opcional)

---

## 9️⃣ OTROS (400) - 1 tipo

### `no-changes`

**Cuándo:** PATCH sin cambios

```json
{
  "type": "https://pasantias.unraf.edu.ar/errors/no-changes",
  "title": "No changes detected",
  "status": 400,
  "detail": "No changes were provided in the request",
  "instance": "/api/v1/profile"
}
```

**Usado en:**
- PATCH /profile (body vacío)
- PATCH /admin/offers/:id (sin cambios)

---

## 📊 Resumen por Categoría

| Categoría | Cantidad | Status Codes |
|-----------|----------|--------------|
| **Autenticación** | 3 | 401 |
| **Autorización** | 2 | 403 |
| **Validación** | 3 | 400 |
| **Recursos** | 3 | 404, 410, 400 |
| **Conflictos** | 6 | 409 |
| **Estado del Recurso** | 3 | 423, 400, 409 |
| **Rate Limiting** | 2 | 429 |
| **Servidor** | 3 | 500, 502, 503 |
| **Otros** | 1 | 400 |
| **TOTAL** | **23** | |

---

## 🎯 Mapeo por Status Code

| Status | Count | Tipos |
|--------|-------|-------|
| **400** | 5 | validation-error, invalid-file, missing-required-fields, resource-unavailable, incomplete-draft, no-changes |
| **401** | 3 | invalid-credentials, session-expired, authentication-required |
| **403** | 2 | forbidden, insufficient-permissions |
| **404** | 1 | not-found |
| **409** | 6 | already-exists, email-already-registered, already-applied, resource-in-use, invalid-state-transition, operation-not-allowed, offer-requirements-changed |
| **410** | 1 | resource-deleted |
| **423** | 1 | resource-blocked |
| **429** | 2 | rate-limit-exceeded, quota-exceeded |
| **500** | 1 | internal-error |
| **502** | 1 | external-service-error |
| **503** | 1 | service-unavailable |

---

## 🔧 Casos de Uso Comunes

### Registro de Usuario

```
POST /auth/register

Posibles errores:
- validation-error (400) - email/password/dni inválidos
- email-already-registered (409) - email duplicado
- rate-limit-exceeded (429) - demasiados intentos
```

### Login

```
POST /auth/login

Posibles errores:
- invalid-credentials (401) - email/password incorrectos
- rate-limit-exceeded (429) - demasiados intentos
```

### Subir Documento

```
POST /documents

Posibles errores:
- authentication-required (401) - no autenticado
- validation-error (400) - documentTypeId inválido
- invalid-file (400) - archivo muy grande o tipo inválido
- rate-limit-exceeded (429) - demasiados uploads
```

### Postular a Oferta

```
PATCH /offers/:id/draft/confirm

Posibles errores:
- authentication-required (401) - no autenticado
- session-expired (401) - sesión expiró
- not-found (404) - oferta no existe
- resource-unavailable (400) - oferta no ACTIVE
- already-applied (409) - ya postulado
- incomplete-draft (400) - faltan documentos/campos
- offer-requirements-changed (409) - requisitos cambiaron
- quota-exceeded (429) - demasiadas applications activas
```

### Admin: Eliminar DocumentType

```
DELETE /admin/document-types/:id

Posibles errores:
- authentication-required (401) - no autenticado
- insufficient-permissions (403) - no es ADMIN
- not-found (404) - tipo no existe
- resource-in-use (409) - usado en ofertas/documentos
```

---

## ✅ Buenas Prácticas

1. **Siempre incluir `instance`** - ayuda con debugging
2. **Campos adicionales específicos** - más contexto = mejor UX
3. **Messages legibles** - evitar tecnicismos
4. **NO exponer detalles internos** - stack traces, queries SQL, etc
5. **Consistencia** - mismo error para mismas situaciones
6. **HTTP status correcto** - usar el status semántico apropiado
7. **Type URL válida** - aunque no necesita resolver

---

## 🎨 Frontend: Parsing de Errores

```typescript
interface RFC9457Error {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  [key: string]: any;
}

function handleApiError(error: any) {
  const problemDetails: RFC9457Error = error.response?.data;
  
  if (!problemDetails?.type) {
    toast.error("Error de conexión");
    return;
  }
  
  const errorType = problemDetails.type.split('/').pop();
  
  switch (errorType) {
    case 'validation-error':
      showValidationErrors(problemDetails.errors);
      break;
    
    case 'session-expired':
      toast.error('Tu sesión expiró. Redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
      break;
    
    case 'rate-limit-exceeded':
      toast.error(`${problemDetails.detail}. Espera ${problemDetails.retryAfter}s`);
      break;
    
    case 'resource-blocked':
      showBlockedModal(problemDetails);
      break;
    
    case 'already-applied':
      toast.info('Ya te postulaste a esta oferta');
      router.push(`/my-applications/${problemDetails.applicationId}`);
      break;
    
    default:
      toast.error(problemDetails.detail || problemDetails.title);
  }
}
```

---

## 📝 Notas de Implementación

### Backend (Encore.ts)

Los errores se implementarán usando `APIError` de Encore con `.withDetails()`:

```typescript
throw APIError.invalidArgument("Validation error")
  .withDetails({
    type: "validation-error",
    title: "Validation error",
    detail: "One or more fields contain invalid data",
    instance: "/api/v1/auth/register",
    errors: [...]
  });
```

El formato final será:
```json
{
  "code": "invalid_argument",  // Encore
  "message": "Validation error",  // Encore
  "details": {  // RFC 9457
    "type": "validation-error",
    "title": "Validation error",
    "detail": "One or more fields...",
    "instance": "/api/v1/auth/register",
    "errors": [...]
  }
}
```

Frontend parseará `error.details.*` para obtener los campos RFC 9457.

---

## 🔗 Referencias

- [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Error Handling Best Practices](https://blog.logrocket.com/rest-api-error-handling-best-practices/)
