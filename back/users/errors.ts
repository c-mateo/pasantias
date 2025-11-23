// export const tokens = api(
//    { expose: true, method: "GET", path: "/tokens" },
//    async () => {
//       return await db.select().from(sessionTokens);
//    },
// );
// export const _private = api(
//    { expose: true, method: "GET", path: "/private", auth: true },
//    async (): Promise<{ message: string }> => {
//       const data = getAuthData() as UserDTO & { userID: string };
//       return {
//          message: `Hola ${data.firstName} ${data.lastName}`,
//       };
//    },
// );

import { APIError } from "encore.dev/api";

// RFC 9457
interface ProblemDetails {
   type: string;
   title: string;
   status: number;
   detail?: string;
   instance?: string;
}

type FieldError = {
   field: string;
   message: string;
};
type FileSizeError = {
   reason: "size";
   maxSize: number;
   actualSize: number;
   message: string;
};
type FileTypeError = {
   reason: "type";
   allowedTypes: string[];
   actualType: string;
   message: string;
};
type FileError = FileSizeError | FileTypeError;
type ApplicationStatus = "PENDING" | "REVIEWING" | "BLOCKED" | "ACCEPTED" | "REJECTED" | "CANCELLED";
type UsedIn = {
   drafts: string[];
   applications: string[];
};
type MissingDocument = {
   documentTypeId: string;
   name: string;
};
type RequiredAction = {
   documentTypeId: string;
   documentTypeName: string;
};
type UsageCount = {
   requiredByOffers?: number;
   usedInDocuments?: number;
   activeStudents?: number;
   usedInProfiles?: number;
   usedInOffers?: number;
};

// const Errors = {
//    // 401 Unauthorized
//    invalidCredentials: (instance: string) => ({
//       type: "invalid-credentials" as const,
//       title: "Invalid credentials",
//       status: 401,
//       detail: "The provided email or password is incorrect",
//       instance: instance,
//    }),

//    expiredSession: (instance: string, reason: "idle" | "absolute") => ({
//       type: "session-expired" as const,
//       title: "Session expired",
//       status: 401,
//       detail: reason === "idle"
//          ? "Your session has expired due to inactivity. Please log in again"
//          : "Your session has expired. Please log in again",
//       instance: instance,
//       reason: reason
//    }),

//    authenticationRequired: (instance: string) => ({
//       type: "authentication-required" as const,
//       title: "Authentication required",
//       status: 401,
//       detail: "You must be logged in to access this resource",
//       instance: instance
//    }),

//    // 403 Forbidden
//    forbidden: (instance: string) => ({
//       type: "forbidden" as const,
//       title: "Access denied",
//       status: 403,
//       detail: "You do not have permission to access this resource",
//       instance: instance
//    }),

//    insufficientPermissions: (instance: string, requiredRole: string, currentRole: string) => ({
//       type: "insufficient-permissions" as const,
//       title: "Insufficient permissions",
//       status: 403,
//       detail: `This action requires ${requiredRole} role`,
//       instance: instance,
//       requiredRole: requiredRole,
//       currentRole: currentRole
//    }),

//    // 400 Bad Request
//    validation: (instance: string, errors: FieldError[]) => ({
//       type: "validation-error" as const,
//       title: "Validation error",
//       status: 400,
//       detail: "One or more fields contain invalid data",
//       instance: instance,
//       errors: errors
//    }),

//    invalidFile: (instance: string, errors: FileError[]) => ({
//       type: "invalid-file" as const,
//       title: "Invalid file",
//       status: 400,
//       detail: "Uploaded file does not meet requirements",
//       instance: instance,
//       errors: errors
//    }),

//    missingRequiredFields: (instance: string, missingFields: Array<{ field: string; label: string; }>) => ({
//       type: "missing-required-fields" as const,
//       title: "Missing required fields",
//       status: 400,
//       detail: "Cannot proceed with missing required information",
//       instance: instance,
//       missingFields: missingFields
//    }),

//    incompleteDraft: (instance: string, completed: number, total: number, missing: { documents?: MissingDocument[]; customFields?: Array<{ fieldId: string; label: string; }>; }) => ({
//       type: "incomplete-draft" as const,
//       title: "Incomplete draft",
//       status: 400,
//       detail: `Cannot confirm application. ${total - completed} requirement(s) missing`,
//       instance: instance,
//       completed: completed,
//       total: total,
//       missing: missing
//    }),

