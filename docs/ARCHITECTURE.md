# Architecture Overview

This project follows a modular backend + single-page-frontend architecture.

Components

- Backend (AdonisJS + Prisma)
  - REST controllers (App controllers expose endpoints used by the frontend).
  - Prisma ORM (Postgres) manages DB schema and migrations.
  - Background jobs (queued with internal job runner) for notifications and emails.
  - File storage: currently local filesystem (`uploads/`), but abstraction allows S3 later.

- Frontend (React + Vite)
  - Loader-based routes and components.
  - Uses `wretch` for HTTP requests.
  - `app/api/types.ts` contains types aligned with backend responses.

- Data flows
  - User logs in → session cookie issued → frontend uses session for authenticated endpoints.
  - Document upload: frontend streams PDF to upload endpoint → server computes hash and creates Document record → DocumentAttachment links Document to Draft.
  - Submit flow: Draft validated (complete) → Application created based on draft attachments → Draft deleted.

Design decisions
- Keep attachments in a separate `document` table with `hash` dedup to avoid duplicated blobs and to allow reuse across offers.
- Use `document_attachment` join table so attachments are lightweight references and can be unlinked/reused.
- Validate uploads strictly (content-type, content-length, max size) to prevent partial uploads or unexpected content.

Extensibility
- Swap file storage to S3 by replacing file write/remove operations in upload/download helpers.
- Add additional validation rules or change duplication logic in `draft_controller`.

Security & Privacy
- Documents are tied to user accounts and require authentication to access and download.
- Consider adding encryption-at-rest if storing sensitive docs long-term.
