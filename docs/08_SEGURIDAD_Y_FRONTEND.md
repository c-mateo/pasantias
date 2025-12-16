# Decisiones Finales y Frontend Esencial

## 🔒 Seguridad y Encriptación - FINAL

### Campos Encriptados (AES-256-GCM)

```typescript
// Campos sensibles que SE encriptan:
- email
- firstName
- lastName  
- dni (8 dígitos)
- phone
- domicilio (dirección completa)

// Campos que NO se encriptan (necesarios para filtrar):
- localidad (plain text)
- provincia (plain text)
- bio (plain text, opcional)
```

### Implementación de Encriptación

```typescript
import * as crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Formato: iv:authTag:encrypted (base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(encryptedText: string): string {
  const [ivB64, authTagB64, encryptedB64] = encryptedText.split(':');
  
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  return decipher.update(encrypted) + decipher.final('utf8');
}

export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}
```

### Uso en el Sistema

**Registro:**
```typescript
POST /auth/register

const user = await db.user.create({
  data: {
    // Encriptados
    email: encrypt(req.email),
    emailHash: sha256(req.email.toLowerCase()),
    firstName: encrypt(req.firstName),
    lastName: encrypt(req.lastName),
    dni: encrypt(req.dni),
    phone: encrypt(req.phone),
    domicilio: encrypt(req.domicilio),
    
    // Plain text
    localidad: req.localidad,
    provincia: req.provincia,
    
    // Bcrypt
    password: await bcrypt.hash(req.password, 10)
  }
});
```

**Login:**
```typescript
POST /auth/login

const emailHash = sha256(req.email.toLowerCase());
const user = await db.user.findUnique({ where: { emailHash } });

if (!user) throw new Unauthorized();

const isValidPassword = await bcrypt.compare(req.password, user.password);
if (!isValidPassword) throw new Unauthorized();

// Desencriptar para response
return {
  user: {
    id: user.id,
    email: decrypt(user.email),
    firstName: decrypt(user.firstName),
    lastName: decrypt(user.lastName)
    // ...
  }
};
```

**Filtrar por ubicación:**
```typescript
GET /admin/users?provincia=Santa Fe&localidad=Rafaela

// Plain text, no necesitas desencriptar
const users = await db.user.findMany({
  where: {
    provincia: 'Santa Fe',
    localidad: 'Rafaela'
  }
});

// Desencriptar campos sensibles antes de enviar
return users.map(u => ({
  id: u.id,
  email: decrypt(u.email),
  firstName: decrypt(u.firstName),
  dni: decrypt(u.dni),
  localidad: u.localidad,      // Ya plain text
  provincia: u.provincia        // Ya plain text
}));
```

---

## 📁 File Storage - FINAL

### Path con UUID

```typescript
import { randomUUID } from 'crypto';
import * as path from 'path';

function generateFilePath(originalName: string): string {
  const ext = path.extname(originalName);
  const uuid = randomUUID();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `/uploads/documents/${year}/${month}/${uuid}${ext}`;
}

// Ejemplo:
// Input:  "CV Juan Perez.pdf"
// Output: "/uploads/documents/2025/11/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
```

**Ventajas:**
- ✅ UUID imposible de adivinar
- ✅ No revela userId (anonimato)
- ✅ Organizado por fecha (backups fáciles)
- ✅ Sin colisiones

---

## 🗄️ Campos Custom - FINAL (Baja Prioridad)

### Schema con JSON

```prisma
model Offer {
  customFieldsSchema Json?  // Definición de campos
}

model ApplicationDraft {
  customFieldsValues Json?  // Valores en borrador
}

model Application {
  customFieldsValues Json?  // Valores confirmados
}
```

### Ejemplo de Schema

```json
// Offer.customFieldsSchema
[
  {
    "id": "cuil",
    "type": "text",
    "label": "CUIL",
    "required": true,
    "pattern": "^\\d{11}$",
    "placeholder": "20123456789"
  },
  {
    "id": "motivacion",
    "type": "textarea",
    "label": "¿Por qué te interesa esta pasantía?",
    "required": false,
    "maxLength": 500
  }
]

// Application.customFieldsValues
{
  "cuil": "20123456789",
  "motivacion": "Me interesa porque..."
}
```