//    resourceUnavailable: (instance: string, resourceType: string, resourceId: string, currentStatus: string, requiredStatus?: string) => ({
//       type: "resource-unavailable" as const,
//       title: "Resource not available",
//       status: 400,
//       detail: `Cannot perform this action on ${resourceType.toLowerCase()} with status ${currentStatus}`,
//       instance: instance,
//       resourceType: resourceType,
//       resourceId: resourceId,
//       currentStatus: currentStatus,
//       ...(requiredStatus && { requiredStatus })
//    }),

//    noChanges: (instance: string) => ({
//       type: "no-changes" as const,
//       title: "No changes detected",
//       status: 400,
//       detail: "No changes were provided in the request",
//       instance: instance
//    }),

//    // 404 Not Found
//    notFound: (instance: string, resourceType: string, resourceId: string) => ({
//       type: "not-found" as const,
//       title: "Resource not found",
//       status: 404,
//       detail: `The requested ${resourceType.toLowerCase()} does not exist`,
//       instance: instance,
//       resourceType: resourceType,
//       resourceId: resourceId
//    }),

//    // 410 Gone
//    resourceDeleted: (instance: string, resourceType: string, resourceId: string, deletedAt: string, anonymized?: boolean) => ({
//       type: "resource-deleted" as const,
//       title: "Resource deleted",
//       status: 410,
//       detail: `This ${resourceType.toLowerCase()} has been deleted`,
//       instance: instance,
//       resourceType: resourceType,
//       resourceId: resourceId,
//       deletedAt: deletedAt,
//       ...(anonymized !== undefined && { anonymized })
//    }),

//    // 409 Conflict
//    alreadyExists: (instance: string, resourceType: string, field: string, value: string) => ({
//       type: "already-exists" as const,
//       title: "Resource already exists",
//       status: 409,
//       detail: `A ${resourceType.toLowerCase()} with this ${field} already exists`,
//       instance: instance,
//       resourceType: resourceType,
//       field: field,
//       value: value
//    }),

//    emailAlreadyRegistered: (instance: string, email: string) => ({
//       type: "email-already-registered" as const,
//       title: "Email already registered",
//       status: 409,
//       detail: "The provided email is already associated with an existing account",
//       instance: instance,
//       email: email
//    }),

//    alreadyApplied: (instance: string, applicationId: string, appliedAt: string, status: ApplicationStatus) => ({
//       type: "already-applied" as const,
//       title: "Already applied",
//       status: 409,
//       detail: "You have already applied to this offer",
//       instance: instance,
//       applicationId: applicationId,
//       appliedAt: appliedAt,
//       applicationStatus: status
//    }),

//    resourceInUse: (instance: string, resourceType: string, resourceId: string, resourceName: string, usageCount: UsageCount, suggestion?: string) => ({
//       type: "resource-in-use" as const,
//       title: "Resource in use",
//       status: 409,
//       detail: `Cannot delete ${resourceType.toLowerCase()} that is currently in use`,
//       instance: instance,
//       resourceType: resourceType,
//       resourceId: resourceId,
//       resourceName: resourceName,
//       usageCount: usageCount,
//       ...(suggestion && { suggestion })
//    }),

//    documentInUse: (instance: string, documentId: string, usedIn: UsedIn) => ({
//       type: "document-in-use" as const,
//       title: "Document in use",
//       status: 409,
//       detail: "Cannot delete document while it's being used in applications or drafts",
//       instance: instance,
//       documentId: documentId,
//       usedIn: usedIn
//    }),

//    invalidStateTransition: (instance: string, resourceType: string, resourceId: string, currentStatus: string, requestedStatus: string, allowedTransitions: string[]) => ({
//       type: "invalid-state-transition" as const,
//       title: "Invalid state transition",
//       status: 409,
//       detail: `Cannot change status from ${currentStatus} to ${requestedStatus}`,
//       instance: instance,
//       resourceType: resourceType,
//       resourceId: resourceId,
//       currentStatus: currentStatus,
//       requestedStatus: requestedStatus,
//       allowedTransitions: allowedTransitions
//    }),

