# Política de Retención de Datos

## Objetivo

Definir reglas claras sobre qué datos se eliminan, cuándo y bajo qué condiciones, priorizando la privacidad del usuario y la funcionalidad del sistema. La política se centra en hard deletes directos, sin soft deletes innecesarios, delegando auditoría a desarrollos futuros.

## Principios generales

- **Minimizar complejidad**: hard delete directo, sin soft deletes ni campos de auditoría en cada tabla
- **Datos encriptados por defecto**: User data ya está protegido, no requiere anonimización adicional
- **Funcionalidad primero**: mantener datos necesarios para que el sistema funcione correctamente
- **Auditoría futura**: no implementar logs de auditoría ahora, dejar como propuesta para desarrollo futuro

## Política por entidad

### `Session`
**Retención**: Ninguna tras expiración  
**Eliminación**: Job diario (02:00h) elimina sessions con `expiresAt < now()`  
**Razón**: No contienen datos sensibles, solo tokens de sesión

### `Draft`
**Retención**: 30 días desde última actualización  
**Eliminación**: Job diario (03:00h) elimina drafts con `updatedAt > 30 días`  
**Usuario puede**: Borrar sus propios drafts manualmente en cualquier momento  
**Razón**: Borradores abandonados no aportan valor

### `Document`
**Retención**: Mientras tenga referencias O sea el último de su tipo  
**Eliminación**: Job diario (04:00h) con lógica:
1. No eliminar si tiene referencias en `DocumentAttachment` (solicitudes pendientes/aceptadas)
2. No eliminar si es el último documento del tipo para ese usuario (para reutilización)
3. Solo eliminar documentos sin referencias Y con otro más reciente del mismo tipo

**Usuario NO puede**: Borrar documentos directamente (no existe opción en UI)  
**Razón**: El usuario necesita reutilizar documentos en futuras postulaciones

### `Application`
**Retención**: Permanente mientras el usuario exista  
**Eliminación**: Solo cuando se elimina el usuario (cascada)  
**Estados finales**: Todas las applications (ACCEPTED, REJECTED, CANCELLED) permanecen en el historial  
**Razón**: Historial completo de postulaciones del usuario, incluyendo rechazos como aprendizaje

### `User`
**Retención**: Hasta solicitud de borrado + período de gracia  
**Eliminación**: 
1. Usuario solicita borrado → se marca `scheduledForDeletion = now() + 30d`
2. Se desactiva cuenta inmediatamente (login deshabilitado)
3. Job diario (05:00h) elimina usuarios con `scheduledForDeletion < now()`
4. Cascada elimina: applications, documents, drafts, sessions, notifications, tokens

**Campo**: `scheduledForDeletion` (reemplaza `anonymizedAt`)  
**Razón**: Datos ya están encriptados, no necesita anonimización. Hard delete directo tras período de gracia.

### `Notification`
**Retención**: 90 días desde creación  
**Eliminación**: Job diario (06:00h) elimina notifications con `createdAt > 90 días`  
**Usuario puede**: Marcar como leída o borrar individualmente  
**Razón**: Notificaciones antiguas pierden relevancia

### `Company` / `Offer`
**Retención**: A discreción del administrador  
**Eliminación**: Solo manual por admin  
**Razón**: Datos críticos del negocio, requieren decisión humana

## Jobs de limpieza automática

```
02:00 - Limpiar sesiones expiradas
03:00 - Eliminar drafts abandonados (>30d)
04:00 - Eliminar documentos huérfanos (verificar referencias + último por tipo)
05:00 - Eliminar usuarios programados (scheduledForDeletion)
06:00 - Eliminar notificaciones antiguas (>90d)
```

## Plazos configurables (variables de entorno)

```
DRAFT_RETENTION_DAYS=30
NOTIFICATION_RETENTION_DAYS=90
USER_DELETION_GRACE_DAYS=30
```

## Operaciones del usuario

**Puede hacer**:
- Solicitar borrado de cuenta (desactiva inmediatamente, borra en 30 días)
- Borrar drafts propios
- Borrar/marcar notificaciones individuales

**NO puede hacer**:
- Borrar documentos (se mantienen automáticamente para reutilización)
- Borrar applications (historial permanente)
- Borrar datos que afecten integridad del sistema

## Auditoría

**Estado actual**: Sin implementar  
**Propuesta futura**: Tabla `AuditLog` centralizada o base de datos separada para retención de largo plazo  
**Justificación**: Separación de responsabilidades, no complicar tablas principales con campos de auditoría

## Notas de implementación

- Todos los jobs verifican relaciones antes de eliminar (integridad referencial)
- Campo `scheduledForDeletion` solo en `User` (única entidad con período de gracia)
- Sin campos `deletedAt`, `hiddenAt`, `archived` en ninguna tabla
- Cascadas DB configuradas correctamente para eliminación en cadena
