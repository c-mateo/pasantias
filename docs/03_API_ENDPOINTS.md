# Especificación de API REST - Sistema de Pasantías

## 📋 Resumen

**Total de endpoints**: 67  
**Versión**: v1  
**Base URL**: `/api/v1`  
**Autenticación**: Session cookie

---

## Estado de implementación (verificado con `backend/start/routes.ts`)

Se agregó este resumen para aclarar que lo que está efectivamente implementado en el código fuente (rutas y controladores) prevalece sobre cambios planeados en la documentación. El documento mantiene los endpoints planeados; a continuación se listan los endpoints que actualmente existen en `start/routes.ts` y los que aparecen como no implementados/comentados.

### Endpoints implementados (resumen)
- GET `/` (root)
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/logout`
- POST `/api/v1/auth/register`
- GET `/api/v1/profile`
- GET `/api/v1/courses`
- GET `/api/v1/courses/:id`
- GET `/api/v1/companies`
- GET `/api/v1/companies/:id`
- GET `/api/v1/companies/:id/offers`
- GET `/api/v1/offers`
- GET `/api/v1/offers/:id`
- GET `/api/v1/offers/:offerId/draft` (auth)
- PATCH `/api/v1/offers/:offerId/draft` (auth)
- POST `/api/v1/offers/:offerId/draft/submit` (auth)
- PUT `/api/v1/offers/:offerId/draft/documents` (auth)
- DELETE `/api/v1/offers/:offerId/draft/documents/:attachmentId` (auth)
- POST `/api/v1/offers/:offerId/draft/documents/use-existing` (auth)
- GET `/api/v1/skills`
- GET `/api/v1/skills/:id`
- POST `/api/v1/skills`
- PATCH `/api/v1/skills/:id`
- DELETE `/api/v1/skills/:id`
- PUT `/api/v1/test-document-upload`
- GET `/api/v1/my-applications` (auth)
- GET `/api/v1/my-documents` (auth)
- GET `/api/v1/my-documents/:id` (auth)
- DELETE `/api/v1/my-documents/:id` (auth)
- POST `/api/v1/my-documents/:id/download` (auth)

### Endpoints / features documentados pero no implementados (o comentados en `start/routes.ts`)
- POST `/api/v1/offers/:id/apply` (proceso de aplicación) — está comentado en `routes.ts`.
- Endpoints admin relacionados con documentos (listar/obtener/eliminar) — varias rutas están comentadas.
- Endpoints admin de aplicaciones (`/api/v1/admin/applications` y update status) — comentados.
- Ciertas rutas antiguas o experimentales (ej.: `coursesController` declarado pero comentado en la cabecera).

Nota: la lista anterior refleja las rutas definidas (o comentadas) en `backend/start/routes.ts` al momento de la verificación. Si quieres, puedo:

- Marcar cada endpoint individual dentro del documento principal con un estado `(Implementado)` / `(Por implementar)`.
- O generar automáticamente una tabla completa comparando el documento con las rutas reales y añadir marcas inline.


## 🔐 Convenciones Generales

### Autenticación
- Session cookie: `sessionId`
- Se envía automáticamente en cada request
- Endpoints públicos no requieren autenticación
- Endpoints protegidos retornan 401 si no autenticado

### Responses
- **Éxito**: HTTP status codes (200, 201, 204)
- **Error**: RFC 9457 Problem Details
- Sin campo `status: "success"` (redundante con HTTP code)
- Estructura: `{ data, pagination?, links? }`

### Paginación (Cursor-based)

El backend devuelve directamente la salida de `prisma.<model>.paginate()` (forma actual). La respuesta contiene `data` y un objeto `pagination` con cursores. `prev`/paginación hacia atrás no está garantizada en todas las colecciones (puede ser `null` o ausente).

Ejemplo (forma mínima actual):
```json
{
  "data": [ /* objetos */ ],
  "pagination": {
    "limit": 20,
    "next": 12345,
    "prev": null
  },
  "links": [ /* opcional */ ]
}
```

**Parámetros:**
- `limit`: default 20, max 100
- `after`: cursor para siguiente página (se envía como `after=<cursor>`)
- `sort`: campo de ordenamiento (ej: `createdAt`, `-createdAt`)

Nota: si en el futuro se habilita paginación bidireccional, `pagination.prev` y `pagination.hasPrev` podrán aparecer.

### Filtrado (FIQL)
El servidor usa FIQL para `filter`. No existe el parámetro `q` de búsqueda libre; usa `filter` con expresiones FIQL y `preparePagination` validará campos según el `fieldMap` del endpoint.

Ejemplos:
```
?filter=status==ACTIVE
?filter=title==*developer*
?filter=salary=gt=50000
?filter=companyId==123;status==ACTIVE
```

Operadores comunes: `==`, `=ne=`, `=gt=`, `=lt=`, `=ge=`, `=le=` y comodines `*` para contains (según dialecto FIQL usado). La semántica exacta depende del parser FIQL del backend; usa el `fieldMap` del endpoint para tipos correctos.

### HATEOAS
Responses incluyen `links` con acciones disponibles:
```json
{
  "data": {...},
  "links": [
    {
      "rel": "self",
      "href": "/api/v1/offers/123",
      "method": "GET"
    },
    {
      "rel": "apply",
      "href": "/api/v1/offers/123/draft",
      "method": "PATCH",
      "description": "Start application draft"
    }
  ]
}
```

### Respuestas de Error (RFC 9457)
```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Email format is invalid",
  "instance": "/api/v1/auth/register",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

