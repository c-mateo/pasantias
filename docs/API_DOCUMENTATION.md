# API Documentation

This document provides an overview of the main endpoints used by the frontend and admin systems. For full, per-endpoint examples check the controllers under `backend/app/controllers/`.

Base path: `/api/v1`

Authentication: endpoints under user/admin require an authenticated session (cookie-based session). Rate limits are applied to public and auth endpoints.

Main endpoints (summary):

- GET /offers
- GET /offers/:id
- GET /offers/:offerId/draft (auth) — Get current user's draft for an offer (204 No Content if none)
- PATCH /offers/:offerId/draft (auth) — Save draft (custom fields)
- PUT /offers/:offerId/draft/documents/:reqDocId (auth) — Upload document for required document type
  - Headers required: `Content-Type: application/pdf`, `Content-Length: <bytes>`, `X-Original-Filename: <name>`
  - Response: `UploadDocumentResponse` with document metadata and links
- DELETE /offers/:offerId/draft/documents/:attachmentId (auth) — Unlink attachment from draft
- POST /offers/:offerId/draft/documents/use-existing (auth) — Link an existing user document to the draft
- DELETE /offers/:offerId/draft (auth) — Delete draft and attachments
- POST /offers/:offerId/draft/submit (auth) — Submit application (creates Application and removes Draft)
- GET /my-documents (auth) — List user documents
- POST /my-documents/:id/download (auth) — Download document (returns blob)

Errors
- API uses structured errors (`ApiError`) with `type`, `title`, `status`, `detail` and optional `meta` with details (conflicts, fields).
- Common `type` values: `not-found`, `already-exists`, `invalid-file`, `incomplete-draft`.

Notes & Guidance
- Uploads deduplicate by file hash (sha256). The server will discard uploaded file bytes if a document with the same hash already exists.
- The client must include exact `Content-Length` and the server checks it matches the received bytes.
- The `PUT` upload endpoint expects the `reqDocId` path parameter to map the uploaded document to a specific required document type for the offer.

Example: Uploading a PDF (frontend)

- Request: `PUT /offers/123/draft/documents/1`
  - Headers: `Content-Type: application/pdf`, `Content-Length: 345353`, `X-Original-Filename: resume.pdf`
  - Body: raw PDF bytes

- Response: 200 OK with JSON describing the document and link to `my-documents.get`.

See also:
- `backend/app/controllers/draft_controller.ts` for server validations and attachments logic.
