# Pasantías - Proyecto

Repositorio de la plataforma de pasantías. Este repo contiene backend, frontend, documentación y utilidades.

Estructura principal:

- `backend/` - Backend (AdonisJS + Prisma) — servidores, controladores y lógica de negocio.
- `frontend/` - Frontend (React, Vite) — componentes, páginas y tipos de API en `app/api/types.ts`.
- `prisma/` - Esquema y migraciones de DB.
- `docs/` - Documentación del proyecto (API, arquitectura, despliegue, manual de usuario, etc.).
- `tests/` - Pruebas unitarias y funcionales.

Documentación que acabo de añadir:
- `docs/API_DOCUMENTATION.md` — resumen de endpoints clave y comportamiento de subida de archivos.
- `docs/ARCHITECTURE.md` — arquitectura y decisiones de diseño.
- `docs/SYSTEM_OVERVIEW.md` — visión general de componentes y operaciones.
- `docs/DEPLOYMENT.md` — pasos de despliegue y variables de entorno.
- `docs/USER_MANUAL.md` — manual de usuario para roles Estudiante y Admin.

Tipos y sincronización
- **Frontend types**: el frontend usa `frontend/app/api/types.ts` como fuente de tipos (asegurate de mantenerlo sincronizado si el backend cambia respuestas).
- Existe `docs/api_types.ts` (documentación) pero el frontend no lo utiliza directamente.

Siguientes pasos sugeridos:
- Añadir tests E2E para el flujo completo de upload → submit.
- Revisar y centralizar la documentación de API en OpenAPI si se desea exportar clientes automáticos.

---

Para dudas o contribuciones, abre un issue o crea un PR con el cambio propuesto.

---

Credits:

- Icons by [Flaticon](https://www.flaticon.com/)