### Validación

```typescript
function validateCustomFields(
  schema: CustomField[], 
  values: Record<string, any>
): void {
  for (const field of schema) {
    const value = values[field.id];
    
    if (field.required && !value) {
      throw new ValidationError(`${field.label} es requerido`);
    }
    
    if (value && field.pattern) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        throw new ValidationError(`${field.label} tiene formato inválido`);
      }
    }
    
    if (value && field.maxLength && value.length > field.maxLength) {
      throw new ValidationError(`${field.label} es demasiado largo`);
    }
  }
}
```

---

## 💾 Cache con Redis - FINAL (Baja Prioridad)

### Casos de Uso

**1. Cache de ofertas activas:**
```typescript
async function getActiveOffers(filters: OfferFilters) {
  const cacheKey = `offers:active:${JSON.stringify(filters)}`;
  
  // Intentar desde cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query a PostgreSQL
  const offers = await db.offer.findMany({
    where: { status: 'ACTIVE', ...filters }
  });
  
  // Guardar en cache (5 minutos)
  await redis.set(cacheKey, JSON.stringify(offers), { EX: 300 });
  
  return offers;
}
```

**2. Session store:**
```typescript
// Más rápido que PostgreSQL
await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), {
  EX: 43200  // 12 horas
});

const session = await redis.get(`session:${sessionId}`);
```

**3. Rate limiting:**
```typescript
async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  const count = await redis.incr(`ratelimit:${key}`);
  
  if (count === 1) {
    await redis.expire(`ratelimit:${key}`, window);
  }
  
  return count <= limit;
}

// Uso
const canProceed = await checkRateLimit(`login:${ip}`, 5, 60);
if (!canProceed) throw new TooManyRequests();

**Nota (configuración):** El proyecto incluye un wrapper que permite desactivar los limiters mediante la variable de entorno `RATE_LIMITING_ENABLED`. Cuando está `false`, el middleware de rate limiting es un NO-OP, lo que facilita el desarrollo local y las pruebas. Por defecto `.env.example` tiene `RATE_LIMITING_ENABLED=true`.
```

**Cuándo implementar:**
- Si queries de ofertas > 500ms
- Si tienes 1000+ usuarios concurrentes
- Si necesitas rate limiting distribuido (múltiples servidores)

---

## 🎨 Frontend Esencial - React

### Stack Recomendado

```
Framework:     React 18+ con TypeScript
Routing:       React Router v6
State:         Zustand (simple) o Redux Toolkit
Forms:         React Hook Form + Zod
UI Library:    shadcn/ui (Tailwind + Radix)
HTTP Client:   Axios o fetch nativo
WebSocket:     Socket.io-client o Encore WebSocket
Build:         Vite
```

---

## 📱 Páginas Esenciales (MVP)

### Públicas (Sin Auth)

#### 1. **Landing Page** `/`
- Hero con call-to-action
- Descripción del sistema
- Últimas ofertas destacadas
- Login/Registro buttons

#### 2. **Login** `/login`
```typescript
interface LoginForm {
  email: string;
  password: string;
}
```
- Email + password
- "Recordarme" (futuro)
- Link a registro
- Error handling (credenciales inválidas, cuenta bloqueada)

#### 3. **Registro** `/register`
```typescript
interface RegisterForm {
  // Auth
  email: string;
  password: string;
  passwordConfirm: string;
  
  // Perfil obligatorio
  firstName: string;
  lastName: string;
  dni: string;           // 8 dígitos
  phone: string;
  domicilio: string;
  localidad: string;     // Select con opciones
  provincia: string;     // Select con opciones
  
  // Académico
  courseIds: number[];   // Multi-select
  skillIds: number[];    // Multi-select (opcional)
}
```
- Form largo con secciones
- Validaciones en tiempo real
- Progress indicator
- "Ya tengo cuenta" link

