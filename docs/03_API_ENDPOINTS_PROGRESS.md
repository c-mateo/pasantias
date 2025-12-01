# Estado de implementación — `docs/03_API_ENDPOINTS.md`

Fecha: 2025-12-01

Resumen breve
- Estado general: la mayor parte de los endpoints del `docs/03_API_ENDPOINTS.md` está implementada (autenticación, profile, offers, companies, skills, courses, applications, notifications, documentos/drafts). Se añadieron helpers comunes para paginación y FIQL, HATEOAS uniforme en muchos controladores y soporte básico de alias de rutas.
- Objetivo: listar lo que falta, prioridades y pasos necesarios para entregar un backend estable y documentado al frontend.

1) Bloqueadores (alta prioridad)
- Implementar `PATCH /offers/:offerId/draft` (`draft_controller.save`).
  - Estado actual: el método lanza `internalError('Not implemented yet')`.
  - Efecto: sin esto no hay flujo completo de postulación (crear/actualizar borrador, luego confirmar).
  - Acción recomendada: implementar upsert del draft con `customFieldsValues`, crear/actualizar attachments vía endpoints existentes.

2) Normalizar forma de paginación (alta prioridad)
- Descripción: los controladores devuelven el resultado de `prisma.<model>.paginate()` tal cual en muchos casos. La especificación exige un objeto `pagination` con campos: `{ limit, hasNext, hasPrev, next, prev }`.
- Acción recomendada: añadir un pequeño adaptador que transforme la respuesta de `paginate()` a la forma del MD y aplicarlo a los controladores que exponen paginación.

3) Filtros / Búsqueda (alta prioridad para frontend)
- Estado: el backend ya usa FIQL (`filter`) y `preparePagination` con `fieldMap` para validar tipos. El parámetro libre `q` fue eliminado por decisión anterior.
- Impacto: el frontend debe usar FIQL en `filter` o necesitamos un adaptador que acepte el `q` antiguo y lo traduzca.
- Acción recomendada: actualizar `docs/03_API_ENDPOINTS.md` para reflejar FIQL (ejemplos) y eliminar/advertir sobre `q`, o implementar un adaptador de compatibilidad.

4) HATEOAS — consistencia (media)
- Estado: mayoría de endpoints paginados y de detalle usan `request.url()` para `self` y `getRoute(alias, params)` para enlaces a otras rutas cuando existe alias.
- Pendiente: un par de controladores aún conservan cadenas o `router.builder()` directos (p. ej. en `draft_controller.uploadDocument`), y conviene homogeneizar formato: 
  - Listados paginados: `extra: (r) => ({ links: { self, next } })`.
  - Recursos GET: `links: [ { rel, href, method } ]`.
- Acción: barrido final para homogeneizar todos los controllers.

5) Contrato de subida de ficheros (media)
- Estado: `draft_controller.uploadDocument` actualmente acepta únicamente `content-type: application/pdf` y requiere cabeceras `x-original-filename` y `content-length`.
- Docs: `docs/03` describe varios tipos permitidos y headers. Hay desajuste.
- Acción: decidir y documentar (aceptar más tipos o documentar PDF-only). Actualizar MD y código.

6) Aliases de rutas y mapping (media)
- Estado: añadí `companies.offers` como alias y adapté links que lo usan.
- Pendiente: reconciliar `/documents` vs `/my-documents` (decisión de naming) y asegurarse que cualquier `getRoute('alias')` referenciado tenga `.as('alias')` en `start/routes.ts`.

7) Rate limiting (opcional pero recomendado)
- Docs especifican límites (login, uploads, etc.) pero no hay evidencia de middleware global implementado.
- Acción: añadir middleware de rate-limiting (Redis-based para distribuido) en endpoints críticos: `POST /auth/login`, upload endpoints, confirm draft.

8) Limpieza de linter/TypeScript (baja pero útil)
- Varias advertencias detectadas (variables no usadas: `offer`, `queryValidator`, etc.) tras refactor. No bloquean, pero recomendable limpiar antes de entrega.

9) Entregables para frontend (recomendado)
- Actualizar `docs/03_API_ENDPOINTS.md` con:
  - Aclaración: `filter` usa FIQL (ejemplos por recurso)
  - Quitar o marcar `q` como deprecated
  - Documentar headers de upload y tipos permitidos
  - Especificar la forma exacta de `pagination` y ejemplos
- Proveer colección Postman / ejemplos `curl` para: login, listar ofertas (filter+sort+paginate), iniciar postulación (draft flow), subir documento, confirmar postulación, descargar documento.

Tareas propuestas (priorizadas)
1. Implementar `draft_controller.save` (PATCH /offers/:offerId/draft) — crítico para frontend.
2. Normalizar paginación y aplicar adaptador a todos los endpoints con `paginate()`.
3. Actualizar `docs/03_API_ENDPOINTS.md` para reflejar FIQL y la forma real de las respuestas (pagination/links/upload headers).
4. Homogeneizar HATEOAS y aplicar `getRoute(alias, params)` solo cuando exista alias; usar `request.url()` para `self` si el endpoint es el mismo.
5. Decidir y aplicar política de uploads (tipos permitidos y headers).
6. Añadir rate-limiter en endpoints críticos (opcional previo a entrega).
7. Limpieza de linter/TS y generación de ejemplos (Postman/curl).

Preguntas para decidir (necesito tu confirmación)
- Save draft: ¿quieres que `PATCH /offers/:offerId/draft` acepte `{ customFieldsValues?: object }` y haga upsert (crear si no existe)? ¿Algún campo adicional esperado en la petición?
- Paginación: ¿debe `next` ser cursor numérico (como el actual `after`) o un token base64 (más opaco)?
- Uploads: ¿permitimos solo `application/pdf` o además `doc/docx/jpg/png` como en la documentación original?
- `q` param: ¿lo dejamos eliminado y comunicamos el cambio al frontend en la documentación, o añadimos compatibilidad (aceptar `q` y mapear a FIQL)?

Próximo paso si confirmas las decisiones
- Implemento `draft_controller.save`, corrijo paginación y actualizo `docs/03_API_ENDPOINTS.md` con los cambios (o creo un `CHANGELOG` dentro del docs explicando diferencias). También puedo generar la colección Postman mínima.

Si quieres que empiece por la implementación del `draft_controller.save` ahora, dime que confirme el formato del body (preguntas arriba) y comienzo.

--
Documento generado automáticamente a partir del análisis de la base de código y del `docs/03_API_ENDPOINTS.md`.
