# Manual de Usuario - Sistema de Pasantías

**Versión:** 0.1.0  
**Fecha:** Febrero 2026

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos](#requisitos)
3. [Cómo iniciar](#cómo-iniciar)
4. [Funcionalidades por Rol](#funcionalidades-por-rol)
   - [Estudiante](#estudiante)
   - [Administrador](#administrador)
5. [Flujos Principales](#flujos-principales)
6. [Errores Comunes](#errores-comunes)
7. [Limitaciones](#limitaciones)
8. [Soporte](#soporte)

---

## Introducción

El **Sistema de Pasantías** es una plataforma web que conecta estudiantes con empresas que ofrecen oportunidades de pasantías. Los estudiantes pueden:

- Ver ofertas de pasantías activas
- Postularse subiendo documentos requeridos (CV, DNI, etc.)
- Consultar el estado de sus postulaciones
- Recibir notificaciones

Los administradores pueden:

- Gestionar empresas, ofertas, carreras, skills y tipos de documentos
- Revisar postulaciones y cambiar su estado (aprobar/rechazar/bloquear)
- Enviar notificaciones a usuarios

---

## Requisitos

### Navegador Web

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14

### Cuenta

- Email válido
- Contraseña mínima de 8 caracteres

### Para postularse

- Documentos en formato PDF (máximo 10 MB cada uno)
- Conexión estable a internet

---

## Cómo iniciar

### 1. Acceder a la plataforma

Abrir el navegador y navegar a la URL de la aplicación (ej: `http://localhost:5173` en desarrollo).

(Insertar captura: Pantalla de inicio/login)

### 2. Registrarse

1. Hacer clic en **"Registrarse"** o **"Crear cuenta"**.
2. Completar el formulario:
   - Email
   - Contraseña (mínimo 8 caracteres)
   - Nombre
   - Apellido
3. Hacer clic en **"Registrarse"**.
4. Recibirás un email de bienvenida. *Nota: La verificación de email puede ser requerida en futuras versiones.*

(Insertar captura: Formulario de registro)

### 3. Iniciar sesión

1. Ingresar email y contraseña.
2. Hacer clic en **"Iniciar sesión"**.
3. Serás redirigido al dashboard según tu rol.

(Insertar captura: Formulario de login)

---

## Funcionalidades por Rol

### Estudiante

#### Dashboard

Al iniciar sesión como estudiante, verás:

- **Mis Postulaciones:** Estado de tus postulaciones actuales.
- **Ofertas Disponibles:** Listado de ofertas activas.
- **Mis Documentos:** Documentos que has subido.
- **Notificaciones:** Alertas sobre tus postulaciones.

(Insertar captura: Dashboard estudiante)

#### Ver Ofertas

1. Navegar a **"Ofertas"** o **"Buscar Pasantías"**.
2. Filtrar por:
   - Carrera
   - Habilidades
   - Ubicación
   - Empresa
3. Hacer clic en una oferta para ver detalles completos:
   - Descripción del puesto
   - Requisitos
   - Empresa (nombre, descripción, contacto)
   - Documentos requeridos
   - Duración y fecha de inicio

(Insertar captura: Lista de ofertas)

(Insertar captura: Detalle de oferta)

#### Postularse a una Oferta

**Paso 1: Crear Borrador**

1. Desde el detalle de la oferta, hacer clic en **"Postularme"** o **"Crear Borrador"**.
2. Se crea un borrador automáticamente.

**Paso 2: Subir Documentos**

1. Ir a **"Mi Borrador"** para la oferta seleccionada.
2. Por cada documento requerido (CV, DNI, etc.):
   - Hacer clic en **"Subir Documento"**.
   - Seleccionar archivo PDF (máx 10 MB).
   - Confirmar subida.
3. Opcionalmente, puedes **"Usar Documento Existente"** si ya lo habías subido antes.

(Insertar captura: Subir documento al borrador)

**Paso 3: Revisar y Enviar**

1. Verificar que todos los documentos requeridos estén adjuntos.
2. Completar campos personalizados si aplica.
3. Hacer clic en **"Enviar Postulación"**.
4. Recibirás una confirmación y una notificación.

(Insertar captura: Borrador completo listo para enviar)

#### Consultar Mis Postulaciones

1. Navegar a **"Mis Postulaciones"**.
2. Ver listado con:
   - Oferta y empresa
   - Estado (PENDING, BLOCKED, ACCEPTED, REJECTED, CANCELED)
   - Fecha de postulación
3. Hacer clic en una postulación para ver detalles:
   - Documentos adjuntos
   - Feedback del admin (si aplicó)

(Insertar captura: Lista de postulaciones)

**Estados posibles:**

- **PENDING:** En revisión
- **BLOCKED:** Requiere acción (ej: falta documento)
- **ACCEPTED:** Aprobada
- **REJECTED:** Rechazada
- **CANCELED:** Cancelada por el usuario

#### Cancelar Postulación

Si tu postulación está en estado **PENDING** o **BLOCKED**:

1. Ir a **"Mis Postulaciones"**.
2. Seleccionar la postulación.
3. Hacer clic en **"Cancelar Postulación"**.
4. Confirmar la acción.

(Insertar captura: Cancelar postulación)

#### Gestionar Mi Perfil

1. Ir a **"Perfil"** o hacer clic en tu nombre/avatar.
2. Editar información:
   - Teléfono
   - Dirección
   - Ciudad, Provincia
   - Habilidades (seleccionar de lista)
3. **Establecer CUIL:**
   - Solo se puede hacer UNA VEZ.
   - Ingresar formato `XX-XXXXXXXX-X`.
   - Para cambios posteriores, contactar al administrador.
4. **Cambiar contraseña:**
   - Ingresar contraseña actual.
   - Ingresar nueva contraseña (mín 8 caracteres).

(Insertar captura: Perfil de usuario)

#### Gestionar Mis Documentos

1. Ir a **"Mis Documentos"**.
2. Ver lista de documentos subidos.
3. Acciones disponibles:
   - **Descargar:** Obtener copia del PDF.
   - **Ocultar:** Marcar como oculto (no se elimina físicamente).

(Insertar captura: Lista de documentos)

#### Notificaciones

1. Hacer clic en el ícono de campana (🔔).
2. Ver notificaciones recientes:
   - Cambio de estado en postulación
   - Mensajes del administrador
3. Marcar como leída haciendo clic en la notificación.
4. Eliminar notificaciones antiguas.

(Insertar captura: Panel de notificaciones)

---

### Administrador

#### Dashboard Admin

Al iniciar sesión como admin, verás:

- **Estadísticas:** Total de postulaciones, ofertas activas, usuarios registrados.
- **Postulaciones Recientes:** Últimas postulaciones recibidas.
- **Accesos rápidos:** Gestión de empresas, ofertas, usuarios.

(Insertar captura: Dashboard admin)

#### Gestionar Empresas

1. Ir a **"Admin" > "Empresas"**.
2. **Crear empresa:**
   - Hacer clic en **"Nueva Empresa"**.
   - Completar: nombre, descripción, website, email, teléfono, logo (URL).
   - Guardar.
3. **Editar empresa:**
   - Seleccionar empresa.
   - Modificar campos.
   - Guardar cambios.
4. **Eliminar empresa:**
   - Seleccionar empresa.
   - Hacer clic en **"Eliminar"**.
   - Confirmar acción.

(Insertar captura: Lista de empresas)

(Insertar captura: Formulario crear/editar empresa)

#### Gestionar Ofertas

1. Ir a **"Admin" > "Ofertas"**.
2. **Crear oferta:**
   - Hacer clic en **"Nueva Oferta"**.
   - Completar información:
     - Posición
     - Descripción
     - Empresa (seleccionar de lista)
     - Estado (DRAFT o ACTIVE)
     - Vacantes
     - Ubicación, salario, duración, fecha de inicio, fecha de expiración
     - Carreras relacionadas
     - Habilidades requeridas
     - Documentos requeridos (CV, DNI, etc.)
   - Guardar.
3. **Publicar oferta:**
   - Si creaste en DRAFT, editar y cambiar estado a **ACTIVE**.
   - Se establece `publishedAt` automáticamente.
4. **Editar oferta:**
   - Seleccionar oferta.
   - Modificar campos.
   - Guardar.
5. **Cerrar oferta:**
   - Cambiar estado a **CLOSED**.
6. **Eliminar oferta:**
   - Solo si no tiene postulaciones asociadas (o depende de lógica).

(Insertar captura: Lista de ofertas admin)

(Insertar captura: Formulario crear/editar oferta)

#### Revisar Postulaciones

1. Ir a **"Admin" > "Postulaciones"**.
2. Ver listado con:
   - Usuario (nombre, email)
   - Oferta
   - Estado
   - Fecha de postulación
3. **Filtrar por:**
   - Estado (PENDING, BLOCKED, etc.)
   - Oferta
   - Usuario
4. **Revisar postulación:**
   - Hacer clic en una postulación.
   - Ver datos del usuario (CUIL, dirección, teléfono, etc.).
   - Ver documentos adjuntos.
   - Descargar documentos para revisión.
5. **Cambiar estado:**
   - Seleccionar nuevo estado:
     - **PENDING:** Volver a revisión.
     - **BLOCKED:** Bloquear (requiere razón en `blockReason`).
     - **ACCEPTED:** Aprobar.
     - **REJECTED:** Rechazar.
   - Agregar feedback (opcional).
   - Guardar.
6. El usuario recibirá una notificación automática.

(Insertar captura: Lista de postulaciones admin)

(Insertar captura: Detalle de postulación con datos del usuario)

(Insertar captura: Formulario cambiar estado)

#### Gestionar Carreras

1. Ir a **"Admin" > "Carreras"**.
2. **Crear carrera:**
   - Nombre, nombre corto (opcional), descripción (opcional).
3. **Editar/Eliminar carrera.**

(Insertar captura: Lista de carreras)

#### Gestionar Skills

1. Ir a **"Admin" > "Habilidades"** o **"Skills"**.
2. **Crear skill:** Nombre, descripción (opcional).
3. **Editar/Eliminar skill.**

(Insertar captura: Lista de skills)

#### Gestionar Tipos de Documentos

1. Ir a **"Admin" > "Tipos de Documentos"**.
2. **Crear tipo:** Nombre (ej: "Certificado de Estudios").
3. **Editar/Eliminar tipo.**

(Insertar captura: Lista de tipos de documentos)

#### Gestionar Usuarios

1. Ir a **"Admin" > "Usuarios"**.
2. Ver lista de usuarios registrados.
3. **Ver perfil de usuario:**
   - Datos personales
   - Carreras asignadas
   - Skills
   - Postulaciones
4. **Asignar carreras:**
   - Seleccionar usuario.
   - Modificar lista de carreras.
   - Guardar.
5. **Cambiar rol:**
   - Seleccionar usuario.
   - Cambiar de STUDENT a ADMIN o viceversa.
6. **Actualizar CUIL:**
   - Si un usuario necesita cambiar su CUIL después de haberlo establecido.
   - Ingresar nuevo CUIL y razón del cambio.

(Insertar captura: Lista de usuarios)

(Insertar captura: Perfil de usuario admin)

#### Enviar Notificaciones Broadcast

1. Ir a **"Admin" > "Notificaciones"** o **"Enviar Notificación"**.
2. Completar:
   - Título
   - Mensaje
   - Destinatarios:
     - **Todos los usuarios** (`all`)
     - **Usuarios específicos** (seleccionar IDs)
3. Enviar.
4. Todos los destinatarios verán la notificación en su panel.

(Insertar captura: Formulario broadcast)

---

## Flujos Principales

### Flujo Estudiante: Postularse a una Oferta

1. **Explorar ofertas** → Filtrar por carrera/habilidades → Seleccionar oferta.
2. **Crear borrador** → Subir documentos requeridos (CV, DNI, etc.).
3. **Revisar borrador** → Verificar que todo esté completo.
4. **Enviar postulación** → Confirmación y notificación.
5. **Esperar revisión** → Estado PENDING.
6. **Recibir respuesta** → Notificación de ACCEPTED/REJECTED/BLOCKED.

### Flujo Admin: Publicar Oferta y Gestionar Postulaciones

1. **Crear empresa** (si no existe).
2. **Crear oferta** → Estado DRAFT.
3. **Configurar oferta:**
   - Descripción, requisitos.
   - Carreras y skills relacionadas.
   - Documentos requeridos.
4. **Publicar oferta** → Cambiar estado a ACTIVE.
5. **Recibir postulaciones** → Revisar en "Admin > Postulaciones".
6. **Revisar candidatos:**
   - Ver documentos.
   - Descargar PDFs.
   - Evaluar perfil.
7. **Cambiar estado:**
   - ACCEPTED: Candidato aprobado.
   - REJECTED: Candidato rechazado.
   - BLOCKED: Solicitar información adicional.
8. **Notificar al candidato** (automático).

---

## Errores Comunes

### "Email ya registrado"

**Causa:** El email ingresado ya está en uso.  
**Solución:** Usar otro email o intentar recuperar contraseña.

### "Credenciales inválidas"

**Causa:** Email o contraseña incorrectos.  
**Solución:** Verificar que el email esté bien escrito y la contraseña sea correcta. Usar "Olvidé mi contraseña" si es necesario.

### "El archivo es demasiado grande"

**Causa:** El PDF excede los 10 MB.  
**Solución:** Comprimir el PDF usando herramientas online (ej: Smallpdf, iLovePDF) o reducir la calidad de las imágenes.

### "Tipo de archivo no soportado"

**Causa:** Se intentó subir un archivo que no es PDF.  
**Solución:** Convertir el documento a PDF antes de subirlo.

### "Borrador incompleto"

**Causa:** Faltan documentos requeridos.  
**Solución:** Revisar la lista de documentos requeridos y subir los faltantes antes de enviar la postulación.

### "No se puede cancelar la postulación"

**Causa:** La postulación ya fue finalizada (ACCEPTED, REJECTED, CANCELED).  
**Solución:** Solo se pueden cancelar postulaciones en estado PENDING o BLOCKED.

### "Token inválido o expirado"

**Causa:** El token de reset de contraseña o cambio de email expiró (60 minutos).  
**Solución:** Solicitar un nuevo token desde "Olvidé mi contraseña" o "Cambiar email".

### "CUIL ya establecido"

**Causa:** Intentaste cambiar tu CUIL después de haberlo establecido.  
**Solución:** Contactar al administrador para que lo modifique desde el panel admin.

---

## Limitaciones

### Conocidas

1. **Edición de postulaciones:** No se pueden editar postulaciones una vez enviadas. Debes cancelar y crear una nueva.
2. **Borrado de documentos:** Los documentos no se eliminan inmediatamente.