# backend

Resumen: Código del backend (AdonisJS + Prisma). Contiene controladores, validadores, modelos y configuración del servidor.

Estructura principal:

- `app/` - controladores, middleware, servicios, modelos y validadores.
- `config/` - configuración de la app (logging, mail, redis, cors, etc.).
- `prisma/` - esquema, migraciones y seeds (ver `prisma/schema.prisma`).
- `scripts/` y `bin/` - inicialización y tareas CLI.

Notas rápidas:
- El servicio de persistencia es Prisma (Postgres). Revisa `prisma/` para migraciones y seeds.
- Endpoints relevantes para el flujo de `offers` y `drafts` están en `app/controllers/draft_controller.ts`.
- Subidas de archivos se guardan en `uploads/` en filesystem local por defecto (ver `draft_controller.uploadDocument`).

Cómo ejecutar (desarrollo):
- Usa Docker Compose (`docker-compose.dev.yml`) o `npm run dev` desde `backend/`.
- Asegúrate de configurar variables de entorno en `.env` (DB, MAIL, REDIS, etc.).

Documentación adicional:
- Ver `../docs/API_DOCUMENTATION.md` y `../docs/ARCHITECTURE.md` para detalles de API y arquitectura.
