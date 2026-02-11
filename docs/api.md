# API REST - Sistema de Pasantías

**Versión:** 0.1.0  
**Base URL:** `http://localhost:3333/api/v1` (desarrollo)  
**Stack:** AdonisJS 6 + Prisma + PostgreSQL  

---

## Tabla de Contenidos

1. [Resumen](#resumen)
2. [Autenticación](#autenticación)
3. [Convenciones](#convenciones)
4. [Tabla de Endpoints](#tabla-de-endpoints)
5. [Endpoints Detallados](#endpoints-detallados)
   - [Auth](#auth)
   - [Profile](#profile)
   - [Courses](#courses)
   - [Companies](#companies)
   - [Offers](#offers)
   - [Skills](#skills)
   - [Document Types](#document-types)
   - [Drafts](#drafts)
   - [My Documents](#my-documents)
   - [My Applications](#my-applications)
   - [Notifications](#notifications)
   - [Admin](#admin)
6. [Cómo correr el backend](#cómo-correr-el-backend)
7. [Limitaciones y Pendientes](#limitaciones-y-pendientes)

---

## Resumen

API RESTful para un sistema de gestión de pasantías que permite:

- **Estudiantes (STUDENT):** Registrarse, ver ofertas, crear borradores de postulación, subir documentos, postularse, y consultar el estado de sus postulaciones.
- **Administradores (ADMIN):** Gestionar empresas, ofertas, carreras, skills, tipos de documentos, usuarios, y postulaciones.

**Características principales:**

- Autenticación basada en **cookies de sesión** (web guard de AdonisJS).
- **Paginación cursor-based** (parámetros `limit` y `after`).
- **Filtros y ordenamiento** flexibles en endpoints de listado.
- **HATEOAS links** en algunas respuestas para navegación.
- **Validación estricta** con VineJS.
- **Gestión de documentos PDF** (upload, **deduplicación a nivel de almacenamiento**, eliminación programada).
- **Notificaciones** in-app y envío de emails (jobs en background).

---

## Autenticación

### Tipo: Cookie-based session

El backend usa el **web guard** de AdonisJS. Al hacer login exitoso:

1. El servidor responde con `Set-Cookie: adonis-session=...` (HttpOnly, Secure en producción).
2. El cliente (navegador o cliente HTTP) debe **incluir automáticamente** esta cookie en todas las requests subsecuentes.
3. Para hacer logout, llamar a `POST /api/v1/auth/logout`.

**No se usa JWT ni tokens en headers.** La autenticación depende enteramente de cookies.

### Endpoints públicos (sin auth):

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `GET /courses` (listado público)
- `GET /courses/:id`
- `GET /companies` (listado público)
- `GET /companies/:id`
- `GET /offers` (listado público, solo ACTIVE)
- `GET /offers/:id`
- `GET /skills`
- `GET /skills/:id`
- `GET /document-types`
- `GET /document-types/:id`

### Endpoints protegidos:

Todos los demás endpoints requieren autenticación (`security: cookieAuth` en OpenAPI).

**Roles:**

- **STUDENT:** Usuario normal (el primero registrado es ADMIN automáticamente).
- **ADMIN:** Acceso total a endpoints `/admin/*` y funcionalidades de gestión.

---

## Convenciones

### JSON

- Todos los requests y responses usan `Content-Type: application/json` (excepto uploads de PDFs).
- Timestamps en formato **ISO 8601** (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- IDs son **enteros** (autoincrement de PostgreSQL).

### Paginación

**Cursor-based pagination:**

```http
GET /offers?limit=20&after=123
```

**Parámetros:**

- `limit` (opcional, default 20, max 100): número de resultados por página.
- `after` (opcional): cursor del último ID recibido. Para obtener la siguiente página, usar el último `id` de la respuesta anterior.

**Respuesta:**

```json
{
  "data": [...],
  "pagination": {
    "limit": 20,
    "after": 123,
    "hasMore": true
  }
}
```

### Filtros

Los endpoints de listado soportan filtros en query string con sintaxis tipo ORM:

```http
GET /courses?filter[name][contains]=Ingeniería
GET /applications?filter[status][eq]=PENDING
GET /offers?filter[status][in][]=ACTIVE&filter[status][in][]=DRAFT
```

**Operadores comunes:**

- `eq`: igual
- `in`: dentro de array
- `contains`: contiene substring (case-insensitive)
- `gte`, `lte`: mayor/menor o igual (para fechas/números)

### Ordenamiento

Parámetro `sort`:

```http
GET /courses?sort=name          # ascendente
GET /courses?sort=-name         # descendente (prefijo -)
GET /offers?sort=-publishedAt   # más recientes primero
```

### Errores

**Formato estándar:**

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already registered"
    }
  ]
}
```

**Códigos HTTP:**

- `200 OK`: éxito
- `201 Created`: recurso creado
- `204 No Content`: éxito sin body (ej: DELETE)
- `400 Bad Request`: error de cliente (lógica)
- `401 Unauthorized`: no autenticado
- `403 Forbidden`: no autorizado (falta permisos)
- `404 Not Found`: recurso no existe
- `409 Conflict`: duplicado (email, nombre, etc.)
- `422 Unprocessable Entity`: error de validación
- `500 Internal Server Error`: error del servidor

### HATEOAS Links

Algunas respuestas incluyen `links` para navegación:

```json
{
  "data": {...},
  "links": [
    {"rel": "self", "href": "/api/v1/profile", "method": "GET"},
    {"rel": "update", "href": "/api/v1/profile", "method": "PATCH"}
  ]
}
```

---

## Tabla de Endpoints

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | ❌ | Registrar nuevo usuario |
| POST | `/auth/login` | ❌ | Iniciar sesión |
| POST | `/auth/logout` | ✅ | Cerrar sesión |
| POST | `/auth/password/forgot` | ❌ | Solicitar reset de contraseña |
| POST | `/auth/password/reset` | ❌ | Resetear contraseña con token |

### Profile

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/profile` | ✅ | Obtener perfil del usuario |
| PATCH | `/profile` | ✅ | Actualizar perfil |
| POST | `/profile/change-email` | ✅ | Solicitar cambio de email |
| POST | `/profile/email/confirm` | ❌ | Confirmar cambio de email |
| POST | `/profile/verify` | ❌ | Verificar email con token |
| POST | `/profile/change-password` | ✅ | Cambiar contraseña |
| POST | `/profile/set-cuil` | ✅ | Establecer CUIL (una sola vez) |

### Courses

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/courses` | ❌ | Listar carreras |
| GET | `/courses/:id` | ❌ | Obtener carrera |
| POST | `/admin/courses` | ✅ ADMIN | Crear carrera |
| PATCH | `/admin/courses/:id` | ✅ ADMIN | Actualizar carrera |
| DELETE | `/admin/courses/:id` | ✅ ADMIN | Eliminar carrera |

### Companies

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/companies` | ❌ | Listar empresas |
| GET | `/companies/:id` | ❌ | Obtener empresa |
| GET | `/companies/:id/offers` | ❌ | Ofertas de una empresa |
| POST | `/admin/companies` | ✅ ADMIN | Crear empresa |
| PATCH | `/admin/companies/:id` | ✅ ADMIN | Actualizar empresa |
| DELETE | `/admin/companies/:id` | ✅ ADMIN | Eliminar empresa |

### Offers

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/offers` | ❌ | Listar ofertas (solo ACTIVE para no-admin) |
| GET | `/offers/:id` | ❌ | Obtener oferta |
| POST | `/admin/offers` | ✅ ADMIN | Crear oferta |
| PATCH | `/admin/offers/:id` | ✅ ADMIN | Actualizar oferta |
| DELETE | `/admin/offers/:id` | ✅ ADMIN | Eliminar oferta |

### Skills

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/skills` | ❌ | Listar skills |
| GET | `/skills/:id` | ❌ | Obtener skill |
| POST | `/admin/skills` | ✅ ADMIN | Crear skill |
| PATCH | `/admin/skills/:id` | ✅ ADMIN | Actualizar skill |
| DELETE | `/admin/skills/:id` | ✅ ADMIN | Eliminar skill |

### Document Types

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/document-types` | ❌ | Listar tipos de documentos |
| GET | `/document-types/:id` | ❌ | Obtener tipo de documento |
| POST | `/admin/document-types` | ✅ ADMIN | Crear tipo de documento |
| PATCH | `/admin/document-types/:id` | ✅ ADMIN | Actualizar tipo de documento |
| DELETE | `/admin/document-types/:id` | ✅ ADMIN | Eliminar tipo de documento |

### Drafts (Borradores)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/my-drafts` | ✅ | Listar borradores del usuario |
| GET | `/offers/:offerId/draft` | ✅ | Obtener borrador para oferta |
| PATCH | `/offers/:offerId/draft` | ✅ | Guardar/actualizar borrador |
| DELETE | `/offers/:offerId/draft` | ✅ | Eliminar borrador |
| PUT | `/offers/:offerId/draft/documents/:reqDocId` | ✅ | Subir documento PDF |
| DELETE | `/offers/:offerId/draft/documents/:attachmentId` | ✅ | Remover documento |
| POST | `/offers/:offerId/draft/documents/use-existing` | ✅ | Asociar documento ya existente al borrador (operación server-side; no implica un flujo UX separado) |
| POST | `/offers/:offerId/draft/submit` | ✅ | Enviar borrador como postulación |

### My Documents

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/my-documents` | ✅ | Listar documentos del usuario |
| GET | `/my-documents/:id` | ✅ | Obtener documento |
| DELETE | `/my-documents/:id` | ✅ | Ocultar documento |
| POST | `/my-documents/:id/download` | ✅ | Descargar documento PDF |

### My Applications

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/my-applications` | ✅ | Listar postulaciones del usuario |
| GET | `/my-applications/:id` | ✅ | Obtener postulación |
| DELETE | `/my-applications/:id` | ✅ | Cancelar postulación |

### Notifications

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/notifications` | ✅ | Listar notificaciones |
| GET | `/notifications/:id` | ✅ | Obtener notificación |
| DELETE | `/notifications/:id` | ✅ | Eliminar notificación |
| PATCH | `/notifications/:id/mark-as-read` | ✅ | Marcar como leída |

### Admin - Applications

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/applications` | ✅ ADMIN | Listar todas las postulaciones |
| GET | `/admin/applications/:id` | ✅ ADMIN | Obtener postulación (con datos del usuario) |
| PATCH | `/admin/applications/:id` | ✅ ADMIN | Actualizar estado de postulación |

### Admin - Users

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/admin/users` | ✅ ADMIN | Listar usuarios |
| GET | `/admin/users/:id` | ✅ ADMIN | Obtener usuario |
| PATCH | `/admin/users/:id` | ✅ ADMIN | Actualizar cursos del usuario |
| PATCH | `/admin/users/:id/role` | ✅ ADMIN | Cambiar rol |
| PATCH | `/admin/users/:id/cuil` | ✅ ADMIN | Actualizar CUIL |

### Admin - Notifications

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/admin/notifications/broadcast` | ✅ ADMIN | Enviar notificación broadcast |

---

## Endpoints Detallados

### Auth

#### POST `/auth/register`

**Descripción:** Registrar un nuevo usuario. El primer usuario registrado se convierte en ADMIN automáticamente.

**Request:**

```json
{
  "email": "estudiante@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Validaciones:**

- `email`: formato email válido, único
- `password`: mínimo 8 caracteres
- `firstName`, `lastName`: solo letras y espacios

**Response 201:**

```json
{
  "data": {
    "id": 1,
    "email": "estudiante@example.com",
    "role": "STUDENT",
    "firstName": "Juan",
    "lastName": "Pérez"
  },
  "links": [
    {"rel": "login", "href": "/api/v1/auth/login", "method": "POST"}
  ]
}
```

**Errores:**

- `409 Conflict`: Email ya registrado
- `422`: Validación fallida

---

#### POST `/auth/login`

**Descripción:** Iniciar sesión y obtener cookie de sesión.

**Request:**

```json
{
  "email": "estudiante@example.com",
  "password": "password123"
}
```

**Response 200:**

```http
Set-Cookie: adonis-session=...; HttpOnly; Path=/; SameSite=Lax
```

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "estudiante@example.com",
      "role": "STUDENT",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "sessionExpiresAt": "2026-02-16T10:00:00.000Z",
    "links": [
      {"rel": "profile", "href": "/api/v1/profile", "method": "GET"},
      {"rel": "applications", "href": "/api/v1/my-applications", "method": "GET"},
      {"rel": "documents", "href": "/api/v1/my-documents", "method": "GET"},
      {"rel": "offers", "href": "/api/v1/offers", "method": "GET"},
      {"rel": "logout", "href": "/api/v1/auth/logout", "method": "POST"}
    ]
  }
}
```

**Errores:**

- `401`: Credenciales inválidas

---

#### POST `/auth/logout`

**Descripción:** Cerrar sesión y eliminar cookie.

**Response 204:** No content

---

#### POST `/auth/password/forgot`

**Descripción:** Solicitar reset de contraseña. Siempre responde 200 (anti-enumeración).

**Request:**

```json
{
  "email": "estudiante@example.com"
}
```

**Response 200:**

```json
{
  "message": "Si el correo existe, recibirás un email"
}
```

**Nota:** Si el email existe, se envía un email con un enlace que contiene un token. El frontend debe implementar una ruta que acepte el token (ej: `/reset-password?token=...`).

---

#### POST `/auth/password/reset`

**Descripción:** Resetear contraseña usando el token enviado por email.

**Request:**

```json
{
  "token": "abcdef123456...",
  "password": "newPassword123"
}
```

**Response 200:**

```json
{
  "message": "Contraseña actualizada",
  "email": "estudiante@example.com"
}
```

**Errores:**

- `400`: Token inválido, ya usado, o expirado (60 minutos)

---

### Profile

#### GET `/profile`

**Descripción:** Obtener perfil del usuario autenticado.

**Response 200:**

```json
{
  "data": {
    "id": 1,
    "role": "STUDENT",
    "email": "estudiante@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "cuil": "20-12345678-9",
    "phone": "+54911123456",
    "address": "Calle Falsa 123",
    "city": "Buenos Aires",
    "province": "Buenos Aires",
    "courses": [
      {"id": 1, "name": "Ingeniería en Computación", "shortName": "Ing. Comp.", "description": null}
    ],
    "skills": [
      {"id": 1, "name": "JavaScript", "description": null}
    ]
  },
  "links": [
    {"rel": "self", "href": "/api/v1/profile", "method": "GET"},
    {"rel": "update", "href": "/api/v1/profile", "method": "PATCH"},
    {"rel": "documents", "href": "/api/v1/my-documents", "method": "GET"},
    {"rel": "applications", "href": "/api/v1/my-applications", "method": "GET"}
  ]
}
```

---

#### PATCH `/profile`

**Descripción:** Actualizar perfil del usuario. Los usuarios NO pueden gestionar sus propios cursos (solo admin).

**Request:**

```json
{
  "phone": "+54911987654",
  "address": "Nueva Dirección 456",
  "city": "Córdoba",
  "province": "Córdoba",
  "skillsIds": [1, 2, 3]
}
```

**Response 200:** Igual que GET `/profile`

**Errores:**

- `409`: Teléfono duplicado

---

#### POST `/profile/set-cuil`

**Descripción:** Establecer CUIL del usuario. Solo se puede hacer UNA VEZ. Para cambios posteriores, contactar soporte (admin puede modificarlo).

**Request:**

```json
{
  "cuil": "20-12345678-9"
}
```

**Validación:** Formato `XX-XXXXXXXX-X`

**Response 200:**

```json
{
  "message": "CUIL establecido",
  "data": {
    "cuil": "20-12345678-9"
  }
}
```

**Errores:**

- `400`: CUIL ya establecido
- `409`: CUIL ya en uso por otro usuario

---

### Offers

#### GET `/offers`

**Descripción:** Listar ofertas. Usuarios no-admin solo ven ofertas ACTIVE. Admins pueden filtrar por cualquier status.

**Query params:**

- `limit`, `after`: paginación
- `sort`: `position`, `-position`, `publishedAt`, `-publishedAt`, `expiresAt`, `-expiresAt`
- `filter[position][contains]`: filtrar por posición
- `filter[status][eq]`: filtrar por status (solo admins)

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "position": "Desarrollador Backend",
      "description": "Buscamos desarrollador con experiencia en Node.js...",
      "status": "ACTIVE",
      "publishedAt": "2026-01-01T10:00:00.000Z",
      "expiresAt": "2026-03-01T10:00:00.000Z",
      "vacancies": 2,
      "location": "Buenos Aires",
      "salary": 100000,
      "durationWeeks": 12,
      "startDate": "2026-03-15T00:00:00.000Z",
      "company": {
        "id": 1,
        "name": "Tech Solutions",
        "logo": "https://example.com/logo.png"
      },
      "skills": [
        {"id": 1, "name": "Node.js"},
        {"id": 2, "name": "TypeScript"}
      ],
      "courses": [
        {"id": 1, "name": "Ingeniería en Computación", "shortName": "Ing. Comp."}
      ]
    }
  ],
  "pagination": {
    "limit": 20,
    "after": null,
    "hasMore": false
  }
}
```

---

#### GET `/offers/:id`

**Descripción:** Obtener detalle de una oferta específica.

**Response 200:**

```json
{
  "data": {
    "id": 1,
    "position": "Desarrollador Backend",
    "description": "Descripción completa...",
    "status": "ACTIVE",
    "publishedAt": "2026-01-01T10:00:00.000Z",
    "expiresAt": "2026-03-01T10:00:00.000Z",
    "requirements": "Conocimientos en...",
    "vacancies": 2,
    "location": "Buenos Aires",
    "salary": 100000,
    "durationWeeks": 12,
    "startDate": "2026-03-15T00:00:00.000Z",
    "company": {
      "id": 1,
      "name": "Tech Solutions",
      "description": "Empresa líder en...",
      "logo": "https://example.com/logo.png",
      "website": "https://techsolutions.com",
      "email": "info@techsolutions.com",
      "phone": "+54111234567"
    },
    "skills": [
      {"id": 1, "name": "Node.js", "description": "Runtime de JavaScript"}
    ],
    "courses": [
      {"id": 1, "name": "Ingeniería en Computación", "shortName": "Ing. Comp."}
    ],
    "requiredDocuments": [
      {"id": 1, "name": "CV"},
      {"id": 2, "name": "DNI"}
    ]
  }
}
```

---

### Drafts

#### GET `/offers/:offerId/draft`

**Descripción:** Obtener el borrador del usuario para una oferta específica.

**Response 200:**

```json
{
  "id": 1,
  "userId": 1,
  "offerId": 1,
  "customFieldsValues": null,
  "createdAt": "2026-02-01T10:00:00.000Z",
  "updatedAt": "2026-02-01T10:00:00.000Z",
  "attachments": [
    {
      "id": 1,
      "document": {
        "id": 1,
        "documentTypeId": 1,
        "documentType": {
          "id": 1,
          "name": "CV"
        },
        "originalName": "mi-cv.pdf"
      }
    }
  ]
}
```

**Response 204:** No existe borrador

---

#### PATCH `/offers/:offerId/draft`

**Descripción:** Guardar o actualizar borrador (upsert). Útil para guardar campos personalizados.

**Request:**

```json
{
  "customFieldsValues": {
    "campo1": "valor1",
    "campo2": "valor2"
  }
}
```

**Response 200:** Igual que GET `/offers/:offerId/draft`

---

#### PUT `/offers/:offerId/draft/documents/:reqDocId`

**Descripción:** Subir un documento PDF al borrador.

**Headers requeridos:**

```http
Content-Type: application/pdf
Content-Length: 12345
X-Original-Filename: mi-documento.pdf
```

**Body:** Binary PDF (máximo 10 MB)

**Response 200:**

```json
{
  "data": {
    "id": 1,
    "documentTypeId": 1,
    "originalName": "mi-documento.pdf",
    "size": 12345,
    "hash": {
      "sha256": "abcdef123456..."
    }
  },
  "links": [
    {"rel": "document", "href": "/api/v1/my-documents/1", "method": "GET"}
  ]
}
```

**Errores:**

- `400`: Tamaño excedido, tipo no soportado, etc.
- `404`: Oferta o tipo de documento no encontrado

**Nota:** Si el documento con el mismo hash ya existe, se reutiliza a nivel de almacenamiento (deduplicación). Esto es una optimización del servidor y **no** implica que el frontend deba exponer una acción explícita de “Usar documento existente”. 

---

#### POST `/offers/:offerId/draft/submit`

**Descripción:** Convertir el borrador en una postulación (Application). Valida que todos los documentos requeridos estén presentes. Elimina el borrador al crear la postulación.

**Response 200:**

```json
{
  "data": {
    "applicationId": 1,
    "status": "PENDING",
    "appliedAt": "2026-02-09T10:00:00.000Z"
  }
}
```

**Errores:**

- `400`: Borrador incompleto

```json
{
  "message": "Draft is incomplete",
  "completed": 1,
  "total": 2,
  "missing": {
    "documents": ["DNI"]
  }
}
```

- `409`: Ya existe una postulación para esta oferta

---

### My Applications

#### GET `/my-applications`

**Descripción:** Listar postulaciones del usuario autenticado.

**Query params:**

- `limit`, `after`: paginación
- `sort`: `createdAt`, `-createdAt`
- `filter[status][eq]`: filtrar por status
- `filter[offerId][eq]`: filtrar por oferta

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "createdAt": "2026-02-09T10:00:00.000Z",
      "finalizedAt": null,
      "offer": {
        "id": 1,
        "position": "Desarrollador Backend",
        "company": {
          "id": 1,
          "name": "Tech Solutions"
        }
      }
    }
  ],
  "pagination": {...}
}
```

---

#### GET `/my-applications/:id`

**Descripción:** Obtener detalle de una postulación específica.

**Response 200:**

```json
{
  "data": {
    "id": 1,
    "status": "PENDING",
    "offer": {
      "id": 1,
      "position": "Desarrollador Backend",
      "company": {
        "id": 1,
        "name": "Tech Solutions"
      }
    },
    "createdAt": "2026-02-09T10:00:00.000Z",
    "documents": [
      {
        "id": 1,
        "originalName": "mi-cv.pdf",
        "documentType": "CV"
      }
    ]
  },
  "links": [
    {"rel": "offer", "href": "/api/v1/offers/1", "method": "GET"},
    {"rel": "documents", "href": "/api/v1/applications/1/documents", "method": "GET"},
    {"rel": "cancel", "href": "/api/v1/applications/1", "method": "DELETE"}
  ]
}
```

**Nota:** Si el status es `BLOCKED`, se incluyen campos `blockedAt` y `blockReason`. Si es `ACCEPTED`/`REJECTED`/`CANCELED`, se incluyen `finalizedAt` y `feedback`.

---

#### DELETE `/my-applications/:id`

**Descripción:** Cancelar una postulación (solo si está en estado PENDING o BLOCKED).

**Response 204:** No content

**Errores:**

- `400`: No se puede cancelar en el estado actual

---

### Admin

#### POST `/admin/offers`

**Descripción:** Crear una oferta (solo ADMIN).

**Request:**

```json
{
  "position": "Desarrollador Backend",
  "description": "Descripción completa...",
  "companyId": 1,
  "status": "DRAFT",
  "vacancies": 2,
  "requirements": "Conocimientos en...",
  "location": "Buenos Aires",
  "salary": 100000,
  "durationWeeks": 12,
  "startDate": "2026-03-15T00:00:00.000Z",
  "expiresAt": "2026-03-01T00:00:00.000Z",
  "courses": [1, 2],
  "skills": [1, 2, 3],
  "requiredDocuments": [1, 2]
}
```

**Response 200:** Detalle de la oferta creada

**Errores:**

- `404`: Empresa no encontrada

---

#### PATCH `/admin/applications/:id`

**Descripción:** Actualizar estado de una postulación (solo ADMIN).

**Request:**

```json
{
  "status": "ACCEPTED",
  "feedback": "Felicitaciones, fuiste seleccionado"
}
```

**Transiciones permitidas:**

- **PENDING** → BLOCKED, ACCEPTED, REJECTED, CANCELLED
- **BLOCKED** → PENDING, ACCEPTED, REJECTED, CANCELLED
- **ACCEPTED, REJECTED, CANCELLED** → ninguna (estado final)

**Validaciones:**

- Si `status=BLOCKED`, `blockReason` es requerido.

**Response 200:** Sin contenido (actualización exitosa)

**Errores:**

- `400`: Transición inválida

---

## Cómo correr el backend

### Requisitos

- Node.js >= 18
- PostgreSQL >= 13
- npm o yarn

### Pasos

1. **Clonar el repositorio:**

```bash
git clone https://github.com/c-mateo/pasantias.git
cd pasantias/backend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

Crear archivo `.env` en `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pasantias"
APP_URL="http://localhost:5173"
APP_KEY="<generate-with-node-ace-generate-key>"
SESSION_DRIVER="cookie"
# ... (ver .env.example)
```

4. **Ejecutar migraciones:**

```bash
npm run prisma:migrate
```

5. **Ejecutar seeds (opcional):**

```bash
npm run prisma:seed
```

6. **Iniciar servidor:**

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3333`.

### Testing rápido

**Registrar usuario:**

```bash
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Obtener perfil (usando cookie):**

```bash
curl -X GET http://localhost:3333/api/v1/profile \
  -b cookies.txt
```

---

## Limitaciones y Pendientes

### Implementadas pero no documentadas en docs/

- **Custom fields:** Las ofertas pueden tener `customFieldsSchema` (JSON Schema) y los drafts/applications pueden tener `customFieldsValues`. Estos campos son **opcionales**; la validación dinámica (verificar `customFieldsValues` contra `customFieldsSchema`) **no** está implementada en el servidor. Los valores se almacenan como JSON libre y el frontend no debe depender de validaciones automáticas.
- **Email verification:** El flujo de verificación de email tras registro está presente pero no se documenta el endpoint exacto (falta claridad en rutas del frontend).
- **Document download:** El endpoint de descarga existe pero no está en los controladores revisados (puede estar en otro controlador).

### No implementado

- **Paginación offset-based:** Solo soporta cursor-based.
- **Búsqueda full-text:** Los filtros son simples (contains, eq). No hay búsqueda avanzada.
- **Rate limiting:** No hay protección contra abuso de endpoints.
- **Webhooks:** No hay notificaciones externas.
- **File uploads multipart:** Solo soporta binary upload con headers custom.

### Conocido y pendiente

- **Tests:** No hay tests automatizados (ver @todo en controladores).
- **Gestión de documentos huérfanos:** Existe lógica de `scheduledForDeletion` pero no hay job de cleanup implementado.
- **Revocación de sesiones:** No hay endpoint para invalidar sesiones activas.
- **Auditoría completa:** No hay un modelo `AuditLog` implementado (sugerido en docs/).

---

**Para consultas o issues, revisar el repositorio:**  
https://github.com/c-mateo/pasantias