//    cantCancelApplication: (instance: string, applicationId: string, status: ApplicationStatus) => ({
//       type: "cant-cancel-application" as const,
//       title: "Cannot cancel application",
//       status: 409,
//       detail: "Applications can only be cancelled when status is PENDING",
//       instance: instance,
//       applicationId: applicationId,
//       applicationStatus: status,
//       allowedStatuses: ["PENDING"]
//    }),

//    documentAlreadyRequired: (instance: string, offerId: string, documentTypeId: string, documentTypeName: string) => ({
//       type: "document-already-required" as const,
//       title: "Document already required",
//       status: 409,
//       detail: "This document type is already required for this offer",
//       instance: instance,
//       offerId: offerId,
//       documentTypeId: documentTypeId,
//       documentTypeName: documentTypeName
//    }),

//    operationNotAllowed: (instance: string, operation: string, reason: string) => ({
//       type: "operation-not-allowed" as const,
//       title: "Operation not allowed",
//       status: 409,
//       detail: reason,
//       instance: instance,
//       operation: operation
//    }),

//    offerRequirementsChanged: (instance: string, offerId: string, changedAt: string, newRequirements: MissingDocument[]) => ({
//       type: "offer-requirements-changed" as const,
//       title: "Offer requirements changed",
//       status: 409,
//       detail: "The offer requirements changed. Your draft has been updated. Please complete the new requirements",
//       instance: instance,
//       offerId: offerId,
//       changedAt: changedAt,
//       newRequirements: newRequirements
//    }),

//    // 423 Locked
//    resourceBlocked: (instance: string, resourceType: string, resourceId: string, blockReason: string, blockedAt: string, requiredActions: RequiredAction[], unblockUrl?: string) => ({
//       type: "resource-blocked" as const,
//       title: "Resource blocked",
//       status: 423,
//       detail: `This ${resourceType.toLowerCase()} requires action before it can proceed`,
//       instance: instance,
//       resourceType: resourceType,
//       resourceId: resourceId,
//       blockReason: blockReason,
//       blockedAt: blockedAt,
//       requiredActions: requiredActions,
//       ...(unblockUrl && { unblockUrl })
//    }),

//    // 429 Too Many Requests
//    rateLimitExceeded: (instance: string, limit: number, window: number, retryAfter: number) => ({
//       type: "rate-limit-exceeded" as const,
//       title: "Too many requests",
//       status: 429,
//       detail: `Too many requests. Try again in ${retryAfter} seconds`,
//       instance: instance,
//       limit: limit,
//       window: window,
//       retryAfter: retryAfter
//    }),

//    quotaExceeded: (instance: string, quotaType: string, limit: number, current: number, suggestion?: string) => ({
//       type: "quota-exceeded" as const,
//       title: "Quota exceeded",
//       status: 429,
//       detail: `You have reached the maximum ${quotaType.replace('-', ' ')} (${limit})`,
//       instance: instance,
//       quotaType: quotaType,
//       limit: limit,
//       current: current,
//       ...(suggestion && { suggestion })
//    }),

//    // 500 Internal Server Error
//    internalError: (instance: string, errorId: string) => ({
//       type: "internal-error" as const,
//       title: "Internal server error",
//       status: 500,
//       detail: "An unexpected error occurred. Our team has been notified. Please try again later",
//       instance: instance,
//       errorId: errorId,
//       timestamp: new Date().toISOString(),
//       supportEmail: "bienestaruniversitario@unraf.edu.ar"
//    }),

//    // 502 Bad Gateway
//    externalServiceError: (instance: string, service: string, fallback?: string) => ({
//       type: "external-service-error" as const,
//       title: "External service error",
//       status: 502,
//       detail: `Unable to communicate with ${service}. ${fallback || 'Please try again later'}`,
//       instance: instance,
//       service: service,
//       ...(fallback && { fallback })
//    }),

//    // 503 Service Unavailable
//    serviceUnavailable: (instance: string, retryAfter?: number, maintenanceEnd?: string) => ({
//       type: "service-unavailable" as const,
//       title: "Service temporarily unavailable",
//       status: 503,
//       detail: maintenanceEnd
//          ? `System maintenance in progress. Service will resume at ${maintenanceEnd}`
//          : "The system is temporarily unavailable. Please try again later",
//       instance: instance,
//       ...(retryAfter && { retryAfter }),
//       ...(maintenanceEnd && { maintenanceEnd })
//    })
// };