---

## 📚 Endpoints por Sección

### 1. AUTENTICACIÓN (3)

#### POST `/auth/register` (Implementado)
**Acceso**: Público  
**Descripción**: Registra nuevo usuario estudiante

**Request:**
```json
{
  "email": "student@university.edu",
  "password": "SecurePass123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "courseId": 5
}
```

**Validaciones:**
- Email: formato válido, max 255 chars, único
- Password: min 8 chars, debe tener mayúscula y número
- firstName/lastName: max 100 chars, no vacío
- courseId: debe existir en DB

**Response 201:**
```json
{
  "data": {
    "id": 123,
    "email": "student@university.edu",
    "role": "STUDENT",
    "firstName": "Juan",
    "lastName": "Pérez"
  },
  "links": [
    { "rel": "login", "href": "/api/v1/auth/login", "method": "POST" }
  ]
}
```

**Errores:**
- 400: Validación fallida
- 409: Email ya existe

---

#### POST `/auth/login` (Implementado)
**Acceso**: Público  
**Descripción**: Inicia sesión

**Request:**
```json
{
  "email": "student@university.edu",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "data": {
    "user": {
      "id": 123,
      "email": "student@university.edu",
      "role": "STUDENT",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "sessionExpiresAt": "2025-11-11T10:30:00Z"
  },
  "links": [
    { "rel": "profile", "href": "/api/v1/profile", "method": "GET" },
    { "rel": "offers", "href": "/api/v1/offers", "method": "GET" }
  ]
}
```

**Side effects:**
- Crea Session en BD
- Setea cookie `sessionId` (httpOnly, secure, sameSite)

**Errores:**
- 401: Credenciales inválidas
- 429: Rate limit (5 intentos/min)

---

#### POST `/auth/logout` (Implementado)
**Acceso**: Autenticado  
**Descripción**: Cierra sesión

**Response 204**: No content

**Side effects:**
- Borra Session de BD
- Limpia cookie

---

### 2. PERFIL (2)

#### GET `/profile` (Implementado)
**Acceso**: Autenticado  
**Descripción**: Obtiene perfil del usuario autenticado

**Response 200:**
```json
{
  "data": {
    "id": 123,
    "email": "student@university.edu",
    "role": "STUDENT",
    "firstName": "Juan",
    "lastName": "Pérez",
    "course": {
      "id": 5,
      "name": "Ingeniería en Sistemas"
    },
    "skills": [
      { "id": 10, "name": "React" },
      { "id": 11, "name": "Node.js" }
    ],
    "bio": "Estudiante de 4to año...",
    "phone": "+54 341 1234567"
  },
  "links": [
    { "rel": "self", "href": "/api/v1/profile", "method": "GET" },
    { "rel": "update", "href": "/api/v1/profile", "method": "PATCH" },
    { "rel": "documents", "href": "/api/v1/documents", "method": "GET" },
    { "rel": "applications", "href": "/api/v1/my-applications", "method": "GET" }
  ]
}
```

