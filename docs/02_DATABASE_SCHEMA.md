# Schema de Base de Datos - Sistema de Pasantías

## 📊 Diagrama Entidad-Relación Resumido

```
User (1) ──< (N) Document
User (1) ──< (N) ApplicationDraft
User (1) ──< (N) Application
User (1) ──< (N) Session
User (1) ──< (N) Notification

User (N) ──< (N) Course [UserCourse]
User (N) ──< (N) Skill [ProfileSkill]

Company (1) ──< (N) Offer

Offer (N) ──< (N) Skill [OfferSkill]
Offer (1) ──< (N) RequiredDocument (N) ──> (1) DocumentType
Offer (1) ──< (N) ApplicationDraft
Offer (1) ──< (N) Application

ApplicationDraft (1) ──< (N) DraftDocument (N) ──> (1) Document
Application (1) ──< (N) ApplicationDocument (N) ──> (1) Document

Document (N) ──> (1) DocumentType
```

---

## 📋 Schema Prisma Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// USUARIOS Y AUTENTICACIÓN
// ==========================================

model User {
  id              Int      @id @default(autoincrement())
  
  // Autenticación
  emailHash       String   @unique @db.VarChar(64)  // SHA256 para buscar sin desencriptar
  email           String   @db.Text                 // Encriptado (AES-256-GCM)
  password        String   @db.VarChar(255)         // Bcrypt hash
  role            UserRole @default(STUDENT)
  
  // Perfil obligatorio
  firstName       String   @db.Text                 // Encriptado
  lastName        String   @db.Text                 // Encriptado
  dni             String   @db.Text                 // Encriptado (8 dígitos)
  phone           String   @db.Text                 // Encriptado
  domicilio       String   @db.Text                 // Encriptado (calle y número)
  
  // Ubicación (plain text para filtrar)
  localidad       String   @db.VarChar(100)         // NO encriptado
  provincia       String   @db.VarChar(100)         // NO encriptado
  
  // Perfil académico opcional
  bio             String?  @db.Text
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?
  anonymizedAt    DateTime?
  
  // Relaciones
  courses         UserCourse[]                      // N-N: Usuario en múltiples carreras
  skills          ProfileSkill[]
  documents       Document[]
  drafts          ApplicationDraft[]
  applications    Application[]
  sessions        Session[]
  notifications   Notification[]
  
  @@index([emailHash])
  @@index([provincia, localidad])
}

enum UserRole {
  STUDENT
  ADMIN
}

model Session {
  id             String   @id @default(cuid())
  userId         Int
  createdAt      DateTime @default(now())
  lastActivityAt DateTime @default(now())  // Para sliding/renewal
  expiresAt      DateTime
  ipAddress      String?  @db.VarChar(45)   // IPv6 compatible
  userAgent      String?  @db.Text
  
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
  @@index([lastActivityAt])
}

// ==========================================
// CATÁLOGOS
// ==========================================

model Course {
  id          Int      @id @default(autoincrement())
  name        String   @unique @db.VarChar(200)
  description String?  @db.Text
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       UserCourse[]
}

model UserCourse {
  userId   Int
  courseId Int
  
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@id([userId, courseId])
  @@index([userId])
  @@index([courseId])
}

model Skill {
  id          Int      @id @default(autoincrement())
  name        String   @unique @db.VarChar(200)
  description String?  @db.Text
  category    String?  @db.VarChar(100)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  profiles    ProfileSkill[]
  offers      OfferSkill[]
}

model ProfileSkill {
  userId      Int
  skillId     Int
  
  user        User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  skill       Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)
  
  @@id([userId, skillId])
  @@index([userId])
  @@index([skillId])
}

model DocumentType {
  id              Int      @id @default(autoincrement())
  name            String   @unique @db.VarChar(200)
  description     String?  @db.Text
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  documents       Document[]
  requiredDocs    RequiredDocument[]
}

// ==========================================
// EMPRESAS Y OFERTAS
// ==========================================

model Company {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(200)
  description String?  @db.Text
  website     String?  @db.VarChar(500)
  email       String   @unique @db.VarChar(255)
  phone       String?  @db.VarChar(50)
  logo        String?  @db.VarChar(500)
  
  verified    Boolean  @default(false)
  verifiedAt  DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  offers      Offer[]
  
  @@index([verified])
  @@index([email])
}

