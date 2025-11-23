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

const Errors = {
   // 401 Unauthorized
   invalidCredentials: (instance: string) => ({
      type: "invalid-credentials" as const,
      title: "Invalid credentials",
      status: 401,
      detail: "The provided email or password is incorrect",
      instance: instance,
   }),

   expiredSession: (instance: string, reason: "idle" | "absolute") => ({
      type: "session-expired" as const,
      title: "Session expired",
      status: 401,
      detail: reason === "idle"
         ? "Your session has expired due to inactivity. Please log in again"
         : "Your session has expired. Please log in again",
      instance: instance,
      reason: reason
   }),

   authenticationRequired: (instance: string) => ({
      type: "authentication-required" as const,
      title: "Authentication required",
      status: 401,
      detail: "You must be logged in to access this resource",
      instance: instance
   }),

   // 403 Forbidden
   forbidden: (instance: string) => ({
      type: "forbidden" as const,
      title: "Access denied",
      status: 403,
      detail: "You do not have permission to access this resource",
      instance: instance
   }),

   insufficientPermissions: (instance: string, requiredRole: string, currentRole: string) => ({
      type: "insufficient-permissions" as const,
      title: "Insufficient permissions",
      status: 403,
      detail: `This action requires ${requiredRole} role`,
      instance: instance,
      requiredRole: requiredRole,
      currentRole: currentRole
   }),

   // 400 Bad Request
   validation: (instance: string, errors: FieldError[]) => ({
      type: "validation-error" as const,
      title: "Validation error",
      status: 400,
      detail: "One or more fields contain invalid data",
      instance: instance,
      errors: errors
   }),

   invalidFile: (instance: string, errors: FileError[]) => ({
      type: "invalid-file" as const,
      title: "Invalid file",
      status: 400,
      detail: "Uploaded file does not meet requirements",
      instance: instance,
      errors: errors
   }),

   missingRequiredFields: (instance: string, missingFields: Array<{ field: string; label: string; }>) => ({
      type: "missing-required-fields" as const,
      title: "Missing required fields",
      status: 400,
      detail: "Cannot proceed with missing required information",
      instance: instance,
      missingFields: missingFields
   }),

   incompleteDraft: (instance: string, completed: number, total: number, missing: { documents?: MissingDocument[]; customFields?: Array<{ fieldId: string; label: string; }>; }) => ({
      type: "incomplete-draft" as const,
      title: "Incomplete draft",
      status: 400,
      detail: `Cannot confirm application. ${total - completed} requirement(s) missing`,
      instance: instance,
      completed: completed,
      total: total,
      missing: missing
   }),

   resourceUnavailable: (instance: string, resourceType: string, resourceId: string, currentStatus: string, requiredStatus?: string) => ({
      type: "resource-unavailable" as const,
      title: "Resource not available",
      status: 400,
      detail: `Cannot perform this action on ${resourceType.toLowerCase()} with status ${currentStatus}`,
      instance: instance,
      resourceType: resourceType,
      resourceId: resourceId,
      currentStatus: currentStatus,
      ...(requiredStatus && { requiredStatus })
   }),

   noChanges: (instance: string) => ({
      type: "no-changes" as const,
      title: "No changes detected",
      status: 400,
      detail: "No changes were provided in the request",
      instance: instance
   }),

   // 404 Not Found
   notFound: (instance: string, resourceType: string, resourceId: string) => ({
      type: "not-found" as const,
      title: "Resource not found",
      status: 404,
      detail: `The requested ${resourceType.toLowerCase()} does not exist`,
      instance: instance,
      resourceType: resourceType,
      resourceId: resourceId
   }),

   // 410 Gone
   resourceDeleted: (instance: string, resourceType: string, resourceId: string, deletedAt: string, anonymized?: boolean) => ({
      type: "resource-deleted" as const,
      title: "Resource deleted",
      status: 410,
      detail: `This ${resourceType.toLowerCase()} has been deleted`,
      instance: instance,
      resourceType: resourceType,
      resourceId: resourceId,
      deletedAt: deletedAt,
      ...(anonymized !== undefined && { anonymized })
   }),

   // 409 Conflict
   alreadyExists: (instance: string, resourceType: string, field: string, value: string) => ({
      type: "already-exists" as const,
      title: "Resource already exists",
      status: 409,
      detail: `A ${resourceType.toLowerCase()} with this ${field} already exists`,
      instance: instance,
      resourceType: resourceType,
      field: field,
      value: value
   }),

   emailAlreadyRegistered: (instance: string, email: string) => ({
      type: "email-already-registered" as const,
      title: "Email already registered",
      status: 409,
      detail: "The provided email is already associated with an existing account",
      instance: instance,
      email: email
   }),

   alreadyApplied: (instance: string, applicationId: string, appliedAt: string, status: ApplicationStatus) => ({
      type: "already-applied" as const,
      title: "Already applied",
      status: 409,
      detail: "You have already applied to this offer",
      instance: instance,
      applicationId: applicationId,
      appliedAt: appliedAt,
      applicationStatus: status
   }),

   resourceInUse: (instance: string, resourceType: string, resourceId: string, resourceName: string, usageCount: UsageCount, suggestion?: string) => ({
      type: "resource-in-use" as const,
      title: "Resource in use",
      status: 409,
      detail: `Cannot delete ${resourceType.toLowerCase()} that is currently in use`,
      instance: instance,
      resourceType: resourceType,
      resourceId: resourceId,
      resourceName: resourceName,
      usageCount: usageCount,
      ...(suggestion && { suggestion })
   }),

   documentInUse: (instance: string, documentId: string, usedIn: UsedIn) => ({
      type: "document-in-use" as const,
      title: "Document in use",
      status: 409,
      detail: "Cannot delete document while it's being used in applications or drafts",
      instance: instance,
      documentId: documentId,
      usedIn: usedIn
   }),

   invalidStateTransition: (instance: string, resourceType: string, resourceId: string, currentStatus: string, requestedStatus: string, allowedTransitions: string[]) => ({
      type: "invalid-state-transition" as const,
      title: "Invalid state transition",
      status: 409,
      detail: `Cannot change status from ${currentStatus} to ${requestedStatus}`,
      instance: instance,
      resourceType: resourceType,
      resourceId: resourceId,
      currentStatus: currentStatus,
      requestedStatus: requestedStatus,
      allowedTransitions: allowedTransitions
   }),

   cantCancelApplication: (instance: string, applicationId: string, status: ApplicationStatus) => ({
      type: "cant-cancel-application" as const,
      title: "Cannot cancel application",
      status: 409,
      detail: "Applications can only be cancelled when status is PENDING",
      instance: instance,
      applicationId: applicationId,
      applicationStatus: status,
      allowedStatuses: ["PENDING"]
   }),

   documentAlreadyRequired: (instance: string, offerId: string, documentTypeId: string, documentTypeName: string) => ({
      type: "document-already-required" as const,
      title: "Document already required",
      status: 409,
      detail: "This document type is already required for this offer",
      instance: instance,
      offerId: offerId,
      documentTypeId: documentTypeId,
      documentTypeName: documentTypeName
   }),

   operationNotAllowed: (instance: string, operation: string, reason: string) => ({
      type: "operation-not-allowed" as const,
      title: "Operation not allowed",
      status: 409,
      detail: reason,
      instance: instance,
      operation: operation
   }),

   offerRequirementsChanged: (instance: string, offerId: string, changedAt: string, newRequirements: MissingDocument[]) => ({
      type: "offer-requirements-changed" as const,
      title: "Offer requirements changed",
      status: 409,
      detail: "The offer requirements changed. Your draft has been updated. Please complete the new requirements",
      instance: instance,
      offerId: offerId,
      changedAt: changedAt,
      newRequirements: newRequirements
   }),

   // 423 Locked
   resourceBlocked: (instance: string, resourceType: string, resourceId: string, blockReason: string, blockedAt: string, requiredActions: RequiredAction[], unblockUrl?: string) => ({
      type: "resource-blocked" as const,
      title: "Resource blocked",
      status: 423,
      detail: `This ${resourceType.toLowerCase()} requires action before it can proceed`,
      instance: instance,
      resourceType: resourceType,
      resourceId: resourceId,
      blockReason: blockReason,
      blockedAt: blockedAt,
      requiredActions: requiredActions,
      ...(unblockUrl && { unblockUrl })
   }),

   // 429 Too Many Requests
   rateLimitExceeded: (instance: string, limit: number, window: number, retryAfter: number) => ({
      type: "rate-limit-exceeded" as const,
      title: "Too many requests",
      status: 429,
      detail: `Too many requests. Try again in ${retryAfter} seconds`,
      instance: instance,
      limit: limit,
      window: window,
      retryAfter: retryAfter
   }),

   quotaExceeded: (instance: string, quotaType: string, limit: number, current: number, suggestion?: string) => ({
      type: "quota-exceeded" as const,
      title: "Quota exceeded",
      status: 429,
      detail: `You have reached the maximum ${quotaType.replace('-', ' ')} (${limit})`,
      instance: instance,
      quotaType: quotaType,
      limit: limit,
      current: current,
      ...(suggestion && { suggestion })
   }),

   // 500 Internal Server Error
   internalError: (instance: string, errorId: string) => ({
      type: "internal-error" as const,
      title: "Internal server error",
      status: 500,
      detail: "An unexpected error occurred. Our team has been notified. Please try again later",
      instance: instance,
      errorId: errorId,
      timestamp: new Date().toISOString(),
      supportEmail: "bienestaruniversitario@unraf.edu.ar"
   }),

   // 502 Bad Gateway
   externalServiceError: (instance: string, service: string, fallback?: string) => ({
      type: "external-service-error" as const,
      title: "External service error",
      status: 502,
      detail: `Unable to communicate with ${service}. ${fallback || 'Please try again later'}`,
      instance: instance,
      service: service,
      ...(fallback && { fallback })
   }),

   // 503 Service Unavailable
   serviceUnavailable: (instance: string, retryAfter?: number, maintenanceEnd?: string) => ({
      type: "service-unavailable" as const,
      title: "Service temporarily unavailable",
      status: 503,
      detail: maintenanceEnd
         ? `System maintenance in progress. Service will resume at ${maintenanceEnd}`
         : "The system is temporarily unavailable. Please try again later",
      instance: instance,
      ...(retryAfter && { retryAfter }),
      ...(maintenanceEnd && { maintenanceEnd })
   })
};