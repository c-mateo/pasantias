interface Context {
  instance: string
}

type ApiErrorPayload = {
  type: string
  title: string
  status: number
  detail: string
  meta?: Record<string, any>
}

export class ApiException extends Error {
  constructor(private payload: ApiErrorPayload) {
    super(JSON.stringify(payload))
  }

  format(context: Context) {
    return {
      type: this.payload.type,
      title: this.payload.title,
      status: this.payload.status,
      detail: this.payload.detail,
      instance: context.instance,
      ...(this.payload.meta ? { meta: this.payload.meta } : {}),
    }
  }
}

export const apiErrors = {
  // ===========================
  // 1. AUTHENTICATION (401)
  // ===========================

  invalidCredentials() {
    return new ApiException({
      type: 'invalid-credentials',
      title: 'Invalid credentials',
      status: 401,
      detail: 'The provided email or password is incorrect',
    })
  },

  sessionExpired(reason: 'idle' | 'absolute') {
    return new ApiException({
      type: 'session-expired',
      title: 'Session expired',
      status: 401,
      detail: 'Your session has expired',
      meta: { reason },
    })
  },

  authenticationRequired() {
    return new ApiException({
      type: 'authentication-required',
      title: 'Authentication required',
      status: 401,
      detail: 'You must be logged in to access this resource',
    })
  },

  // ===========================
  // 2. AUTHORIZATION (403)
  // ===========================

  forbidden() {
    return new ApiException({
      type: 'forbidden',
      title: 'Access denied',
      status: 403,
      detail: 'You are not allowed to access this resource',
    })
  },

  insufficientPermissions(requiredRole: string, currentRole: string) {
    return new ApiException({
      type: 'insufficient-permissions',
      title: 'Insufficient permissions',
      status: 403,
      detail: 'You do not have permission to perform this action',
      meta: { requiredRole, currentRole },
    })
  },

  // ===========================
  // 3. VALIDATION (400)
  // ===========================

  validationError(errors: Array<{ field: string; message: string }>) {
    return new ApiException({
      type: 'validation-error',
      title: 'Validation failed',
      status: 400,
      detail: 'One or more fields are invalid',
      meta: { errors },
    })
  },

  invalidFile(errors: Array<{ reason: string; field?: string }>) {
    return new ApiException({
      type: 'invalid-file',
      title: 'Invalid file',
      status: 400,
      detail: 'The uploaded file is not valid',
      meta: { errors },
    })
  },

  missingRequiredFields(missingFields: string[]) {
    return new ApiException({
      type: 'missing-required-fields',
      title: 'Missing required fields',
      status: 400,
      detail: 'Some required fields are missing',
      meta: { missingFields },
    })
  },

  // ===========================
  // 4. RESOURCE (404 / 410 / 400)
  // ===========================

  notFound(resourceType: string, resourceId: string | number) {
    return new ApiException({
      type: 'not-found',
      title: 'Resource not found',
      status: 404,
      detail: `The requested ${resourceType.toLowerCase()} doesn't exist`,
      meta: { resourceType, resourceId },
    })
  },

  resourceDeleted(
    resourceType: string,
    resourceId: string | number,
    deletedAt: string,
    anonymized = false
  ) {
    return new ApiException({
      type: 'resource-deleted',
      title: 'Resource deleted',
      status: 410,
      detail: 'The requested resource has been deleted',
      meta: { resourceType, resourceId, deletedAt, anonymized },
    })
  },

  resourceUnavailable(
    resourceType: string,
    resourceId: string | number,
    currentStatus: string,
    requiredStatus?: string,
    expiredAt?: string
  ) {
    return new ApiException({
      type: 'resource-unavailable',
      title: 'Resource unavailable',
      status: 400,
      detail: 'The requested resource cannot be accessed in its current state',
      meta: { resourceType, resourceId, currentStatus, requiredStatus, expiredAt },
    })
  },

  // ===========================
  // 5. CONFLICTS (409)
  // ===========================

  alreadyExists(resourceType: string, field: string, value: string) {
    return new ApiException({
      type: 'already-exists',
      title: 'Resource already exists',
      status: 409,
      detail: `A ${resourceType.toLowerCase()} with this ${field} already exists`,
      meta: { resourceType, conflicts: [{ field, value }] },
    })
  },

  multipleUniqueConflicts(
    resourceType: string,
    conflicts: Array<{ field: string; value: any }>
  ) {
    return new ApiException({
      type: "already-exists",
      title: "Resource already exists",
      status: 409,
      detail: "Some fields must be unique but are already in use",
      meta: { resourceType, conflicts },
    })
  },

  emailAlreadyRegistered(email: string) {
    return new ApiException({
      type: 'email-already-registered',
      title: 'Email already registered',
      status: 409,
      detail: 'This email is already associated with an account',
      meta: { email },
    })
  },

  alreadyApplied(applicationId: number, appliedAt: string, applicationStatus: string) {
    return new ApiException({
      type: 'already-applied',
      title: 'Already applied',
      status: 409,
      detail: 'You have already applied to this offer',
      meta: { applicationId, appliedAt, applicationStatus },
    })
  },

  resourceInUse(
    resourceType: string,
    resourceId: number | string,
    usageCount: Record<string, number>,
    suggestion?: string
  ) {
    return new ApiException({
      type: 'resource-in-use',
      title: 'Resource in use',
      status: 409,
      detail: 'The resource is currently in use and cannot be deleted',
      meta: { resourceType, resourceId, usageCount, suggestion },
    })
  },

  invalidStateTransition(
    resourceType: string,
    resourceId: number | string,
    currentStatus: string,
    requestedStatus: string,
    allowedTransitions: string[]
  ) {
    return new ApiException({
      type: 'invalid-state-transition',
      title: 'Invalid state transition',
      status: 409,
      detail: 'The requested state transition is not allowed',
      meta: { resourceType, resourceId, currentStatus, requestedStatus, allowedTransitions },
    })
  },

  operationNotAllowed(operation: string, extra: Record<string, any> = {}) {
    return new ApiException({
      type: 'operation-not-allowed',
      title: 'Operation not allowed',
      status: 409,
      detail: `The operation "${operation}" cannot be performed`,
      meta: { operation, ...extra },
    })
  },

  // ===========================
  // 6. RESOURCE STATUS (423 / 400 / 409)
  // ===========================

  resourceBlocked(
    resourceType: string,
    resourceId: string | number,
    blockReason: string,
    blockedAt: string,
    requiredActions: string[],
    unblockUrl?: string
  ) {
    return new ApiException({
      type: 'resource-blocked',
      title: 'Resource blocked',
      status: 423,
      detail: 'This resource is blocked and cannot be modified',
      meta: { resourceType, resourceId, blockReason, blockedAt, requiredActions, unblockUrl },
    })
  },

  incompleteDraft(
    completed: number,
    total: number,
    missing: { documents?: string[]; customFields?: string[] }
  ) {
    return new ApiException({
      type: 'incomplete-draft',
      title: 'Incomplete draft',
      status: 400,
      detail: 'The draft cannot be submitted because it is incomplete',
      meta: { completed, total, missing },
    })
  },

  offerRequirementsChanged(offerId: number, changedAt: string, newRequirements: any[]) {
    return new ApiException({
      type: 'offer-requirements-changed',
      title: 'Offer requirements updated',
      status: 409,
      detail: 'The offer requirements changed while you were applying',
      meta: { offerId, changedAt, newRequirements },
    })
  },

  // ===========================
  // 7. RATE LIMITING (429)
  // ===========================

  rateLimitExceeded(limit: number, window: string, retryAfter: number) {
    return new ApiException({
      type: 'rate-limit-exceeded',
      title: 'Too many requests',
      status: 429,
      detail: 'You have exceeded the request limit',
      meta: { limit, window, retryAfter },
    })
  },

  quotaExceeded(quotaType: string, limit: number, current: number, suggestion?: string) {
    return new ApiException({
      type: 'quota-exceeded',
      title: 'Quota exceeded',
      status: 429,
      detail: 'The allowed quota has been exceeded',
      meta: { quotaType, limit, current, suggestion },
    })
  },

  // ===========================
  // 8. SERVER ERRORS (500 / 502 / 503)
  // ===========================

  internalError(errorId: string, supportEmail: string) {
    return new ApiException({
      type: 'internal-error',
      title: 'Internal server error',
      status: 500,
      detail: 'An unexpected error occurred',
      meta: { errorId, supportEmail },
    })
  },

  externalServiceError(service: string, fallback?: string) {
    return new ApiException({
      type: 'external-service-error',
      title: 'External service error',
      status: 502,
      detail: 'An external service returned an invalid or error response',
      meta: { service, fallback },
    })
  },

  serviceUnavailable(retryAfter?: number, maintenanceEnd?: string) {
    return new ApiException({
      type: 'service-unavailable',
      title: 'Service unavailable',
      status: 503,
      detail: 'The service is temporarily unavailable',
      meta: { retryAfter, maintenanceEnd },
    })
  },

  // ===========================
  // 9. OTHER (400)
  // ===========================

  noChanges() {
    return new ApiException({
      type: 'no-changes',
      title: 'No changes detected',
      status: 400,
      detail: 'The request contains no changes',
    })
  },
}
