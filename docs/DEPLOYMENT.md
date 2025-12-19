# Deployment

This document outlines deployment options and environment variables.

Docker (recommended for production-like environments):
- Provided `docker-compose.yml` and `docker-compose.dev.yml` file(s) for local and compose setups.

Environment variables (examples):
- DATABASE_URL - Postgres connection string
- REDIS_URL - Redis connection
- MAIL_PROVIDER_* - SMTP or service credentials
- SECRET_KEY - Application secret

Steps:
1. Build images: `docker compose -f docker-compose.yml build`
2. Start services: `docker compose -f docker-compose.yml up -d`
3. Run DB migrations: exec into the backend container and run `npx prisma migrate deploy` or `npx prisma migrate dev` in staging/dev.
4. Seed data if needed: `node prisma/seed.js` (or the TS equivalent).

Notes:
- Ensure volume mounting for `uploads/` or configure an object storage provider.
- Configure a reverse proxy (Nginx) and TLS termination in front of the app.