---

#### PATCH `/profile` (Por implementar)
**Acceso**: Autenticado  
**Descripción**: Actualiza perfil (campos opcionales)

**Request:**
```json
{
  "firstName": "Juan Carlos",
  "bio": "Estudiante apasionado por...",
  "phone": "+54 341 9876543",
  "courseId": 6,
  "skillIds": [10, 11, 15]
}
```

**Response 200:** Perfil actualizado (mismo formato que GET)

**Errores:**
- 400: Validación fallida
- 404: courseId no existe

---

### 3. DOCUMENTOS (3)

#### GET `/documents` (Admin - Por implementar)
**Acceso**: ADMIN (genérico). Para documentos de un usuario autenticado usar `GET /api/v1/my-documents`.
**Descripción**: Lista todos los documentos del sistema (solo para administradores)

**Query params:**
- Paginación: `limit`, `after`, `before`
- Filtrado: `filter=documentTypeId eq 1`
- Búsqueda: usar `filter` en FIQL, por ejemplo `filter=title==*cv*`
- Sort: `sort=-createdAt`

**Response 200:**
```json
{
  "data": [
    {
      "id": 456,
      "documentType": {
        "id": 1,
        "name": "CV"
      },
      "originalName": "CV_JuanPerez.pdf",
      "fileSize": 524288,
      "createdAt": "2025-10-01T10:00:00Z",
      "lastUsedAt": "2025-11-05T14:30:00Z"
    }
  ],
  "pagination": { ... },
  "links": [
    { "rel": "self", "href": "/api/v1/documents", "method": "GET" },
    // TODO: Revisar
    // { "rel": "upload", "href": "/api/v1/documents", "method": "POST" }
  ]
}
```

---

#### GET `/documents/:id` (Admin - Por implementar)
**Acceso**: ADMIN (genérico). Para descargar un documento propio usar `GET /api/v1/my-documents/:id`.
**Descripción**: Descarga documento de cualquier usuario (solo administradores). Los usuarios deben usar el endpoint bajo `my-documents`.

**Response 200:**
- Content-Type: application/pdf (o correspondiente)
- Content-Disposition: attachment; filename="CV_JuanPerez.pdf"
- Body: archivo binario

**Alternativa (si CDN configurado):**
- Response 302: Redirect a CDN URL

**Errores:**
- 403: Documento no pertenece al usuario
- 404: Documento no encontrado

---

#### DELETE `/documents/:id` (Admin - Por implementar)
**Acceso**: ADMIN (genérico). Para que un usuario elimine su propio documento usar `DELETE /api/v1/my-documents/:id`.
**Descripción**: Elimina documento de cualquier usuario (solo administradores). Para borrados de usuario individuales usar `my-documents`.

**Response 204**: No content

**Side effects:**
- Verifica que no existan DraftDocument o ApplicationDocument
- Borra archivo físico
- DELETE de registro en BD

**Errores:**
- 403: No es propietario
- 404: No encontrado
- 409: Documento en uso (está en draft o application activa)

---

### 4. CARRERAS - PÚBLICO (2)

#### GET `/courses` (Implementado)
**Acceso**: Público  
**Descripción**: Lista carreras disponibles

**Sin paginación** (menos de 50 carreras)

**Response 200:**
```json
{
  "data": [
    {
      "id": 5,
      "name": "Ingeniería en Sistemas",
      "description": "Formación en desarrollo de software..."
    }
  ]
}
```

---

#### GET `/courses/:id` (Implementado)
**Acceso**: Público  
**Descripción**: Detalle de carrera

**Response 200:**
```json
{
  "data": {
    "id": 5,
    "name": "Ingeniería en Sistemas",
    "description": "Formación completa...",
    "createdAt": "2020-01-15T00:00:00Z"
  }
}
```

---

### 5. SKILLS - PÚBLICO (2)

#### GET `/skills` (Implementado)
**Acceso**: Público  
**Descripción**: Lista skills (con paginación)

