# API Errors Usage Report

Generated: 2025-12-15

This document lists the `apiErrors` helpers defined in `backend/app/exceptions/my_exceptions.ts`, shows which helpers are currently referenced in the repository, and suggests next steps (deprecate/document/test/alias).

## Summary
- Total helpers defined: 30
- Helpers referenced in codebase: 12
- Helpers not found in codebase: 18

## Helpers referenced (with example locations)
- invalidCredentials — `backend/app/controllers/auth_controller.ts`, `backend/app/controllers/profile_controller.ts`
- sessionExpired — `backend/app/exceptions/handler.ts`
- validationError — `backend/app/controllers/profile_controller.ts`, `backend/prisma/strategies.ts`
- invalidFile — `backend/app/controllers/draft_controller.ts`
- notFound — `backend/prisma/extensions.ts`, `backend/prisma/guard.ts` (thrown from DB helpers)
- multipleUniqueConflicts — `backend/prisma/strategies.ts`
- alreadyExists — `backend/prisma/strategies.ts`
- resourceInUse — `backend/prisma/strategies.ts`
- emailAlreadyRegistered — `backend/app/controllers/auth_controller.ts`, `backend/app/controllers/profile_controller.ts`
- invalidToken — `backend/app/controllers/auth_controller.ts`, `backend/app/controllers/profile_controller.ts`
- expiredToken — `backend/app/controllers/auth_controller.ts`, `backend/app/controllers/profile_controller.ts`
- internalError — `backend/prisma/guard.ts`, `backend/prisma/strategies.ts`
- invalidStateTransition — `backend/app/controllers/application_controller.ts`

> Note: the grep used was `apiErrors\.` across the repo. Only direct references (e.g., `throw apiErrors.someHelper(...)`) are reported.

## Helpers not found in repository (candidates to document / deprecate)
- authenticationRequired
- forbidden
- insufficientPermissions
- missingRequiredFields
- resourceDeleted
- resourceUnavailable
- alreadyApplied
- operationNotAllowed
- resourceBlocked
- incompleteDraft
- offerRequirementsChanged
- rateLimitExceeded
- quotaExceeded
- externalServiceError
- serviceUnavailable
- noChanges
- quotaExceeded

These helpers exist in `my_exceptions.ts` but have no direct `apiErrors.` references in the current scan.

## Inconsistencies discovered
- `backend/app/validators/customFields.ts` calls `apiErrors.validationFailed(...)` which does **not exist**; the valid helper is `validationError(...)`.
  - File: `backend/app/validators/customFields.ts`
  - Suggested fixes: (A) change callers to `validationError([...])`, or (B) add a small `validationFailed` alias in `my_exceptions.ts` that forwards to `validationError`.

## Recommendations
1. Do not delete unused helpers immediately. Some are useful for future endpoints or for completeness of the error catalog (e.g., `forbidden`, `insufficientPermissions`).
2. For low-use or very-specific helpers (e.g., `offerRequirementsChanged`, `incompleteDraft`) consider:
   - moving them to a smaller file scoped to the module that uses them, or
   - keeping them but adding a `// TODO: consider deprecating if unused after X months` comment.
3. Fix the `validationFailed` inconsistency (choose alias or update callers). I can apply the fix if you prefer.
4. Add a small test that checks that each `apiErrors` helper returns an `ApiException` with the expected `status` and `type` (guards against accidental removals or interface changes).

## Next steps (pick one)
- A) I can add the alias `validationFailed(...)` to `my_exceptions.ts` and update the validator call so both variants work.
- B) I can update callers to use `validationError(...)` and add a short unit test to cover the behavior.
- C) Create a deprecation checklist and add `// TODO` comments for the unused helpers for follow-up review.

---
If you want I can run a stricter check to also include dynamic references (e.g., strings used to reference helpers) or expand grep to include frontend code that may reference string-based error types. Which next step do you want? (A, B or C)