model Offer {
  id              Int         @id @default(autoincrement())
  companyId       Int
  title           String      @db.VarChar(200)
  description     String      @db.Text
  status          OfferStatus @default(DRAFT)
  
  publishedAt     DateTime?
  expiresAt       DateTime?
  closedAt        DateTime?
  
  // Campos custom dinámicos (baja prioridad)
  customFieldsSchema Json?    // Definición de campos adicionales
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
  
  company         Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  requiredDocs    RequiredDocument[]
  skills          OfferSkill[]
  drafts          ApplicationDraft[]
  applications    Application[]
  
  @@index([companyId])
  @@index([status])
  @@index([status, publishedAt])
  @@index([expiresAt])
}

enum OfferStatus {
  DRAFT
  ACTIVE
  CLOSED
  EXPIRED
}

model OfferSkill {
  offerId     Int
  skillId     Int
  
  offer       Offer @relation(fields: [offerId], references: [id], onDelete: Cascade)
  skill       Skill @relation(fields: [skillId], references: [id], onDelete: Cascade)
  
  @@id([offerId, skillId])
  @@index([offerId])
  @@index([skillId])
}

model RequiredDocument {
  offerId         Int
  documentTypeId  Int
  
  offer           Offer        @relation(fields: [offerId], references: [id], onDelete: Cascade)
  documentType    DocumentType @relation(fields: [documentTypeId], references: [id], onDelete: Restrict)
  
  draftDocuments  DraftDocument[]
  appDocuments    ApplicationDocument[]
  
  @@id([offerId, documentTypeId])
  @@index([offerId])
  @@index([documentTypeId])
}

// ==========================================
// DOCUMENTOS
// ==========================================

model Document {
  id                   Int      @id @default(autoincrement())
  userId               Int
  documentTypeId       Int
  originalName         String   @db.VarChar(255)
  
  // Path con UUID para anonimato
  // Ej: /uploads/documents/2025/11/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
  path                 String   @unique @db.VarChar(500)
  
  fileSize             Int?
  
  createdAt            DateTime @default(now())
  lastUsedAt           DateTime @default(now())
  scheduledForDeletion DateTime?
  
  // Integración universitaria (baja prioridad)
  source               DocumentSource @default(USER_UPLOAD)
  externalId           String?  @db.VarChar(200)
  verifiedAt           DateTime?
  verifiedBy           Int?
  
  user                 User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  documentType         DocumentType @relation(fields: [documentTypeId], references: [id], onDelete: Restrict)
  verifier             User?        @relation("DocumentVerifier", fields: [verifiedBy], references: [id])
  
  draftDocuments       DraftDocument[]
  applicationDocuments ApplicationDocument[]
  
  @@index([userId])
  @@index([userId, documentTypeId])
  @@index([scheduledForDeletion])
}

// ==========================================
// BORRADORES DE POSTULACIÓN
// ==========================================

model ApplicationDraft {
  userId      Int
  offerId     Int
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  expiresAt   DateTime?
  
  // Valores de campos custom en draft (baja prioridad)
  customFieldsValues Json?
  
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  offer       Offer            @relation(fields: [offerId], references: [id], onDelete: Cascade)
  documents   DraftDocument[]
  
  @@id([userId, offerId])
  @@index([userId])
  @@index([offerId])
  @@index([updatedAt])
  @@index([expiresAt])
}

model DraftDocument {
  userId          Int
  offerId         Int
  documentId      Int
  documentTypeId  Int
  
  draft           ApplicationDraft @relation(fields: [userId, offerId], references: [userId, offerId], onDelete: Cascade)
  document        Document         @relation(fields: [documentId], references: [id], onDelete: Cascade)
  required        RequiredDocument @relation(fields: [offerId, documentTypeId], references: [offerId, documentTypeId])
  
  @@id([userId, offerId, documentId])
  @@unique([userId, offerId, documentTypeId])
  @@index([userId, offerId])
  @@index([documentId])
}

// ==========================================
// POSTULACIONES
// ==========================================

