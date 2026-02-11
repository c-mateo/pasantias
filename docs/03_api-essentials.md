# 🚀 API Essentials - Top 10 Endpoints

Los endpoints más usados del Sistema de Pasantías con ejemplos prácticos.

**Base URL:** `http://localhost:3333/api/v1`

---

## 📋 Índice Rápido

1. [Registrar Usuario](#1-registrar-usuario)
2. [Iniciar Sesión](#2-iniciar-sesión)
3. [Obtener Perfil](#3-obtener-perfil)
4. [Listar Ofertas](#4-listar-ofertas)
5. [Ver Detalle de Oferta](#5-ver-detalle-de-oferta)
6. [Crear Borrador](#6-crear-borrador)
7. [Subir Documento a Borrador](#7-subir-documento-a-borrador)
8. [Enviar Postulación](#8-enviar-postulación)
9. [Ver Mis Postulaciones](#9-ver-mis-postulaciones)
10. [Cambiar Estado de Postulación (Admin)](#10-cambiar-estado-de-postulación-admin)

---

## 1. Registrar Usuario

**Endpoint:** `POST /auth/register`  
**Auth:** No requerida  
**Descripción:** Crea una nueva cuenta. El primer usuario se convierte en ADMIN automáticamente.

### Request

```bash
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

### Response (201 Created)

```json
{
  "data": {
    "id": 1,
    "email": "juan.perez@example.com",
    "role": "STUDENT",
    "firstName": "Juan",
    "lastName": "Pérez"
  },
  "links": [
    {"rel": "login", "href": "/api/v1/auth/login", "method": "POST"}
  ]
}
```

### Errores Comunes

- **409 Conflict:** Email ya registrado
- **422 Unprocessable Entity:** Validación fallida (ej: password < 8 caracteres)

---

## 2. Iniciar Sesión

**Endpoint:** `POST /auth/login`  
**Auth:** No requerida  
**Descripción:** Autentica usuario y devuelve cookie de sesión.

### Request

```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "juan.perez@example.com",
    "password": "password123"
  }'
```

**Nota:** `-c cookies.txt` guarda la cookie para reutilizar en siguientes requests.

### Response (200 OK)

```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "juan.perez@example.com",
      "role": "STUDENT",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "sessionExpiresAt": "2026-02-16T10:00:00.000Z",
    "links": [
      {"rel": "profile", "href": "/api/v1/profile", "method": "GET"},
      {"rel": "offers", "href": "/api/v1/offers", "method": "GET"},
      {"rel": "logout", "href": "/api/v1/auth/logout", "method": "POST"}
    ]
  }
}
```

**Header importante:**
```
Set-Cookie: adonis-session=<token>; Path=/; HttpOnly; SameSite=Lax
```

### Errores Comunes

- **401 Unauthorized:** Credenciales incorrectas

---

## 3. Obtener Perfil

**Endpoint:** `GET /profile`  
**Auth:** ✅ Requerida  
**Descripción:** Obtiene perfil del usuario autenticado.

### Request

```bash
curl -X GET http://localhost:3333/api/v1/profile \
  -b cookies.txt
```

**Nota:** `-b cookies.txt` incluye la cookie guardada en el login.

### Response (200 OK)

```json
{
  "data": {
    "id": 1,
    "role": "STUDENT",
    "email": "juan.perez@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "cuil": null,
    "phone": null,
    "address": null,
    "city": null,
    "province": null,
    "courses": [],
    "skills": []
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

## 4. Listar Ofertas

**Endpoint:** `GET /offers`  
**Auth:** No requerida (pero puede cambiar resultados si estás autenticado)  
**Descripción:** Lista ofertas activas con paginación y filtros.

### Request Básico

```bash
curl -X GET "http://localhost:3333/api/v1/offers?limit=5" \
  -H "Content-Type: application/json"
```

### Request con Filtros

```bash
# Buscar ofertas de "Desarrollador" ordenadas por fecha
curl -X GET "http://localhost:3333/api/v1/offers?filter[position][contains]=Desarrollador&sort=-publishedAt&limit=10"
```

### Response (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "position": "Desarrollador Backend",
      "description": "Buscamos desarrollador con experiencia...",
      "status": "ACTIVE",
      "publishedAt": "2026-02-01T10:00:00.000Z",
      "expiresAt": "2026-04-01T10:00:00.000Z",
      "vacancies": 2,
      "location": "Buenos Aires",
      "salary": 100000,
      "durationWeeks": 12,
      "startDate": "2026-04-15T00:00:00.000Z",
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
    "limit": 5,
    "after": null,
    "hasMore": true
  }
}
```

### Filtros Disponibles

- `filter[position][contains]=texto` - Buscar en posición
- `filter[status][eq]=ACTIVE` - Filtrar por status
- `sort=publishedAt` o `sort=-publishedAt` - Ordenar
- `limit=20` - Cantidad de resultados (max 100)
- `after=123` - Cursor para siguiente página

---

## 5. Ver Detalle de Oferta

**Endpoint:** `GET /offers/:id`  
**Auth:** No requerida  
**Descripción:** Obtiene detalle completo de una oferta, incluyendo documentos requeridos.

### Request

```bash
curl -X GET http://localhost:3333/api/v1/offers/1
```

### Response (200 OK)

```json
{
  "data": {
    "id": 1,
    "position": "Desarrollador Backend",
    "description": "Descripción completa de la oferta...",
    "status": "ACTIVE",
    "publishedAt": "2026-02-01T10:00:00.000Z",
    "expiresAt": "2026-04-01T10:00:00.000Z",
    "requirements": "Conocimientos en Node.js, PostgreSQL...",
    "vacancies": 2,
    "location": "Buenos Aires",
    "salary": 100000,
    "durationWeeks": 12,
    "startDate": "2026-04-15T00:00:00.000Z",
    "company": {
      "id": 1,
      "name": "Tech Solutions",
      "description": "Empresa líder en desarrollo de software",
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

## 6. Crear Borrador

**Endpoint:** `PATCH /offers/:offerId/draft`  
**Auth:** ✅ Requerida  
**Descripción:** Crea o actualiza un borrador de postulación para una oferta.

### Request

```bash
curl -X PATCH http://localhost:3333/api/v1/offers/1/draft \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "customFieldsValues": {
      "motivacion": "Estoy muy interesado en esta oportunidad..."
    }
  }'
```

### Response (200 OK)

```json
{
  "data": {
    "id": 1,
    "userId": 1,
    "offerId": 1,
    "customFieldsValues": {
      "motivacion": "Estoy muy interesado en esta oportunidad..."
    },
    "createdAt": "2026-02-09T10:00:00.000Z",
    "updatedAt": "2026-02-09T10:05:00.000Z",
    "attachments": []
  }
}
```

---

## 7. Subir Documento a Borrador

**Endpoint:** `PUT /offers/:offerId/draft/documents/:reqDocId`  
**Auth:** ✅ Requerida  
**Descripción:** Sube un PDF como documento requerido para el borrador.

### Request

```bash
curl -X PUT http://localhost:3333/api/v1/offers/1/draft/documents/1 \
  -b cookies.txt \
  -H "Content-Type: application/pdf" \
  -H "X-Original-Filename: mi-cv.pdf" \
  --data-binary "@/ruta/a/mi-cv.pdf"
```

**Headers críticos:**
- `Content-Type: application/pdf` - Debe ser PDF
- `X-Original-Filename` - Nombre original del archivo
- `--data-binary` - Envía el archivo como binario

### Response (200 OK)

```json
{
  "data": {
    "id": 1,
    "documentTypeId": 1,
    "originalName": "mi-cv.pdf",
    "size": 125430,
    "hash": {
      "sha256": "a3f5d8c9e2b1..."
    }
  },
  "links": [
    {"rel": "document", "href": "/api/v1/my-documents/1", "method": "GET"}
  ]
}
```

### Validaciones

- Tipo: Solo `application/pdf`
- Tamaño: Max 10 MB
- Hash: Si el mismo PDF ya existe, se reutiliza (deduplicación)

---

## 8. Enviar Postulación

**Endpoint:** `POST /offers/:offerId/draft/submit`  
**Auth:** ✅ Requerida  
**Descripción:** Convierte el borrador en postulación oficial. Valida que todos los documentos estén completos.

### Request

```bash
curl -X POST http://localhost:3333/api/v1/offers/1/draft/submit \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

### Response (200 OK)

```json
{
  "data": {
    "applicationId": 1,
    "status": "PENDING",
    "appliedAt": "2026-02-09T10:30:00.000Z"
  }
}
```

### Errores Comunes

**400 Bad Request - Borrador incompleto:**

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

**409 Conflict - Ya te postulaste:**

```json
{
  "message": "User has already applied to this offer",
  "errors": [
    {"field": "offerId", "message": "Duplicate application"}
  ]
}
```

---

## 9. Ver Mis Postulaciones

**Endpoint:** `GET /my-applications`  
**Auth:** ✅ Requerida  
**Descripción:** Lista todas las postulaciones del usuario autenticado.

### Request

```bash
curl -X GET "http://localhost:3333/api/v1/my-applications?limit=10&sort=-createdAt" \
  -b cookies.txt
```

### Response (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "createdAt": "2026-02-09T10:30:00.000Z",
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
  "pagination": {
    "limit": 10,
    "after": null,
    "hasMore": false
  }
}
```

### Filtrar por Estado

```bash
# Solo postulaciones pendientes
curl "http://localhost:3333/api/v1/my-applications?filter[status][eq]=PENDING" -b cookies.txt

# Postulaciones aceptadas o rechazadas
curl "http://localhost:3333/api/v1/my-applications?filter[status][in][]=ACCEPTED&filter[status][in][]=REJECTED" -b cookies.txt
```

---

## 10. Cambiar Estado de Postulación (Admin)

**Endpoint:** `PATCH /admin/applications/:id`  
**Auth:** ✅ Requerida (rol ADMIN)  
**Descripción:** Cambia el estado de una postulación (aprobar, rechazar, bloquear).

### Request - Aprobar

```bash
curl -X PATCH http://localhost:3333/api/v1/admin/applications/1 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACCEPTED",
    "feedback": "Felicitaciones, fuiste seleccionado para la pasantía"
  }'
```

### Request - Bloquear

```bash
curl -X PATCH http://localhost:3333/api/v1/admin/applications/1 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "status": "BLOCKED",
    "blockReason": "Falta certificado de estudios actualizado"
  }'
```

### Response (200 OK)

Sin contenido (status actualizado correctamente).

El usuario recibirá automáticamente:
- ✉️ Email de notificación
- 🔔 Notificación in-app

### Transiciones Permitidas

| Estado Actual | Estados Permitidos |
|---------------|-------------------|
| PENDING | BLOCKED, ACCEPTED, REJECTED, CANCELLED |
| BLOCKED | PENDING, ACCEPTED, REJECTED, CANCELLED |
| ACCEPTED | ❌ Ninguno (final) |
| REJECTED | ❌ Ninguno (final) |
| CANCELLED | ❌ Ninguno (final) |

---

## 🧪 Testing Completo con curl

### Flujo Estudiante Completo

```bash
# 1. Registrarse
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# 2. Login (guarda cookie)
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Ver ofertas
curl -X GET "http://localhost:3333/api/v1/offers?limit=5"

# 4. Ver detalle de oferta 1
curl -X GET http://localhost:3333/api/v1/offers/1

# 5. Crear borrador para oferta 1
curl -X PATCH http://localhost:3333/api/v1/offers/1/draft \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{}'

# 6. Subir CV (reqDocId=1)
curl -X PUT http://localhost:3333/api/v1/offers/1/draft/documents/1 \
  -b cookies.txt \
  -H "Content-Type: application/pdf" \
  -H "X-Original-Filename: mi-cv.pdf" \
  --data-binary "@mi-cv.pdf"

# 7. Subir DNI (reqDocId=2)
curl -X PUT http://localhost:3333/api/v1/offers/1/draft/documents/2 \
  -b cookies.txt \
  -H "Content-Type: application/pdf" \
  -H "X-Original-Filename: mi-dni.pdf" \
  --data-binary "@mi-dni.pdf"

# 8. Enviar postulación
curl -X POST http://localhost:3333/api/v1/offers/1/draft/submit \
  -b cookies.txt

# 9. Ver mis postulaciones
curl -X GET http://localhost:3333/api/v1/my-applications \
  -b cookies.txt

# 10. Logout
curl -X POST http://localhost:3333/api/v1/auth/logout \
  -b cookies.txt
```

---

## 📚 Recursos Adicionales

- **Todos los endpoints:** [api.md](api.md)
- **Especificación OpenAPI:** [openapi.yaml](openapi.yaml)
- **Arquitectura:** [02_architecture.md](02_architecture.md)
- **Manual de usuario:** [manual-usuario.md](manual-usuario.md)

---

## 🔗 Importar en Postman

1. Importa `docs/openapi.yaml` en Postman
2. Configura variable de entorno `BASE_URL = http://localhost:3333/api/v1`
3. Todos los 46 endpoints estarán disponibles
4. Ejecuta login para obtener cookie automáticamente

---

**¿Preguntas?** Consulta la documentación completa en [api.md](api.md)