#### 4. **Ofertas** `/offers`
```typescript
interface OfferListItem {
  id: number;
  title: string;
  company: { id: number; name: string; logo: string };
  status: 'ACTIVE';
  publishedAt: string;
  expiresAt: string;
  skills: Array<{ id: number; name: string }>;
}
```
- Lista con paginación
- Filtros:
  - Búsqueda por texto
  - Por empresa
  - Por skills
  - Por fecha de publicación
- Ordenamiento (más recientes, por cerrar pronto)
- Card preview de cada oferta
- Click → detalle

#### 5. **Detalle Oferta** `/offers/:id`
```typescript
interface OfferDetail {
  id: number;
  title: string;
  description: string;  // Markdown
  company: {
    id: number;
    name: string;
    logo: string;
    description: string;
    website: string;
  };
  status: 'ACTIVE';
  publishedAt: string;
  expiresAt: string;
  skills: Array<{ id: number; name: string; category: string }>;
  requiredDocuments: Array<{ documentTypeId: number; name: string }>;
}
```
- Toda la info de la oferta
- Company info con logo
- Skills como badges
- Documentos requeridos listados
- **Botón "Postularme"** (si autenticado)
  - Si no autenticado → redirigir a login
  - Si ya postuló → mostrar "Ya te postulaste"

---

### Autenticadas (Estudiante)

#### 6. **Mi Perfil** `/profile`
- Ver todos los datos del perfil
- Editar campos permitidos:
  - Email ⚠️ (requiere verificación si se implementa)
  - Phone
  - Domicilio
  - Localidad
  - Provincia
  - Bio
  - Skills (agregar/quitar)
  - Carreras (agregar/quitar)
- Campos NO editables (requieren admin):
  - firstName, lastName, DNI
- Sección de seguridad:
  - Cambiar contraseña (futuro)
  
#### 7. **Mis Documentos** `/documents`
```typescript
interface DocumentListItem {
  id: number;
  documentType: { id: number; name: string };
  originalName: string;
  fileSize: number;
  createdAt: string;
  lastUsedAt: string;
}
```
- Lista de documentos subidos
- Filtro por tipo
- Ver preview (si es imagen/PDF)
- Descargar
- **NO se puede borrar** (mencionar: "se eliminan automáticamente")
- Botón "Subir documento"

#### 8. **Subir Documento** `/documents/upload`
```typescript
interface UploadForm {
  documentTypeId: number;  // Select
  file: File;
}
```
- Select tipo de documento
- File picker (arrastra o click)
- Validaciones:
  - Max 10MB
  - Solo PDF, DOC, DOCX, JPG, PNG
- Progress bar de upload
- Success → redirect a /documents

#### 9. **Crear Borrador** `/offers/:offerId/apply`
```typescript
interface DraftState {
  offerId: number;
  offerTitle: string;
  requiredDocuments: Array<{
    documentTypeId: number;
    name: string;
    uploaded: boolean;
    documentId?: number;
  }>;
  completedCount: number;
  totalCount: number;
}
```
- Stepper o checklist de documentos requeridos
- Para cada requisito:
  - Mostrar nombre del tipo
  - **Opción A:** Subir nuevo documento
  - **Opción B:** Seleccionar documento existente (de /documents)
  - Estado: ✓ Completado / ⚠️ Pendiente
- Progress bar (X de Y documentos)
- Botón "Confirmar postulación" (solo si todo completo)
- Auto-save en backend (PATCH /draft)

#### 10. **Mis Postulaciones** `/my-applications`
```typescript
interface ApplicationListItem {
  id: number;
  offer: {
    id: number;
    title: string;
    company: { name: string; logo: string };
  };
  status: 'PENDING' | 'REVIEWING' | 'BLOCKED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
}
```
- Lista con paginación
- Filtro por status
- Color-coded status badges:
  - PENDING: amarillo
  - REVIEWING: azul
  - BLOCKED: naranja (con ícono ⚠️)
  - ACCEPTED: verde
  - REJECTED: rojo
  - CANCELLED: gris
- Click → detalle

