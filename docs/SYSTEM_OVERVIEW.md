# System Overview

High level overview of components and responsibilities.

Services

- API Server (AdonisJS): handles authentication, business logic, file uploads, notifications.
- Database (Postgres + Prisma): stores users, offers, drafts, documents and attachments.
- Background worker: dispatches notifications and long-running tasks.
- Frontend: React app served separately (Vite during development).

Monitoring & Logging
- Logs emitted by backend (logger.ts) should be aggregated in production.
- Add health endpoints and metrics collection for production readiness.

Operational considerations
- Backups: schedule DB backups and retention policy for uploaded files if needed.
- Migrations: use `prisma migrate` and keep migrations small & reversible where possible.

Contact points
- Developers should update `docs/` when making breaking changes to APIs or data models.