// errors/api-errors.ts

const Errors = {
  // 401 Unauthorized
  invalidCredentials: (instance: string) => 
    APIError.unauthenticated("Invalid credentials")
      .withDetails({
        type: "invalid-credentials",
        title: "Invalid credentials",
        detail: "The provided email or password is incorrect",
        instance
      }),
  
  expiredSession: (instance: string, reason: "idle" | "absolute") =>
    APIError.unauthenticated("Session expired")
      .withDetails({
        type: "session-expired",
        title: "Session expired",
        detail: reason === "idle" 
          ? "Your session has expired due to inactivity. Please log in again"
          : "Your session has expired. Please log in again",
        instance,
        reason
      }),
  
  authenticationRequired: (instance: string) =>
    APIError.unauthenticated("Authentication required")
      .withDetails({
        type: "authentication-required",
        title: "Authentication required",
        detail: "You must be logged in to access this resource",
        instance
      }),
  
  // 403 Forbidden
  forbidden: (instance: string) =>
    APIError.permissionDenied("Access denied")
      .withDetails({
        type: "forbidden",
        title: "Access denied",
        detail: "You do not have permission to access this resource",
        instance
      }),
  
  insufficientPermissions: (instance: string, requiredRole: string, currentRole: string) =>
    APIError.permissionDenied("Insufficient permissions")
      .withDetails({
        type: "insufficient-permissions",
        title: "Insufficient permissions",
        detail: `This action requires ${requiredRole} role`,
        instance,
        requiredRole,
        currentRole
      }),
  
  // 400 Bad Request
  validation: (instance: string, errors: FieldError[]) =>
    APIError.invalidArgument("Validation error")
      .withDetails({
        type: "validation-error",
        title: "Validation error",
        detail: "One or more fields contain invalid data",
        instance,
        errors
      }),
  
  invalidFile: (instance: string, errors: FileError[]) =>
    APIError.invalidArgument("Invalid file")
      .withDetails({
        type: "invalid-file",
        title: "Invalid file",
        detail: "Uploaded file does not meet requirements",
        instance,
        errors
      }),
  
  missingRequiredFields: (instance: string, missingFields: Array<{field: string; label: string}>) =>
    APIError.invalidArgument("Missing required fields")
      .withDetails({
        type: "missing-required-fields",
        title: "Missing required fields",
        detail: "Cannot proceed with missing required information",
        instance,
        missingFields
      }),
  
  incompleteDraft: (instance: string, completed: number, total: number, missing: any) =>
    APIError.invalidArgument("Incomplete draft")
      .withDetails({
        type: "incomplete-draft",
        title: "Incomplete draft",
        detail: `Cannot confirm application. ${total - completed} requirement(s) missing`,
        instance,
        completed,
        total,
        missing
      }),
  
  resourceUnavailable: (instance: string, resourceType: string, resourceId: string, currentStatus: string, requiredStatus?: string) =>
    APIError.invalidArgument("Resource not available")
      .withDetails({
        type: "resource-unavailable",
        title: "Resource not available",
        detail: `Cannot perform this action on ${resourceType.toLowerCase()} with status ${currentStatus}`,
        instance,
        resourceType,
        resourceId,
        currentStatus,
        ...(requiredStatus && { requiredStatus })
      }),
  
  noChanges: (instance: string) =>
    APIError.invalidArgument("No changes detected")
      .withDetails({
        type: "no-changes",
        title: "No changes detected",
        detail: "No changes were provided in the request",
        instance
      }),
  
  // 404 Not Found
  notFound: (instance: string, resourceType: string, resourceId: string) =>
    APIError.notFound("Resource not found")
      .withDetails({
        type: "not-found",
        title: "Resource not found",
        detail: `The requested ${resourceType.toLowerCase()} does not exist`,
        instance,
        resourceType,
        resourceId
      }),
  
  // 410 Gone
  resourceDeleted: (instance: string, resourceType: string, resourceId: string, deletedAt: string, anonymized: boolean) =>
    APIError.notFound("Resource deleted")
      .withDetails({
        type: "resource-deleted",
        title: "Resource deleted",
        detail: `This ${resourceType.toLowerCase()} has been deleted`,
        instance,
        resourceType,
        resourceId,
        deletedAt,
        anonymized
      }),
  
  // 409 Conflict
  alreadyExists: (instance: string, resourceType: string, field: string, value: string) =>
    APIError.alreadyExists("Resource already exists")
      .withDetails({
        type: "already-exists",
        title: "Resource already exists",
        detail: `A ${resourceType.toLowerCase()} with this ${field} already exists`,
        instance,
        resourceType,
        field,
        value
      }),
  
  emailAlreadyRegistered: (instance: string, email: string) =>
    APIError.alreadyExists("Email already registered")
      .withDetails({
        type: "email-already-registered",
        title: "Email already registered",
        detail: "The provided email is already associated with an existing account",
        instance,
        email
      }),
  
  alreadyApplied: (instance: string, applicationId: string, appliedAt: string, status: ApplicationStatus) =>
    APIError.alreadyExists("Already applied")
      .withDetails({
        type: "already-applied",
        title: "Already applied",
        detail: "You have already applied to this offer",
        instance,
        applicationId,
        appliedAt,
        applicationStatus: status
      }),
  
  resourceInUse: (instance: string, resourceType: string, resourceId: string, resourceName: string, usageCount: UsageCount, suggestion?: string) =>
    APIError.failedPrecondition("Resource in use")
      .withDetails({
        type: "resource-in-use",
        title: "Resource in use",
        detail: `Cannot delete ${resourceType.toLowerCase()} that is currently in use`,
        instance,
        resourceType,
        resourceId,
        resourceName,
        usageCount,
        ...(suggestion && { suggestion })
      }),
  
  documentInUse: (instance: string, documentId: string, usedIn: UsedIn) =>
    APIError.failedPrecondition("Document in use")
      .withDetails({
        type: "document-in-use",
        title: "Document in use",
        detail: "Cannot delete document while it's being used in applications or drafts",
        instance,
        documentId,
        usedIn
      }),
  
  invalidStateTransition: (instance: string, resourceType: string, resourceId: string, currentStatus: string, requestedStatus: string, allowedTransitions: string[]) =>
    APIError.failedPrecondition("Invalid state transition")
      .withDetails({
        type: "invalid-state-transition",
        title: "Invalid state transition",
        detail: `Cannot change status from ${currentStatus} to ${requestedStatus}`,
        instance,
        resourceType,
        resourceId,
        currentStatus,
        requestedStatus,
        allowedTransitions
      }),
  
  cantCancelApplication: (instance: string, applicationId: string, status: ApplicationStatus) =>
    APIError.failedPrecondition("Cannot cancel application")
      .withDetails({
        type: "cant-cancel-application",
        title: "Cannot cancel application",
        detail: "Applications can only be cancelled when status is PENDING",
        instance,
        applicationId,
        applicationStatus: status,
        allowedStatuses: ["PENDING"]
      }),
  
  documentAlreadyRequired: (instance: string, offerId: string, documentTypeId: string, documentTypeName: string) =>
    APIError.alreadyExists("Document already required")
      .withDetails({
        type: "document-already-required",
        title: "Document already required",
        detail: "This document type is already required for this offer",
        instance,
        offerId,
        documentTypeId,
        documentTypeName
      }),
  
  operationNotAllowed: (instance: string, operation: string, reason: string) =>
    APIError.failedPrecondition("Operation not allowed")
      .withDetails({
        type: "operation-not-allowed",
        title: "Operation not allowed",
        detail: reason,
        instance,
        operation
      }),
  
  offerRequirementsChanged: (instance: string, offerId: string, changedAt: string, newRequirements: MissingDocument[]) =>
    APIError.failedPrecondition("Offer requirements changed")
      .withDetails({
        type: "offer-requirements-changed",
        title: "Offer requirements changed",
        detail: "The offer requirements changed. Your draft has been updated. Please complete the new requirements",
        instance,
        offerId,
        changedAt,
        newRequirements
      }),
  
  // 423 Locked (usando failedPrecondition porque Encore no tiene .locked())
  resourceBlocked: (instance: string, resourceType: string, resourceId: string, blockReason: string, blockedAt: string, requiredActions: RequiredAction[], unblockUrl?: string) =>
    APIError.failedPrecondition("Resource blocked")
      .withDetails({
        type: "resource-blocked",
        title: "Resource blocked",
        detail: `This ${resourceType.toLowerCase()} requires action before it can proceed`,
        instance,
        resourceType,
        resourceId,
        blockReason,
        blockedAt,
        requiredActions,
        ...(unblockUrl && { unblockUrl })
      }),
  
  // 429 Too Many Requests
  rateLimitExceeded: (instance: string, limit: number, window: number, retryAfter: number) =>
    APIError.resourceExhausted("Too many requests")
      .withDetails({
        type: "rate-limit-exceeded",
        title: "Too many requests",
        detail: `Too many requests. Try again in ${retryAfter} seconds`,
        instance,
        limit,
        window,
        retryAfter
      }),
  
  quotaExceeded: (instance: string, quotaType: string, limit: number, current: number, suggestion?: string) =>
    APIError.resourceExhausted("Quota exceeded")
      .withDetails({
        type: "quota-exceeded",
        title: "Quota exceeded",
        detail: `You have reached the maximum ${quotaType.replace('-', ' ')} (${limit})`,
        instance,
        quotaType,
        limit,
        current,
        ...(suggestion && { suggestion })
      }),
  
  // 500 Internal Server Error
  internalError: (instance: string, errorId: string) =>
    APIError.internal("Internal server error")
      .withDetails({
        type: "internal-error",
        title: "Internal server error",
        detail: "An unexpected error occurred. Our team has been notified. Please try again later",
        instance,
        errorId,
        timestamp: new Date().toISOString(),
        supportEmail: "bienestaruniversitario@unraf.edu.ar"
      }),
  
  // 502 Bad Gateway
  externalServiceError: (instance: string, service: string, fallback?: string) =>
    APIError.unavailable("External service error")
      .withDetails({
        type: "external-service-error",
        title: "External service error",
        detail: `Unable to communicate with ${service}. ${fallback || 'Please try again later'}`,
        instance,
        service,
        ...(fallback && { fallback })
      }),
  
  // 503 Service Unavailable
  serviceUnavailable: (instance: string, retryAfter?: number, maintenanceEnd?: string) =>
    APIError.unavailable("Service temporarily unavailable")
      .withDetails({
        type: "service-unavailable",
        title: "Service temporarily unavailable",
        detail: maintenanceEnd 
          ? `System maintenance in progress. Service will resume at ${maintenanceEnd}`
          : "The system is temporarily unavailable. Please try again later",
        instance,
        ...(retryAfter && { retryAfter }),
        ...(maintenanceEnd && { maintenanceEnd })
      })
};