#### 11. **Detalle Postulación** `/my-applications/:id`
```typescript
interface ApplicationDetail {
  id: number;
  offer: OfferDetail;  // Reutilizar interface
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  finalizedAt?: string;
  feedback?: string;
  documents: Array<{
    documentId: number;
    documentType: string;
    originalName: string;
  }>;
  
  // Si BLOCKED
  blockReason?: 'MISSING_DOCUMENTS';
  missingDocuments?: Array<{ id: number; name: string }>;
}
```
- Info completa de la postulación
- Timeline de estados
- Documentos adjuntos (ver/descargar)
- Feedback de empresa (si rechazada/aceptada)
- **Si BLOCKED:**
  - Banner rojo: "Documentos adicionales requeridos"
  - Botón "Completar documentos" → redirect a draft

#### 12. **Notificaciones** `/notifications`
```typescript
interface NotificationListItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;  // applicationId, offerId, etc
  isRead: boolean;
  createdAt: string;
}
```
- Lista con paginación
- Filtro: "Solo no leídas"
- Click en notificación:
  - Marca como leída
  - Navega a recurso relacionado (si relatedId existe)
- Botón "Marcar todas como leídas"
- Delete individual

---

### Autenticadas (Admin)

#### 13. **Dashboard Admin** `/admin`
- Stats generales:
  - Total usuarios (estudiantes)
  - Total empresas
  - Total ofertas (activas/cerradas)
  - Total postulaciones (pending/accepted/rejected)
- Gráficos (futuro):
  - Postulaciones por mes
  - Ofertas más populares
- Links rápidos a secciones

#### 14. **Gestión Usuarios** `/admin/users`
- Tabla con paginación
- Columnas: ID, Nombre, Email, Carreras, Status (activo/eliminado)
- Filtros: por carrera, por localidad
- Acciones:
  - Ver detalle
  - Editar
  - Eliminar (con warning)
  
#### 15. **Gestión Empresas** `/admin/companies`
- Tabla con paginación
- Columnas: ID, Nombre, Email, Verificada, Ofertas activas
- Acciones:
  - Ver detalle
  - Editar
  - Verificar/desverificar
  - Soft delete

#### 16. **Gestión Ofertas** `/admin/offers`
- Tabla con paginación
- Columnas: ID, Título, Empresa, Status, Fecha publicación, Expira
- Filtros: por status, por empresa
- Acciones:
  - Ver detalle
  - Editar
  - Publicar (DRAFT → ACTIVE)
  - Cerrar (ACTIVE → CLOSED)
  - Soft delete

#### 17. **Crear/Editar Oferta** `/admin/offers/new` `/admin/offers/:id/edit`
```typescript
interface OfferForm {
  companyId: number;
  title: string;
  description: string;     // Markdown editor
  expiresAt?: Date;
  
  requiredDocumentIds: number[];  // Multi-select
  skillIds: number[];             // Multi-select
  
  // Campos custom (baja prioridad)
  customFields?: CustomField[];
}
```
- Form completo
- Markdown editor para descripción
- Date picker para expiración
- Multi-select para docs requeridos
- Multi-select para skills
- Botón "Guardar como borrador" vs "Publicar"

#### 18. **Gestión Postulaciones** `/admin/applications`
- Tabla con paginación
- Columnas: ID, Estudiante, Oferta, Empresa, Status, Fecha
- Filtros: por status, por oferta, por empresa
- Acciones:
  - Ver detalle
  - Cambiar status

#### 19. **Detalle Postulación Admin** `/admin/applications/:id`
- Info completa del estudiante (todos los datos)
- Info completa de la oferta
- Documentos adjuntos (ver/descargar todos)
- Cambiar status:
  - PENDING → REVIEWING
  - REVIEWING → ACCEPTED/REJECTED
- Form para feedback (si rechaza/acepta)
- Historial de cambios (futuro)

#### 20. **Gestión Catálogos** `/admin/catalogs`
Tabs para:
- **Carreras:** CRUD básico
- **Skills:** CRUD + Merge functionality
- **Tipos de Documento:** CRUD (no borrar si en uso)

#### 21. **Broadcast Notificación** `/admin/notifications/broadcast`
```typescript
interface BroadcastForm {
  title: string;
  message: string;
  userIds?: number[];  // Multi-select, vacío = todos los alumnos (role STUDENT)
}
```
- Form simple
- Multi-select de usuarios (opcional)
- Preview de mensaje
- Botón "Enviar"

