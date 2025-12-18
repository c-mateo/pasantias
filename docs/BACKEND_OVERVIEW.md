# Backend Overview — Pasantias

This document is an overview of the backend architecture, conventions, and a suggested starting point for contributors and documentation readers. It's a synthesis built from the repository's existing docs (see `docs/` folder), controllers, and current implementation patterns.

## 🔧 Stack & Main Pieces

- Framework: AdonisJS + TypeScript
- ORM: Prisma
- Validation: vine (server-side), validators organized under `backend/app/validators` and `backend/prisma` helpers
- Job queue & workers: (background jobs live under `app/jobs`)
- API contract: RESTful endpoints using cursor pagination for lists
- Frontend API client convention: `wretch` wrapper with the convention to use `.res()` then `res.json()` so try/catch properly captures errors.

## 📁 Key directories

- `backend/app/controllers` — controllers for domain resources (offers, users, companies, applications)
- `backend/app/services` — business logic and helper operations
- `backend/prisma` — schema and db-level helpers and extensions
- `frontend/app/routes/admin` — administrative UI pages (now standardized to use `AdminList2` list component + `wretch` patterns)
- `docs/` — doc files; this file and an initial `openapi.yml` were added to centralize API info.

## 🧭 Conventions & Patterns

- Pagination: cursor-based; endpoints return `{ data: [], pagination: { limit, hasNext, next } }`.
- Error handling: APIs return structured errors (RFC-like body). Frontend must use `api.get(...).res()` and then `res.json()` to allow `catch` to see network/application errors.
- Admin lists: `AdminList2` (frontend) is the canonical list component handling selection, infinite scroll, and delete confirmations.
- Validators: Move server validation rules into `vine.create` schemas for reusability.
- UI feedback: prefer toasts / modals for confirmation and messages rather than `alert()`.

## ✅ How to extend the OpenAPI spec

- File: `docs/openapi.yml` (OpenAPI 3.0.3)
- Add new paths under `paths:` and define or reuse components under `components/schemas`.
- Keep the `servers` base URL as `/api` or update if your deployment uses a different path.

## 📌 Next steps and suggestions

1. Iterate the OpenAPI file to include all admin endpoints (create/update/delete forms, auth flows) and link to controllers for exact parameter schemas. The `backend/app/controllers` folder is the canonical source for route signatures.
2. Add a script to generate an up-to-date OpenAPI file automatically from the route definitions or controller annotations if desired.
3. Add integration tests that exercise main endpoints and compare responses with the OpenAPI schema (e.g., using a JSON schema validator).

---

If you want, I can now:
- Expand `docs/openapi.yml` with more endpoints (create/update/delete for offers, courses, companies, applications, auth), or
- Generate an OpenAPI JSON file and a minimal script to keep it up-to-date from code annotations.

Which one do you prefer as the next step?