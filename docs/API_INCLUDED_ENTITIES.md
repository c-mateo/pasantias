# API Included Entities Reference

This file lists endpoints and the entities/associations included by each controller endpoint (when the controller uses Prisma `include`/`select`) and the fields for those associated entities.

Notes:
- Fields are inferred from `api/types.ts` DTO definitions or explicit `select` clauses.
- For `include: { <entity>: true }` we list the typical DTO fields for that entity.

---

## Offers

### GET /api/v1/offers (OfferController.list)
Includes:
- `company` (select):
  - id
  - name
  - logo
- `skills` (full Skill objects):
  - id
  - name
  - description
- `courses` (select):
  - id
  - name
  - shortName

### GET /api/v1/offers/:id (OfferController.get)
Includes:
- `company` (select):
  - id
  - name
  - description
  - logo
  - website
- `skills` (select):
  - id
  - name
  - description
- `courses` (select):
  - id
  - name
  - shortName
- `requiredDocs` (select -> mapped to requiredDocuments in response):
  - documentType (select):
    - id
    - name

### POST /api/v1/offers (create) / PATCH /api/v1/offers/:id (update)
- `create` returns the created offer; `update` includes `requiredDocs` in the response when used by `include` statements.

---

## Companies

### GET /api/v1/companies/:id/offers (CompanyController.getOffers)
Includes:
- `company` (full Company object — include: true) — typical DTO fields:
  - id
  - name
  - description
  - website
  - email
  - phone
  - logo
  - createdAt
  - updatedAt
- `skills` (full Skill objects):
  - id
  - name
  - description

---

## Applications

### GET /api/v1/my-applications (ApplicationController.listUser)
Selects (nested entities):
- `offer` (select):
  - id
  - title
  - `company` (select): id, name

### GET /api/v1/my-applications/:id (ApplicationController.get)
Includes:
- `offer` (select):
  - id
  - title
  - `company` (select): id, name
- `attachments` (select):
  - `document` (select):
    - id
    - originalName
    - `documentType` (select):
      - name

### Admin endpoints: GET /api/v1/applications (listAdmin)
- Similar selection to `listUser` (offer id/title + company id/name)

---

## Drafts

### GET/POST /api/v1/offers/:offerId/draft (DraftController.get/save)
- `get` returns the draft (no include in get), responses depend on DTO.
- `save` upserts a draft and includes `attachments` when returning the draft:
  - `attachments`: attached documents; on some flows we select `document` with fields (see `linkDocumentToDraft` below).

### linkDocumentToDraft (internal helper, used on upload)
- Upsert with `include` attachments select:
  - `attachments` -> `document` -> select `id`, `documentTypeId`.

### submit
- `findUniqueOrThrow` for `draft` includes `attachments: true` in the draft used for submission.
- `requiredDocs` loaded from `requiredDocument.findMany({ include: { documentType: select { id, name }}})` and used to validate attachments.

---

## My Documents

### GET /api/v1/my-documents (MyDocumentsController.list)
Includes (used via `include`):
- `documentType` (select): id, name
- The controller selects fields on the Document (id, originalName, hash, createdAt, lastUsedAt) and returns a derived structure with `documentType`.

### GET /api/v1/my-documents/:id (MyDocumentsController.get)
Includes:
- `documentType` (select): id, name

### DELETE /api/v1/my-documents/:id (hide)
- Uses `include: { _count: { select: { attachments: true }}}` to confirm usage of the document.

---

## Profile

### GET /api/v1/profile (ProfilesController.get)
Selects (not `include`) returned fields of user and their courses & skills:
- `role`, `firstName`, `lastName`, `dni`, `phone`, `address`, `city`, `province`
- `courses`: CourseDTO — id, name, description, shortName
- `skills`: SkillDTO — id, name, description

### PATCH /api/v1/profile (ProfilesController.update)
Includes in the response
- `skills`: SkillDTO
- `courses`: CourseDTO

---

## Attachments / Documents used in multiple endpoints
- `attachments` frequently included or selected in Drafts and Application endpoints. Typical nested fields:
  - `attachments` -> `document` -> `id`, `originalName`, `documentType` { id, name }

---

## How this file was built
- Scanned backend controllers for `include`/`select` statements and mapped them to public API endpoints declared in `backend/start/routes.ts`.
- Where `include: <entity>: true`, fields are inferred from DTO types in `backend/app/controllers/*` selection or from `api/types.ts`.

---

If you want, I can:
- Expand each entry to include full DTO field lists (id/name/description/createdAt, etc.) explicitly for each included entity.
- Generate a nice CSV or JSON mapping for automated use.
- Add the endpoint HTTP method and controller function names (already hinted by the controller comments).

What format would you like next (CSV/JSON/expand DTO fields)?