model Application {
  id              Int               @id @default(autoincrement())
  userId          Int
  offerId         Int
  status          ApplicationStatus @default(PENDING)
  
  appliedAt       DateTime          @default(now())
  reviewedAt      DateTime?
  finalizedAt     DateTime?
  acceptedAt      DateTime?
  rejectedAt      DateTime?
  startDate       DateTime?
  endDate         DateTime?
  feedback        String?           @db.Text
  
  // Bloqueo por cambios en requisitos
  blockReason     String?           @db.VarChar(100)
  blockedAt       DateTime?
  unblockedAt     DateTime?
  
  // Valores de campos custom (baja prioridad)
  customFieldsValues Json?          // Valores completados por usuario
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  offer           Offer                 @relation(fields: [offerId], references: [id], onDelete: Cascade)
  documents       ApplicationDocument[]
  
  @@unique([userId, offerId])
  @@index([userId])
  @@index([offerId])
  @@index([status])
  @@index([status, updatedAt])
  @@index([appliedAt])
}

enum ApplicationStatus {
  PENDING
  REVIEWING
  BLOCKED      // Requiere acción del usuario (ej: documentos adicionales)
  ACCEPTED
  REJECTED
  CANCELLED
}

model ApplicationDocument {
  applicationId   Int
  documentId      Int
  offerId         Int
  documentTypeId  Int
  uploadedAt      DateTime @default(now())
  
  application     Application      @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  document        Document         @relation(fields: [documentId], references: [id], onDelete: Cascade)
  required        RequiredDocument @relation(fields: [offerId, documentTypeId], references: [offerId, documentTypeId])
  
  @@id([applicationId, documentId])
  @@unique([applicationId, offerId, documentTypeId])
  @@index([applicationId])
  @@index([documentId])
}

// ==========================================
// NOTIFICACIONES
// ==========================================

model Notification {
  id         Int                @id @default(autoincrement())
  userId     Int
  type       NotificationType
  title      String             @db.VarChar(200)
  message    String             @db.Text
  relatedId  Int?
  
  isRead     Boolean            @default(false)
  readAt     DateTime?
  createdAt  DateTime           @default(now())
  
  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isRead])
  @@index([userId, createdAt])
}

enum NotificationType {
  APPLICATION_SUBMITTED
  APPLICATION_ACCEPTED
  APPLICATION_REJECTED
  OFFER_PUBLISHED
  OFFER_CLOSING_SOON
  ADMIN_ANNOUNCEMENT
}
```

---

## 📝 Notas de Diseño

### Claves Compuestas

**RequiredDocument**: `@@id([offerId, documentTypeId])`
- Representa la relación pura entre Offer y DocumentType
- No necesita id propio

**ApplicationDraft**: `@@id([userId, offerId])`
- Solo puede haber un borrador por usuario-oferta
- Simplifica queries

**DraftDocument**: `@@id([userId, offerId, documentId])`
- Combina la clave del draft padre con el documento
- `@@unique([userId, offerId, documentTypeId])` asegura un documento por requisito

**ApplicationDocument**: `@@id([applicationId, documentId])`
- Similar a DraftDocument pero para applications confirmadas

### OnDelete Behaviors

| Relación | Behavior | Razón |
|----------|----------|-------|
| User → Document | CASCADE | Documentos pertenecen al usuario |
| User → Application | CASCADE | Postulaciones pertenecen al usuario |
| User → Session | CASCADE | Sessions inválidas sin usuario |
| Offer → Application | CASCADE | Sin oferta, no tiene sentido la aplicación |
| DocumentType → Document | RESTRICT | No borrar tipos en uso |
| DocumentType → RequiredDocument | RESTRICT | No borrar tipos requeridos por ofertas |
| Course → User | SET NULL | Usuario puede no tener carrera |
| Skill → ProfileSkill | CASCADE | Borra relación, no usuario |
| Skill → OfferSkill | CASCADE | Borra relación, no oferta |

### Índices Importantes

**Performance en queries frecuentes:**
- `User(email)` - Login
- `Application(userId, status)` - "Mis postulaciones pendientes"
- `Application(offerId, status)` - "Postulantes de esta oferta"
- `Offer(status, publishedAt)` - "Ofertas activas ordenadas"
- `Document(scheduledForDeletion)` - Job de cleanup
- `Session(expiresAt)` - Job de limpieza
- `Notification(userId, isRead)` - "Mis notificaciones no leídas"

### Timestamps

**Tienen createdAt/updatedAt:**
- User, Company, Offer, Application, ApplicationDraft
- Course, Skill, DocumentType (catálogos)
- Document, Session

**Solo createdAt:**
- Notification (no se editan)

**Sin timestamps:**
- ProfileSkill, OfferSkill (relaciones N-N simples)
- RequiredDocument (configuración estática)
- DraftDocument, ApplicationDocument (lifecycle de parent)

---

## 🔄 Ciclos de Vida

### Document Lifecycle

```
1. Upload
   - createdAt = now()
   - lastUsedAt = now()
   - scheduledForDeletion = null