**Query params:**
- Paginación: `limit`, `after`
- Filtrado: `filter=category eq 'Frontend'`
- Búsqueda: usar `filter` en FIQL, por ejemplo `filter=name==*react*`

**Response 200:**
```json
{
  "data": [
    {
      "id": 10,
      "name": "React",
      "category": "Frontend",
      "description": "Librería para UIs"
    }
  ],
  "pagination": { ... }
}
```

---

#### GET `/skills/:id` (Implementado)
**Acceso**: Público  
**Descripción**: Detalle de skill

---

### 6. EMPRESAS - PÚBLICO (3)

#### GET `/companies` (Implementado)
**Acceso**: Público  
**Descripción**: Lista empresas (con paginación y filtrado)

**Query params:**
- Paginación, filtrado, búsqueda
- Filtro especial: `filter=verified eq true`

**Response 200:**
```json
{
  "data": [
    {
      "id": 20,
      "name": "Tech Corp",
      "description": "Empresa líder en...",
      "website": "https://techcorp.com",
      "logo": "/uploads/logos/techcorp.png",
      "verified": true
    }
  ],
  "pagination": { ... }
}
```

---

#### GET `/companies/:id` (Implementado)
**Acceso**: Público  
**Descripción**: Detalle de empresa

**Response 200:**
```json
{
  "data": {
    "id": 20,
    "name": "Tech Corp",
    "description": "Descripción completa...",
    "website": "https://techcorp.com",
    "email": "rrhh@techcorp.com",
    "phone": "+54 341 1111111",
    "logo": "/uploads/logos/techcorp.png",
    "verified": true,
    "verifiedAt": "2024-05-20T10:00:00Z"
  },
  "links": [
    { "rel": "offers", "href": "/api/v1/companies/20/offers", "method": "GET" }
  ]
}
```

---

#### GET `/companies/:id/offers` (Implementado)
**Acceso**: Público  
**Descripción**: Ofertas de una empresa (con paginación)