type ErrorTypes = ReturnType<(typeof Errors)[keyof typeof Errors]>;

/**
 * AppError: representación de runtime para los payloads de `Errors`.
 * - Conserva stack trace y soporta `instanceof`.
 * - `payload` contiene el objeto serializable que ya usan las fábricas.
 */
class AppError<T extends ErrorTypes = ErrorTypes> extends Error {
   public readonly payload: T;
   public readonly type: T['type'];
   public readonly status: T['status'];

   constructor(payload: T) {
      // Use detail o title para el message de Error; si no existe, usar type
      super((payload as any)?.detail ?? (payload as any)?.title ?? String((payload as any)?.type ?? 'AppError'));
      Object.setPrototypeOf(this, new.target.prototype);
      this.name = 'AppError';
      this.payload = payload;
      this.type = payload.type;
      this.status = payload.status;
   }

   // Permite serializar la instancia directamente a JSON con el payload
   toJSON() {
      return this.payload as unknown;
   }
}

function isAppError(v: unknown): v is AppError {
   return v instanceof AppError;
}

/**
 * Helpers para envolver o lanzar errores construidos con `Errors`.
 * Uso recomendado:
 *   // construir payload (serializable)
 *   const p = Errors.resourceInUse(instance, resourceType, id, name, usageCount, suggestion);
 *   // lanzarlo manteniendo stack y pudiendo usar `instanceof AppError`
 *   throwAppError(p);
 */
const asAppError = <T extends ErrorTypes>(payload: T) => new AppError(payload);
const throwAppError = <T extends ErrorTypes>(payload: T): never => { throw new AppError(payload); };

export { Errors, type ErrorTypes, AppError, asAppError, throwAppError, isAppError };