---

## 🎨 Componentes Reutilizables

### Core UI
```
<Button> - Variants: primary, secondary, danger, ghost
<Input> - Con validaciones
<Select> - Single y multi-select
<DatePicker>
<FileUpload> - Con drag & drop
<Table> - Con sort, paginación
<Pagination> - Cursor-based
<Modal>
<Toast> - Notificaciones temporales
<Badge> - Para status
<Card>
<Tabs>
<Spinner> - Loading states
```

### Business Components
```
<OfferCard> - Preview de oferta
<ApplicationStatusBadge> - Status colorido
<DocumentList> - Lista de documentos
<SkillBadge> - Skill con color por categoría
<ProgressBar> - Para draft completion
<Timeline> - Para historial de application
<MarkdownEditor> - Para descripciones
<NotificationBell> - Badge con count
```

---

## 🔔 Notificaciones en Tiempo Real

### Opción A: WebSocket (recomendada si implementas)
```typescript
import { useEffect } from 'react';
import { socket } from './socket';

function useNotifications(userId: number) {
  useEffect(() => {
    socket.connect();
    socket.emit('subscribe', `user:${userId}:notifications`);
    
    socket.on('notification', (data) => {
      // Mostrar toast
      toast.success(data.title);
      // Actualizar badge count
      incrementNotificationCount();
    });
    
    return () => socket.disconnect();
  }, [userId]);
}
```

### Opción B: Polling (más simple para MVP)
```typescript
import { useEffect } from 'react';

function useNotificationPolling() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/v1/notifications?unreadOnly=true&limit=1');
      const data = await res.json();
      
      // Actualizar badge
      setUnreadCount(data.pagination.total);
    }, 10000);  // Cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);
}
```

---

## 📊 Estado Global (Zustand)

```typescript
// stores/auth.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({ user: res.data.user, isAuthenticated: true });
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  },
  
  updateProfile: async (data) => {
    const res = await api.patch('/profile', data);
    set({ user: res.data });
  }
}));

// stores/notifications.ts
interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
}

// stores/draft.ts
interface DraftState {
  currentDraft: Draft | null;
  loadDraft: (offerId: number) => Promise<void>;
  uploadDocument: (reqDocId: number, file: File) => Promise<void>;
  confirmApplication: () => Promise<void>;
}
```

---

## 🎯 Prioridades de Implementación Frontend

### Sprint 1-2 (Semanas 1-4)
- ✅ Setup (React + TypeScript + Vite)
- ✅ Routing básico
- ✅ Auth (login, registro)
- ✅ Layout base (header, sidebar si admin)
- ✅ Componentes UI core

### Sprint 3-4 (Semanas 5-8)
- ✅ Ofertas públicas (lista + detalle)
- ✅ Mi perfil
- ✅ Mis documentos + upload
- ✅ Crear borrador + postular

### Sprint 5-6 (Semanas 9-12)
- ✅ Mis postulaciones
- ✅ Notificaciones básicas (polling)
- ✅ Admin dashboard
- ✅ Admin gestión usuarios/empresas

### Sprint 7-8 (Semanas 13-16)
- ✅ Admin gestión ofertas (CRUD completo)
- ✅ Admin gestión postulaciones
- ✅ Admin catálogos
- ✅ Polish y UX improvements

### Post-MVP
- WebSockets para notificaciones
- Campos custom UI
- Email verification
- Analytics dashboard

---

## ✅ Checklist de Páginas por Rol

### Público
- [x] Landing page
- [x] Login
- [x] Registro
- [x] Ofertas (lista)
- [x] Oferta (detalle)

### Estudiante (5 páginas core)
- [x] Mi perfil
- [x] Mis documentos
- [x] Crear postulación (draft)
- [x] Mis postulaciones
- [x] Notificaciones

### Admin (8 páginas core)
- [x] Dashboard
- [x] Gestión usuarios
- [x] Gestión empresas
- [x] Gestión ofertas (+ crear/editar)
- [x] Gestión postulaciones (+ detalle)
- [x] Gestión catálogos
- [x] Broadcast notificación

**Total: ~21 páginas/vistas principales**