**Response 200:**
```json
{
  "data": [
    {
      "id": 100,
      "title": "Pasantía Frontend Developer",
      "status": "ACTIVE",
      "publishedAt": "2025-11-01T00:00:00Z",
      "expiresAt": "2025-12-31T23:59:59Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 7. OFERTAS (2)

#### GET `/offers` (Implementado)
**Acceso**: Público  
**Descripción**: Lista ofertas activas (con paginación y filtrado)

**Query params:**
- Paginación, filtrado, búsqueda
- Filtros útiles: `filter=status eq 'ACTIVE'`

**Response 200:**
```json
{
  "data": [
    {
      "id": 100,
      "title": "Pasantía Frontend Developer",
      "company": {
        "id": 20,
        "name": "Tech Corp",
        "logo": "/uploads/logos/techcorp.png"
      },
      "status": "ACTIVE",
      "publishedAt": "2025-11-01T00:00:00Z",
      "expiresAt": "2025-12-31T23:59:59Z",
      "skills": [
        { "id": 10, "name": "React" },
        { "id": 11, "name": "TypeScript" }
      ]
    }
  ],
  "pagination": { ... },
  "links": [
    { "rel": "self", "href": "/api/v1/offers", "method": "GET" }
  ]
}
```

---

#### GET `/offers/:id` (Implementado)
**Acceso**: Público  
**Descripción**: Detalle completo de oferta

**Response 200:**
```json
{
  "data": {
    "id": 100,
    "title": "Pasantía Frontend Developer",
    "description": "Descripción completa de la pasantía...",
    "company": {
      "id": 20,
      "name": "Tech Corp",
      "description": "Empresa líder...",
      "website": "https://techcorp.com",
      "logo": "/uploads/logos/techcorp.png"
    },
    "status": "ACTIVE",
    "publishedAt": "2025-11-01T00:00:00Z",
    "expiresAt": "2025-12-31T23:59:59Z",
    "skills": [
      { "id": 10, "name": "React", "category": "Frontend" },
      { "id": 11, "name": "TypeScript", "category": "Frontend" }
    ],
    "requiredDocuments": [
      { "documentTypeId": 1, "name": "CV" },
      { "documentTypeId": 2, "name": "DNI" }
    ]
  },
  "links": [
    { "rel": "self", "href": "/api/v1/offers/100", "method": "GET" },
    { "rel": "apply", "href": "/api/v1/offers/100/draft", "method": "PATCH" },
    { "rel": "company", "href": "/api/v1/companies/20", "method": "GET" }
  ]
}
```

---

### 8. BORRADORES (8)

#### GET `/offers/:offerId/draft` (Implementado)
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Obtiene borrador existente o retorna 404

**Response 200:**
```json
{
  "data": {
    "userId": 123,
    "offerId": 100,
    "offer": {
      "id": 100,
      "title": "Pasantía Frontend Developer"
    },
    "completedDocuments": 1,
    "totalDocuments": 2,
    "createdAt": "2025-11-08T10:00:00Z",
    "updatedAt": "2025-11-08T12:30:00Z"
  },
  "links": [
    { "rel": "self", "href": "/api/v1/offers/100/draft", "method": "GET" },
    { "rel": "documents", "href": "/api/v1/offers/100/draft/documents", "method": "GET" },
    { "rel": "confirm", "href": "/api/v1/offers/100/draft/confirm", "method": "PATCH" },
    { "rel": "delete", "href": "/api/v1/offers/100/draft", "method": "DELETE" }
  ]
}
```

**Errores:**
- 404: No existe borrador para este usuario-oferta

---

#### PATCH `/offers/:offerId/draft` (Implementado)
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Crea o actualiza borrador (idempotente)

**Request:** Vacío (solo crea/toca el draft)

**Response 200:**
```json
{
  "data": {
    "userId": 123,
    "offerId": 100,
    "createdAt": "2025-11-08T10:00:00Z",
    "updatedAt": "2025-11-08T15:00:00Z"
  },
  "links": [
    { "rel": "upload-document", "href": "/api/v1/documents", "method": "POST" },
    { "rel": "add-document", "href": "/api/v1/offers/100/draft/documents/1", "method": "PUT" }
  ]
}
```

**Side effects:**
- Si no existe: crea ApplicationDraft
- Si existe: actualiza `updatedAt`

**Errores:**
- 404: Oferta no existe o no está ACTIVE
- 409: Ya existe Application confirmada para esta oferta

---

#### PUT `/offers/:offerId/draft/documents/:reqDocId` (Implementado — nota: en el código la ruta de subida es `PUT /offers/:offerId/draft/documents` sin `:reqDocId`)  
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Sube documento nuevo para requisito

**Headers:**
- Content-Type: application/pdf (o correspondiente)
- X-Document-Type-Id: 1
- X-Original-Filename: CV_JuanPerez.pdf

**Body**: Archivo binario

**Response 201:**
```json
{
  "data": {
    "document": {
      "id": 789,
      "originalName": "CV_JuanPerez.pdf",
      "fileSize": 524288,
      "createdAt": "2025-11-08T15:30:00Z"
    },
    "addedToDraft": true
  },
  "links": [
    { "rel": "draft", "href": "/api/v1/offers/100/draft", "method": "GET" },
    { "rel": "document", "href": "/api/v1/documents/789", "method": "GET" }
  ]
}
```

**Side effects:**
- Guarda archivo en filesystem
- Crea Document
- Crea DraftDocument

**Validaciones:**
- Tamaño máx: 10MB
- Extensiones: .pdf, .doc, .docx, .jpg, .png
- reqDocId debe existir en RequiredDocument de la oferta

**Errores:**
- 400: Archivo inválido (tamaño, tipo)
- 404: Draft o requisito no existe
- 409: Ya existe documento para este requisito

---

#### POST `/offers/:offerId/draft/documents/use-existing` (Implementado)
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Reutiliza documento existente

**Request:**
```json
{
  "documentId": 789,
  "documentTypeId": 1
}
```

**Response 201:**
```json
{
  "data": {
    "documentId": 789,
    "documentTypeId": 1,
    "addedToDraft": true
  }
}
```

**Side effects:**
- Crea DraftDocument
- Actualiza Document.lastUsedAt

**Errores:**
- 403: Documento no pertenece al usuario
- 404: Documento o draft no existe
- 409: Ya existe documento para este requisito

---

#### GET `/offers/:offerId/draft/documents` (Implementado)
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Lista documentos del borrador

**Sin paginación** (pocos documentos por draft)

**Response 200:**
```json
{
  "data": [
    {
      "document": {
        "id": 789,
        "originalName": "CV_JuanPerez.pdf",
        "documentType": {
          "id": 1,
          "name": "CV"
        }
      },
      "requiredDocument": {
        "documentTypeId": 1,
        "name": "CV"
      }
    }
  ],
  "links": [
    { "rel": "draft", "href": "/api/v1/offers/100/draft", "method": "GET" }
  ]
}
```

---

#### DELETE `/offers/:offerId/draft/documents/:reqDocId` (Implementado — nota: en el código el parámetro se llama `attachmentId`)  
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Elimina documento del borrador

**Response 204**: No content

**Side effects:**
- DELETE DraftDocument
- NO borra Document (puede estar en otros drafts/applications)

**Errores:**
- 404: DraftDocument no existe

---

#### PATCH `/offers/:offerId/draft/confirm` (Por implementar — en el código existe `POST /offers/:offerId/draft/submit` que realiza el envío)  
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Confirma postulación (convierte draft en application)

**Request:** Vacío

**Response 201:**
```json
{
  "data": {
    "applicationId": 500,
    "status": "PENDING",
    "appliedAt": "2025-11-08T16:00:00Z"
  },
  "links": [
    { "rel": "application", "href": "/api/v1/my-applications/500", "method": "GET" },
    { "rel": "applications", "href": "/api/v1/my-applications", "method": "GET" }
  ]
}
```

**Side effects:**
1. Valida que todos los requisitos estén cumplidos
2. Crea Application
3. Copia DraftDocument → ApplicationDocument
4. DELETE ApplicationDraft
5. Crea Notification (APPLICATION_SUBMITTED)

**Errores:**
- 400: Faltan documentos requeridos
- 404: Draft no existe
- 409: Ya existe Application para esta oferta

---

#### DELETE `/offers/:offerId/draft`
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Cancela borrador

**Response 204**: No content

**Side effects:**
- DELETE ApplicationDraft (cascade borra DraftDocument)
- NO borra Documents (pueden estar en otros drafts)

---

### 9. POSTULACIONES (3)

#### GET `/my-applications` (Implementado)
**Acceso**: Autenticado (STUDENT)  
**Descripción**: Lista postulaciones del usuario (con paginación)

**Query params:**
- Paginación: `limit`, `after`
- Filtrado: `filter=status eq 'PENDING'`
- Sort: `sort=-appliedAt`

**Response 200:**
```json
{
  "data": [
    {
      "id": 500,
      "offer": {
        "id": 100,
        "title": "Pasantía Frontend Developer",
        "company": {
          "id": 20,
          "name": "Tech Corp"
        }
      },
      "status": "PENDING",
      "appliedAt": "2025-11-08T16:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

#### GET `/my-applications/:id` (Por implementar)
**Acceso**: Autenticado (STUDENT, solo propias)  
**Descripción**: Detalle completo de postulación

**Response 200:**
```json
{
  "data": {
    "id": 500,
    "offer": {
      "id": 100,
      "title": "Pasantía Frontend Developer",
      "company": {
        "id": 20,
        "name": "Tech Corp",
        "logo": "/uploads/logos/techcorp.png"
      }
    },
    "status": "PENDING",
    "appliedAt": "2025-11-08T16:00:00Z",
    "reviewedAt": null,
    "feedback": null,
    "documents": [
      {
        "documentId": 789,
        "documentType": "CV",
        "originalName": "CV_JuanPerez.pdf"
      }
    ]
  },
  "links": [
    { "rel": "self", "href": "/api/v1/my-applications/500", "method": "GET" },
    { "rel": "cancel", "href": "/api/v1/my-applications/500", "method": "DELETE" }
  ]
}
```

---

#### DELETE `/my-applications/:id` (Por implementar)
**Acceso**: Autenticado (STUDENT, solo propias)  
**Descripción**: Cancela postulación (solo si PENDING)

**Response 204**: No content

**Side effects:**
- Actualiza Application.status = CANCELLED
- Borra ApplicationDocument
- Marca Documents huérfanos para borrado

**Errores:**
- 403: No es propietario
- 404: No existe
- 409: No se puede cancelar (status != PENDING)

---

### 10. NOTIFICACIONES (4)

#### GET `/notifications` (Por implementar)
**Acceso**: Autenticado  
**Descripción**: Lista notificaciones del usuario

**Query params:**
- Paginación: `limit`, `after`
- **SIN filtrado OData**
- Filtro simple: `unreadOnly=true`
- Sort: siempre por `createdAt DESC`

**Response 200:**
```json
{
  "data": [
    {
      "id": 1000,
      "type": "APPLICATION_ACCEPTED",
      "title": "¡Postulación aceptada!",
      "message": "Tu postulación a Tech Corp fue aceptada",
      "relatedId": 500,
      "isRead": false,
      "createdAt": "2025-11-09T10:00:00Z"
    }
  ],
  "pagination": { ... },
  "links": [
    { "rel": "mark-read", "href": "/api/v1/notifications/1000/read", "method": "PATCH" }
  ]
}
```

---

#### GET `/notifications/:id` (Por implementar)
**Acceso**: Autenticado (solo propias)  
**Descripción**: Detalle de notificación

---

#### PATCH `/notifications/:id/read` (Por implementar)
**Acceso**: Autenticado (solo propias)  
**Descripción**: Marca notificación como leída

**Response 200:**
```json
{
  "data": {
    "id": 1000,
    "isRead": true,
    "readAt": "2025-11-10T09:00:00Z"
  }
}
```

**Side effects:**
- Actualiza isRead = true
- Setea readAt = now()

---

#### DELETE `/notifications/:id` (Por implementar)
**Acceso**: Autenticado (solo propias)  
**Descripción**: Elimina notificación

**Response 204**: No content

---

### 11-18. ADMIN ENDPOINTS

**Acceso**: Solo ADMIN role

Por brevedad, lista resumida. Todos siguen patrones similares:
- Paginación y filtrado en GET lists
- Validaciones similares a endpoints públicos
- HATEOAS con links apropiados

#### 11. ADMIN - USUARIOS (4)
- GET `/admin/users` - Lista usuarios (paginado)
- GET `/admin/users/:id` - Detalle usuario
- PATCH `/admin/users/:id` - Actualiza usuario (cambiar role, etc)
- DELETE `/admin/users/:id` - Borra usuario (soft delete)

#### 12. ADMIN - EMPRESAS (4)
- GET `/admin/companies` - Lista empresas
- GET `/admin/companies/:id` - Detalle
- PATCH `/admin/companies/:id` - Actualiza (verificar, etc)
- DELETE `/admin/companies/:id` - Soft delete

#### 13. ADMIN - OFERTAS (4)
- GET `/admin/offers` - Lista todas las ofertas
- GET `/admin/offers/:id` - Detalle completo
- PATCH `/admin/offers/:id` - Actualiza (publicar, cerrar, editar)
- DELETE `/admin/offers/:id` - Soft delete

#### 14. ADMIN - APLICACIONES (4)
- GET `/admin/applications` - Lista aplicaciones
- GET `/admin/applications/:id` - Detalle con documentos
- PATCH `/admin/applications/:id/status` - Cambia status (ACCEPTED/REJECTED)
- DELETE `/admin/applications/:id` - Borra aplicación

**PATCH status - Request:**
```json
{
  "status": "ACCEPTED",
  "feedback": "Excelente perfil...",
  "startDate": "2025-12-01",
  "endDate": "2026-05-31"
}
```

**Side effects al cambiar a ACCEPTED/REJECTED:**
- Setea finalizedAt
- Borra ApplicationDocument
- Marca Documents sin referencias
- Crea Notification al estudiante

#### 15. ADMIN - CARRERAS (3)
- POST `/admin/courses` - Crea carrera
- PATCH `/admin/courses/:id` - Actualiza
- DELETE `/admin/courses/:id` - Borra (si no tiene usuarios)

#### 16. ADMIN - SKILLS (6)
- GET `/admin/skills` - Lista skills (paginado)
- GET `/admin/skills/:id` - Detalle
- POST `/admin/skills` - Crea skill
- PATCH `/admin/skills/:id` - Actualiza
- DELETE `/admin/skills/:id` - Borra (si no está en uso)
- POST `/admin/skills/:id/merge` - Fusiona skills

**Merge - Request:**
```json
{
  "targetId": 10
}
```

**Side effects:**
- Mueve ProfileSkill y OfferSkill de source a target
- DELETE source skill

#### 17. ADMIN - TIPOS DOCUMENTO (3)
- GET `/admin/document-types` - Lista tipos
- POST `/admin/document-types` - Crea tipo
- DELETE `/admin/document-types/:id` - Borra (si no está en uso)

#### 18. ADMIN - AUDITORÍA (2)
- GET `/admin/activity-log` - Log de actividad (paginado)
- GET `/admin/dashboard` - Estadísticas generales

**Dashboard response:**
```json
{
  "data": {
    "users": {
      "total": 523,
      "students": 500,
      "admins": 23
    },
    "companies": {
      "total": 45,
      "verified": 40
    },
    "offers": {
      "total": 150,
      "active": 80,
      "draft": 20,
      "closed": 50
    },
    "applications": {
      "total": 2000,
      "pending": 150,
      "accepted": 800,
      "rejected": 1000
    }
  }
}
```

---

### 19. ADMIN - NOTIFICACIONES (1)

#### POST `/admin/notifications/broadcast`
**Acceso**: ADMIN  
**Descripción**: Envía notificación a uno o más usuarios

**Request:**
```json
{
  "title": "Mantenimiento programado",
  "message": "El sistema no estará disponible el sábado...",
  "userIds": [123, 456, 789]
}
```

**Si `userIds` vacío o null: broadcast a TODOS (todos los alumnos — role STUDENT).**

**Nota:** Si se proporcionan `userIds`, la lista será filtrada para incluir únicamente usuarios con `role = STUDENT` (los ids de administradores serán ignorados).

**Response 201:**
```json
{
  "data": {
    "notificationsSent": 3,
    "recipientCount": 3
  }
}
```

**Side effects:**
- Crea Notification para cada userId
- type = ADMIN_ANNOUNCEMENT

---

## 📊 Resumen de Endpoints

| Sección | Cantidad |
|---------|----------|
| Autenticación | 3 |
| Perfil | 2 |
| Documentos | 3 |
| Carreras | 2 |
| Skills | 2 |
| Empresas | 3 |
| Ofertas | 2 |
| Borradores | 8 |
| Postulaciones | 3 |
| Notificaciones | 4 |
| Admin Usuarios | 4 |
| Admin Empresas | 4 |
| Admin Ofertas | 4 |
| Admin Aplicaciones | 4 |
| Admin Carreras | 3 |
| Admin Skills | 6 |
| Admin Tipos Doc | 3 |
| Admin Auditoría | 2 |
| Admin Notificaciones | 1 |
| **TOTAL** | **67** |

---

## 🔒 Rate Limiting

| Endpoint | Límite |
|----------|--------|
| POST /auth/login | 5 req/min por IP |
| POST /auth/register | 3 req/hour por IP |
| POST /documents | 10 req/hour por user |
| PUT /offers/:id/draft/documents/:id | 10 req/hour por user |
| PATCH /offers/:id/draft/confirm | 1 req/10sec por user |
| DELETE endpoints | 20 req/min por user |
| GET endpoints | 100 req/min por user |
| GET públicos | 200 req/min por IP |
| /admin/* | 500 req/min por user |

---

## ✅ Implementación Completa

Esta especificación cubre:
- ✅ 67 endpoints RESTful
- ✅ Autenticación con sessions
- ✅ CRUD completo para todas las entidades
- ✅ Paginación cursor-based
- ✅ Filtrado OData
- ✅ HATEOAS con links
- ✅ Manejo de errores RFC 9457
- ✅ Rate limiting
- ✅ File upload binario
- ✅ Reutilización de documentos
- ✅ Sistema de notificaciones
- ✅ Panel admin completo

