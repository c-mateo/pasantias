# Estado de Implementación — Proyecto Pasantías

Fecha: 2025-12-19

Resumen

Este documento resume las ideas originales, qué está implementado actualmente y una checklist priorizada con las tareas pendientes, agrupadas por prioridad. Está pensado para ser un único punto de referencia rápido para desarrolladores y PMs.

---

## 1) Ideas originales (alto nivel)

- Permitir que estudiantes se postulen a ofertas con un borrador (draft) que se guarda automáticamente.
- Requerir documentos por tipo (ej. CV, certificados) y permitir subir/desvincular/descargar documentos.
- Evitar duplicados mediante hash (sha256) y permitir reutilizar documentos existentes.
- Proveer interfaz administrativa para gestionar ofertas, usuarios y documentos.
- Implementar API REST con validadores y contratos de tipos sincronizados con frontend.
- Mantener seguridad en el acceso a documentos (autenticación) y trazabilidad (logs/notificaciones).

---

## 2) ¿Qué está implementado? ✅

- Backend
  - Endpoint de descarga admin `GET /admin/documents/:id` (`backend/app/controllers/document_controller.downloadDocument`). ✅
  - Validadores (Vine) usados para parámetros en controladores (`idValidator`, `uploadValidator`, etc.). ✅
  - Endpoints de draft y documentos: `GET /offers/:offerId/draft`, `PATCH /offers/:offerId/draft`, `PUT /offers/:offerId/draft/documents/:reqDocId`, `DELETE /offers/:offerId/draft/documents/:attachmentId`, `POST /offers/:offerId/draft/documents/use-existing`, `POST /offers/:offerId/draft/submit`. ✅
  - Lógica de upload: guarda archivo, valida Content-Length, calcula sha256 y deduplica por hash; crea `Document` y `DocumentAttachment` (con manejo de concurrencia). ✅
  - `linkDocumentToDraft` actualizado para crear attachments idempotentemente y eliminar otros del mismo tipo. ✅
  - `my_documents` endpoints con validación y descarga por blob. ✅

- Frontend
  - `OfertaPublic.tsx`: arrastrar y soltar upload (drag & drop), reemplazo de flujo "Seleccionar existente" por upload directo a `PUT /offers/:offerId/draft/documents/:reqDocId`. ✅
  - Indicadores de subida (Spinner / "Subiendo...") y mensajes de éxito/error. ✅
  - Descarga de documentos hecha mediante fetch de blob y forzado de descarga en navegador. ✅
  - Desvincular documentos (DELETE) desde UI. ✅
  - Prevención de doble-apply: cliente obtiene `hasApplied` y deshabilita upload y el botón Aplicar. ✅
  - Reemplazo de `request.param('id')` por `request.validateUsing(idValidator)` donde correspondía (backend controllers refactor). ✅

- Docs & QA
  - Actualización de tipos usados por el frontend en `frontend/app/api/types.ts` (incluye `DraftGetResponse`, `DraftAttachmentDTO`, `UploadDocumentResponse`). ✅
  - Añadidos documentos en `docs/`: `API_DOCUMENTATION.md`, `ARCHITECTURE.md`, `SYSTEM_OVERVIEW.md`, `DEPLOYMENT.md`, `USER_MANUAL.md`. ✅
  - `docs/openapi.yml` actualizado con rutas de draft/documentos y esquemas (incluye `cookieAuth`). ✅
  - READMEs agregados a carpetas principales para orientación rápida. ✅

---

## 3) Pendientes y mejoras (priorizadas)

### Prioridad Alta (seguridad, estabilidad, pruebas)
- [ ] E2E: tests de flujo completo upload → reload → submit → bloqueo de doble-apply. (Recomendado: Cypress/Playwright). (Status: pendiente)
- [ ] Tests de integración backend para `uploadDocument` y `linkDocumentToDraft` (manejo de concurrencia y deduplicación). (pendiente)
- [ ] Agregar validación/errores detallados en UI (mostrar mensajes server `ApiError.meta.conflicts` donde corresponda). (parcial: backend envía `ApiError` pero frontend muestra mensajes genéricos en algunos casos)

### Prioridad Media (UX, docs y automatización)
- [ ] Reemplazar `window.confirm` por un modal consistente en la UI (Eliminar borrador). (pendiente)
- [ ] Añadir ejemplos request/response y ejemplos de uso en `docs/openapi.yml` (actualmente paths y schemas, sin ejemplos). (pendiente)
- [ ] Generar y publicar client stubs (TypeScript) a partir del OpenAPI y validar. (pendiente)
- [ ] Añadir monitorización/alertas y health endpoints para producción. (pendiente)

### Prioridad Baja (refactor/optimizaciones)
- [ ] Soporte de almacenamiento en S3 (o abstracción de storage) para documentos grandes / producción. (pendiente)
- [ ] Encriptación en reposo para archivos sensibles. (pendiente)
- [ ] Limpieza automática de archivos no usados (garbage collect) y política de retención. (pendiente)

---

## 4) Tareas menores / Observaciones detectadas

- Varios warnings/errores TypeScript en páginas admin (Oferta, Skill, Ofertas) detectados por `get_errors` — no introducidos por este trabajo, conviene corregirlos en un ticket separado. (prioridad alta-mediana según el equipo) 
- Algunos endpoints admin para documentos (listar, detalle, borrar) están comentados en `start/routes.ts` — decidir si exponerlos ahora o dejarlos privados. 

---

## 5) Recomendación inmediata (mi sugerencia)

1. Añadir E2E que cubran: subir documento (slot 1), recargar borrador y comprobar que aparece en slot 1, enviar la postulación, intentar aplicar otra vez y verificar bloqueo. Esto cubre los bugs reportados y asegura que regresión no vuelva. 
2. Crear pruebas de integración para upload y `linkDocumentToDraft` para simular concurrencia (dos uploads al mismo tiempo de archivo idéntico / distinto). 
3. Añadir ejemplos en `openapi.yml` y ejecutar validación (`openapi-cli validate`) y si está OK, generar client stubs. 

---

## 6) Notas técnicas y referencias rápidas
- Backend: `backend/app/controllers/draft_controller.ts` (upload, link, submit) — revisar ahí para cambios de lógica. 
- Frontend: `frontend/app/routes/ofertasPublic/OfertaPublic.tsx` — upload, drag&drop, download and UI state. 
- Types: `frontend/app/api/types.ts` (fuente de verdad del frontend) — sincronizar si cambian responses. 
- Docs API: `docs/openapi.yml` (actualizado) y `docs/API_DOCUMENTATION.md` (resumen rápido).

---

Si querés, puedo:
- Implementar la tarea de mayor prioridad (E2E upload→submit) y subir un PR con la suite de pruebas, o
- Generar stubs TypeScript desde `docs/openapi.yml` y agregar una tarea CI que valide el OpenAPI.

Dime cuál preferís y empiezo con eso.