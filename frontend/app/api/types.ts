// Types for API responses based on backend controllers and Prisma schema

export type Link = { rel: string; href: string; method: string }

export type ApiError = {
  type: string
  title: string
  status: number
  detail: string
  instance: string
  meta?: Record<string, any>
}

export type Pagination = {
  limit: number
  next: number | null
  hasNext: boolean
}

export type Paginated<T> = {
  data: T[]
  pagination: Pagination
}

// Enums (copied from prisma generated enums.ts)
export type UserRole = 'STUDENT' | 'ADMIN'
export type OfferStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'EXPIRED'
export type ApplicationStatus = 'PENDING' | 'BLOCKED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_ACCEPTED'
  | 'APPLICATION_REJECTED'
  | 'OFFER_PUBLISHED'
  | 'OFFER_CLOSING_SOON'
  | 'ADMIN_ANNOUNCEMENT'

// Common small DTOs
export type CompanyShort = {
  id: number
  name: string
  logo?: string | null
}

export type CompanyDTO = {
  id: number
  name: string
  description?: string | null
  website?: string | null
  email: string
  phone?: string | null
  logo?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CourseDTO = {
  id: number
  name: string
  description?: string | null
  shortName?: string | null
  createdAt?: string
  updatedAt?: string
}

export type SkillDTO = {
  id: number
  name: string
  description?: string | null
}

export type DocumentTypeDTO = {
  id: number
  name: string
}

export type DocumentHash = { sha256: string }

export type DocumentShort = {
  id: number
  originalName: string
  size?: number
  hash?: DocumentHash
  documentType?: DocumentTypeDTO | null
  createdAt?: string
  lastUsedAt?: string
}

export type DraftDTO = {
  id: number
  userId: number
  offerId: number
  customFieldsValues?: any
  attachments?: { id: number; document: DocumentShort }[]
  createdAt?: string
  updatedAt?: string
}

export type OfferShort = {
  id: number
  title: string
  company?: CompanyShort
}

export type OfferDTO = {
  id: number
  companyId: number
  title: string
  description: string
  status: OfferStatus
  location?: string | null
  salary?: number | null
  durationWeeks?: number | null
  startDate?: string | null
  publishedAt?: string | null
  expiresAt?: string | null
  closedAt?: string | null
  skills?: SkillDTO[]
  company?: CompanyDTO
}

export type OfferDetailedDTO = OfferDTO & {
  requiredDocuments?: DocumentTypeDTO[]
}

export type ApplicationListItem = {
  id: number
  status: ApplicationStatus
  createdAt: string
  finalizedAt?: string | null
  offer: OfferShort
}

export type ApplicationDTO = {
  id: number
  offer: OfferShort
  status: ApplicationStatus
  createdAt: string
  customFieldsValues?: any
  // When application finalized
  finalizedAt?: string | null
  feedback?: string | null
  // When blocked
  blockedAt?: string | null
  blockReason?: string | null
  // Documents attached
  documents?: { id: number; originalName: string; documentType: string }[]
}

export type NotificationDTO = {
  id: number
  userId?: number
  type: NotificationType
  title: string
  message: string
  relatedId?: number | null
  isRead: boolean
  readAt?: string | null
  createdAt?: string
}

export type UserDTO = {
  id: number
  email?: string
  phone?: string | null
  firstName?: string
  lastName?: string
  dni?: string
  address?: string | null
  province?: string | null
  city?: string | null
  role?: UserRole
  createdAt?: string
  updatedAt?: string
  courses?: CourseDTO[]
  skills?: SkillDTO[]
}

// Envelope responses per endpoint
// Auth
export type RegisterResponse = { data: { id: number; email: string; role: UserRole; firstName: string; lastName: string }; links?: Link[] }
export type LoginResponse = {
  data: {
    user: Pick<UserDTO, 'id' | 'email' | 'role' | 'firstName' | 'lastName'>
    sessionExpiresAt: string
    links?: Link[]
  }
}

// Request types (bodies)
export type RegisterRequest = {
  email: string
  password: string
  firstName: string
  lastName: string
  dni: string
  phone: string
  address: string
  province: string
  city: string
}

export type LoginRequest = { email: string; password: string }

export type UpdateProfileRequest = { skillsIds?: number[]; coursesIds?: number[] }

export type CourseCreateRequest = { name: string; shortName?: string | null; description?: string | null }
export type CourseUpdateRequest = Partial<CourseCreateRequest>

export type CompanyCreateRequest = { name: string; description?: string | null; website?: string | null; email: string; phone?: string | null; logo?: string | null }
export type CompanyUpdateRequest = Partial<CompanyCreateRequest>

export type OfferCreateRequest = {
  title: string
  description: string
  companyId: number
  status?: OfferStatus
  location?: string | null
  salary?: number | null
  durationWeeks?: number | null
  startDate?: string | null
  expiresAt?: string | null
  skills?: number[]
  requiredDocuments?: number[]
}

export type OfferUpdateRequest = Partial<OfferCreateRequest>

export type DraftSaveRequest = { customFieldsValues?: any }

export type UseExistingDocumentRequest = { documentId: number }

export type UploadDocumentRequest = Blob | ArrayBuffer | File

export type SkillCreateRequest = { name: string; description?: string }
export type SkillUpdateRequest = Partial<SkillCreateRequest>

export type ApplicationStatusUpdateRequest = { status: ApplicationStatus; blockReason?: string; feedback?: string }

export type BroadcastRequest = { title: string; message: string; userIds?: number[] }

// Profile
export type ProfileResponse = { data: UserDTO; links?: Link[] }
export type UpdateProfileResponse = { data: UserDTO }

// Courses
export type CoursesListResponse = Paginated<CourseDTO>
export type CourseResponse = { data: CourseDTO; links?: Link[] }

// Companies
export type CompaniesListResponse = Paginated<CompanyDTO>
export type CompanyResponse = { data: CompanyDTO; links?: Link[] }

// Offers
export type OffersListResponse = Paginated<OfferDTO>
export type OfferResponse = { data: OfferDetailedDTO }

// Drafts
export type DraftGetResponse = DraftDTO | undefined // controller returns draft or 204
export type DraftSaveResponse = { data: DraftDTO }
export type UploadDocumentResponse = { data: { id: number; documentTypeId: number; originalName: string; size: number; hash: DocumentHash }; links?: Link[] }
export type UseExistingDocumentResponse = UploadDocumentResponse
export type DraftGetDocumentsResponse = { data: DocumentShort[] }
export type DraftSubmitResponse = { data: { applicationId: number; status: ApplicationStatus; appliedAt: string } }

// My Documents
export type MyDocumentsListResponse = Paginated<DocumentShort>
export type MyDocumentGetResponse = { data: DocumentShort; links?: Link[] }

// Skills
export type SkillsListResponse = Paginated<SkillDTO>
export type SkillResponse = { data: SkillDTO }
export type SkillDeleteResponse = { message: string }

// Applications
export type MyApplicationsListResponse = Paginated<ApplicationListItem>
export type ApplicationGetResponse = { data: ApplicationDTO; links?: Link[] }

// Users (admin)
export type UsersListResponse = Paginated<UserDTO>
export type UserResponse = { data: UserDTO }

// Notifications
export type NotificationsListResponse = Paginated<NotificationDTO>
export type NotificationResponse = { data: NotificationDTO; links?: Link[] }
export type MarkAsReadResponse = { data: { id: number; title: string; isRead: boolean; readAt?: string } }
export type BroadcastAcceptedResponse = { data: { accepted: boolean } }

// General cases
export type NoContent = void
export type FileResponse = Blob | ArrayBuffer

// Union types for endpoints
export type ApiResponse<T> = T | ApiError

// Map of route -> response types (partial list)
export type ApiResponses = {
  // Auth
  'POST /api/v1/auth/register': RegisterResponse
  'POST /api/v1/auth/login': LoginResponse
  'POST /api/v1/auth/logout': NoContent
  // Profile
  'GET /api/v1/profile': ProfileResponse
  'PATCH /api/v1/profile': UpdateProfileResponse
  // Courses
  'GET /api/v1/courses': CoursesListResponse
  'GET /api/v1/courses/:id': CourseResponse
  'POST /api/v1/courses': CourseResponse
  'PATCH /api/v1/courses/:id': CourseResponse
  'DELETE /api/v1/courses/:id': NoContent
  // Companies
  'GET /api/v1/companies': CompaniesListResponse
  'GET /api/v1/companies/:id': CompanyResponse
  'POST /api/v1/companies': CompanyDTO
  'PATCH /api/v1/companies/:id': CompanyResponse
  'DELETE /api/v1/companies/:id': NoContent
  'GET /api/v1/companies/:id/offers': OffersListResponse
  // Offers
  'GET /api/v1/offers': OffersListResponse
  'GET /api/v1/offers/:id': OfferResponse
  'POST /api/v1/offers': OfferResponse
  'PATCH /api/v1/offers/:id': OfferResponse
  'DELETE /api/v1/offers/:id': NoContent
  'GET /api/v1/offers/:offerId/draft': DraftGetResponse
  'PATCH /api/v1/offers/:offerId/draft': DraftSaveResponse
  'POST /api/v1/offers/:offerId/draft/submit': DraftSubmitResponse
  'PUT /api/v1/offers/:offerId/draft/documents': UploadDocumentResponse
  'DELETE /api/v1/offers/:offerId/draft/documents/:attachmentId': NoContent
  'POST /api/v1/offers/:offerId/draft/documents/use-existing': UseExistingDocumentResponse
  // Documents
  'GET /api/v1/my-documents': MyDocumentsListResponse
  'GET /api/v1/my-documents/:id': MyDocumentGetResponse | FileResponse
  'DELETE /api/v1/my-documents/:id': NoContent
  'POST /api/v1/my-documents/:id/download': FileResponse
  // Skills
  'GET /api/v1/skills': SkillsListResponse
  'GET /api/v1/skills/:id': SkillResponse
  'POST /api/v1/skills': SkillResponse
  'PATCH /api/v1/skills/:id': SkillResponse
  'DELETE /api/v1/skills/:id': SkillDeleteResponse
  // Applications
  'GET /api/v1/my-applications': MyApplicationsListResponse
  'GET /api/v1/my-applications/:id': ApplicationGetResponse
  'DELETE /api/v1/my-applications/:id': NoContent
  'GET /api/v1/applications': MyApplicationsListResponse
  'GET /api/v1/applications/:id': ApplicationGetResponse
  'PATCH /api/v1/applications/:id/status': NoContent
  // Users
  'GET /api/v1/users': UsersListResponse
  'GET /api/v1/users/:id': UserResponse
  'DELETE /api/v1/users/:id': NoContent
  // Notifications
  'GET /api/v1/notifications': NotificationsListResponse
  'GET /api/v1/notifications/:id': NotificationResponse
  'PATCH /api/v1/notifications/:id/mark-as-read': MarkAsReadResponse
  'DELETE /api/v1/notifications/:id': NoContent
  'POST /api/v1/notifications/broadcast': BroadcastAcceptedResponse
}


// Helper: build typed fetch wrapper return types
export type ApiResult<T extends keyof ApiResponses> = ApiResponses[T]