2. Usado en Draft
   - DraftDocument creado
   - lastUsedAt actualizado

3. Usado en Application
   - ApplicationDocument creado
   - lastUsedAt actualizado

4. Application finaliza (ACCEPTED/REJECTED)
   - ApplicationDocument borrado
   - Si no quedan referencias:
     scheduledForDeletion = now() + 30 días

5. Job de cleanup
   - Si scheduledForDeletion < now():
     * Borrar archivo físico
     * DELETE Document
```

### Application Lifecycle

```
DRAFT (ApplicationDraft)
   ↓ (confirmar)
PENDING (Application.status)
   ↓ (admin revisa)
REVIEWING (opcional)
   ↓ (admin decide)
ACCEPTED ─┐
REJECTED  ├─→ finalizedAt = now()
CANCELLED ┘   → Trigger: borrar ApplicationDocument
              → Marcar Documents huérfanos
```

### Offer Lifecycle

```
DRAFT
   ↓ (admin publica)
ACTIVE (publishedAt = now())
   ↓ (job automático si expiresAt < now() O admin cierra)
EXPIRED / CLOSED (closedAt = now())
```

---

## 🔍 Queries Comunes Optimizadas

### "Mis postulaciones activas"
```sql
SELECT * FROM Application
WHERE userId = ? AND status IN ('PENDING', 'REVIEWING')
ORDER BY appliedAt DESC
-- Usa índice: Application(userId, status)
```

### "Ofertas activas"
```sql
SELECT * FROM Offer
WHERE status = 'ACTIVE' AND deletedAt IS NULL
ORDER BY publishedAt DESC
-- Usa índice: Offer(status, publishedAt)
```

### "Documentos por borrar"
```sql
SELECT * FROM Document
WHERE scheduledForDeletion < NOW()
-- Usa índice: Document(scheduledForDeletion)
```

### "Notificaciones no leídas"
```sql
SELECT * FROM Notification
WHERE userId = ? AND isRead = false
ORDER BY createdAt DESC
-- Usa índice: Notification(userId, isRead)
```

---

## 📊 Estadísticas Estimadas

### Crecimiento esperado (por año académico):
- Users: ~500 estudiantes nuevos
- Companies: ~50 empresas
- Offers: ~200 ofertas
- Applications: ~2000 postulaciones
- Documents: ~4000 archivos (promedio 2 por postulación)

### Tamaños de tabla (estimado tras 3 años):
- User: ~1500 filas
- Application: ~6000 filas (mantener todas)
- Document: ~2000 filas activas (cleanup automático)
- Notification: ~15000 filas (promedio 10 por usuario)

### Consideraciones:
- Documents se auto-limpia (scheduledForDeletion)
- Applications no se borran (historial valioso)
- Notification podría necesitar archivado futuro

---

## 🚀 Migraciones Futuras Posibles

### Si crece mucho:
1. **Particionar Applications por año**
   ```sql
   CREATE TABLE Application_2025 PARTITION OF Application
   FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
   ```

2. **Soft delete de Applications antiguas**
   - Agregar `deletedAt` a Applications
   - Archivar rechazos tras 2 años

3. **Tabla separada para archivos grandes**
   - Document → solo metadata
   - DocumentBlob → datos binarios (si no usas filesystem)

4. **Full-text search**
   ```sql
   ALTER TABLE Offer ADD COLUMN search_vector tsvector;
   CREATE INDEX offer_search_idx ON Offer USING GIN(search_vector);
   ```

