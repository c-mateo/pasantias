# Cambios de esquema sugeridos para políticas de retención

Propósito: listar de forma precisa las tablas/modelos Prisma que recomiendo modificar y los campos a añadir para soportar soft-delete, scheduled deletion, archivado, anonimización y auditoría.

NOTA: las declaraciones abajo están en sintaxis Prisma (fragmentos). Antes de ejecutar migraciones, revisar conflictos con constraints y añadir índices donde proceda.

---

## 1) `User` (tabla `User`)

Campos a añadir / ajustar:

```prisma
model User {
  // campos existentes...
  deletedAt         DateTime?       // cuándo se marcó borrado (soft-delete)
  deletedBy         Int?            // actor que solicitó/eliminó (userId or admin id)
  deletionReason    String?         @db.VarChar(255)
  deletionRequested Boolean  @default(false) // usuario solicitó borrado
  deletionRequestedAt DateTime?
  anonymizedAt      DateTime?       // ya existente: cuándo se anonimizaron PII
  retentionReason   String?         @db.VarChar(255) // motivo de retención adicional (legal hold)
}

@@index([deletedAt])
@@index([deletionRequested])
```

Motivo: `anonymizedAt` indica cuándo se reemplazaron/anonimizaron los campos PII sin borrar la fila; `deletedAt` diferencia soft-delete (ocultar en UI) de anonimización. `deletionRequested` sirve para flujos de verificación antes de anonimizar/hard-delete.

---

## 2) `Document`

Actualmente el modelo ya tiene `scheduledForDeletion` y `hiddenAt`. Recomiendo estandarizar y añadir metadatos:

```prisma
model Document {
  // existentes...
  deletedAt            DateTime?   // cuándo se marcó soft-delete (alias de hiddenAt)
  deletedBy            Int?
  deletionReason       String?
  scheduledForDeletion DateTime?   // ya existe
  retentionHold         Boolean @default(false) // impide borrado por job
}

@@index([scheduledForDeletion])
@@index([deletedAt])
```

Motivo: claridad semántica y posibilidad de auditoría. `retentionHold` se usa para legal hold / investigaciones.

---

## 3) `Application` (postulaciones)

Agregar campos para archivado y retención:

```prisma
model Application {
  // existentes...
  archived            Boolean  @default(false)
  archivedAt          DateTime?
  archivedBy          Int?
  scheduledForDeletion DateTime?
  retentionReason     String?
  deletedAt           DateTime?    // opcional: soft-delete explícito
}

@@index([archived])
@@index([scheduledForDeletion])
```

Motivo: separar `ACCEPTED` (que se mantiene visible) de rejected/expired (que se archivan y luego se eliminan). `archived` permite excluir registros de listados por defecto sin perder datos para auditoría.

---

## 4) `Draft`

Los drafts pueden borrarse por antigüedad, pero para uniformidad se puede añadir:

```prisma
model Draft {
  // existentes...
  deletedAt            DateTime?
  scheduledForDeletion DateTime?
}

@@index([scheduledForDeletion])
```

Motivo: si se quiere permitir que usuario borre borradores explícitamente o marque para eliminación; si no, los jobs pueden seguir basándose en `updatedAt`.

---

## 5) `DocumentAttachment` / relaciones

No es obligatorio agregar campos aquí, pero los jobs deben comprobar `DocumentAttachment` para ver si un `Document` tiene referencias antes de hard-delete.

---

## 6) Nuevo modelo sugerido: `AuditLog`

Registrar toda operación de borrado/anonimización/archivado:

```prisma
model AuditLog {
  id         Int      @id @default(autoincrement())
  actorId    Int?     // user/admin/system
  actorType  String?  // "USER" | "ADMIN" | "SYSTEM"
  action     String   // e.g. "DOCUMENT_MARKED_DELETED", "USER_ANONYMIZED"
  targetType String   // e.g. "Document", "User", "Application"
  targetId   Int?
  details    Json?
  createdAt  DateTime @default(now())
}

@@index([actorId])
@@index([targetType, targetId])
```

Motivo: trazabilidad completa y prueba de acciones sensibles.

---

## 7) (Opcional) `LegalHold`

Si el producto requiere soporte de retenciones legales por expediente, puede crearse una tabla que apunte a recursos:

```prisma
model LegalHold {
  id         Int      @id @default(autoincrement())
  targetType String   // tabla
  targetId   Int
  reason     String?
  createdAt  DateTime @default(now())
  expiresAt  DateTime?
}

@@unique([targetType, targetId])
```

Jobs y lógica deben respetar `LegalHold` y los flags `retentionHold`/`retentionReason`.

---

## Índices y performance

- Indexar `scheduledForDeletion`, `deletedAt`, `archived` para que los jobs y queries de limpieza sean eficientes.  
- Para tablas grandes (`Application`, `Document`) preferir ranges y paginación en jobs (p. ej. `LIMIT 1000`) para evitar locks largos.

## Consideraciones de migración

- Añadir campos con `@default` neutro (ej. `Boolean @default(false)`) para evitar downtime.  
- Crear migración que añade columnas y luego, en una segunda migración, backfill si se necesita valores derivados.  
- Revisar constraints `onDelete` en relaciones (no forzar cascades que borren documentos automáticamente sin comprobar referencias).  

## Ejemplo de jobs (resumen)

- Job diario 02:00 → borrar `Session` expiradas (`expiresAt < now()`).  
- Job diario 03:00 → borrar `Draft` si `updatedAt < now() - INTERVAL '30 days'` o `scheduledForDeletion < now()`.  
- Job diario 04:00 → procesar `Document` con `scheduledForDeletion < now()`: verificar `DocumentAttachment` y `LegalHold`; si no tiene referencias y no hay hold → borrar archivo storage + hard-delete fila + crear `AuditLog`.

---

Si querés, ahora puedo generar el diff exacto para `prisma/schema.prisma` proponiendo las líneas a insertar (sin aplicar migraciones). ¿Querés que lo haga? 
