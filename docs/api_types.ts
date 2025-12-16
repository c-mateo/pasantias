// --- Utility Types ---

/** Tipo para respuestas que no devuelven body (204 No Content) */
export type NoContent = void

/** Estructura base para datos paginados */
export interface Pagination {
  limit: number
  hasNext: boolean
  next: number | null
}

/** Respuesta paginada genérica */
export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}

/** Query parameters comunes para paginación y ordenamiento */
export interface PaginationQuery {
  limit?: number
  after?: string
  sort?: string
  filter?: string
}

// --- General DTOs ---

export interface SkillDTO {
  id: number
  name: string
  description?: string
  createdAt?: string // Omitido si no es Admin
  updatedAt?: string // Omitido si no es Admin
}

export interface CourseDTO {
  id: number
  name: string
  shortName?: string
  description?: string
  createdAt?: string // Omitido si no es Admin
  updatedAt?: string // Omitido si no es Admin
}

export interface DocumentTypeDTO {
    id: number
    name: string
}

// --- Auth Endpoints ---

export interface RegisterBody {
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

export interface RegisterResponse {
  id: number
  email: string
  role: 'STUDENT' | 'ADMIN'
  firstName: string
  lastName: string
  links: { rel: 'login', href: string, method: 'POST' }[]
}

export interface UserLoginDTO {
  id: number
  email: string
  role: 'STUDENT' | 'ADMIN'
  firstName: string
  lastName: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    user: UserLoginDTO
    sessionExpiresAt: string
    links: { rel: string, href: string, method: string }[]
  }
}

// --- Profile Endpoints ---

export interface ProfileResponse {
  data: {
    role: 'STUDENT' | 'ADMIN'
    firstName: string
    lastName: string
    dni: string
    phone: string
    address: string
    city: string
    province: string
    courses: CourseDTO[]
    skills: SkillDTO[]
  }
  links: { rel: string, href: string, method: string }[]
}

export interface ProfileUpdateBody {
  skillsIds?: number[]
  coursesIds?: number[]
}

// --- Company Endpoints ---

export interface CompanyDTO {
  id: number
  name: string
  description?: string
  website?: string
  email: string
  phone?: string
  logo?: string
  // Note: createdAt, updatedAt, deletedAt omitted in list/get for non-admin
}

export interface CompanyDetailsResponse {
    data: CompanyDTO;
    links: { rel: 'offers', href: string, method: 'GET' }[];
}


export interface CompanyCreateBody {
  name: string
  description?: string
  website?: string
  email: string
  phone?: string
  logo?: string
}

export interface CompanyUpdateBody extends Partial<CompanyCreateBody> {}


// --- Offer Endpoints ---

export interface OfferListCompanyDTO {
  id: number
  name: string
  logo?: string
}

export interface OfferListDTO {
  id: number
  position: string
  description: string
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  vacancies: number
  location?: string
  salary?: number
  durationWeeks?: number
  startDate?: string
  expiresAt?: string
  company: OfferListCompanyDTO
  skills: SkillDTO[]
  courses: Pick<CourseDTO, 'id' | 'name' | 'shortName'>[]
}

// Used in GET /companies/:id/offers
export interface OfferCompanyDTO extends Omit<OfferListDTO, 'courses'> {
    company: CompanyDTO
    skills: SkillDTO[]
}

export interface OfferDetailsCompanyDTO extends Omit<CompanyDTO, 'createdAt' | 'updatedAt' | 'deletedAt'> {}

export interface OfferDetailsResponse {
  data: Omit<OfferListDTO, 'company' | 'courses' | 'skills'> & {
    company: OfferDetailsCompanyDTO
    skills: Pick<SkillDTO, 'id' | 'name' | 'description'>[]
    courses: Pick<CourseDTO, 'id' | 'name' | 'shortName'>[]
    requiredDocuments: DocumentTypeDTO[]
  }
}

export interface OfferCreateBody {
  position: string
  description: string
  companyId: number
  status: 'DRAFT' | 'ACTIVE'
  vacancies: number
  location?: string
  salary?: number
  durationWeeks?: number
  startDate?: string
  expiresAt?: string
  skills?: number[]
  requiredDocuments?: number[]
}

export interface OfferUpdateBody extends Partial<OfferCreateBody> {}

export interface OfferUpdateResponse {
    data: OfferDTO // Returns the updated offer object
}

// Placeholder for full Offer (used in Admin create/update)
export interface OfferDTO extends Omit<OfferListDTO, 'company' | 'skills' | 'courses'> {}

// --- Application Endpoints ---

export type ApplicationStatus = 'PENDING' | 'BLOCKED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export interface ApplicationOfferDTO {
    id: number
    title: string
    company: {
        id: number
        name: string
    }
}

// Used in GET /my-applications
export interface ApplicationUserDTO {
  id: number
  status: ApplicationStatus
  createdAt: string
  finalizedAt?: string
  offer: ApplicationOfferDTO
}

export interface ApplicationAttachmentDTO {
    id: number
    originalName: string
    documentType: string // Name of DocumentType
}

// Used in GET /my-applications/:id
export interface ApplicationDetailsResponse {
  data: {
    id: number
    offer: ApplicationOfferDTO
    status: ApplicationStatus
    createdAt: string
    customFieldsValues: Record<string, any>
    finalizedAt?: string
    feedback?: string
    unblockedAt?: string
    blockedAt?: string
    blockReason?: string
    documents: ApplicationAttachmentDTO[]
  }
  links: { rel: string, href: string, method: string }[]
}

export interface ApplicationUpdateStatusBody {
  status: Exclude<ApplicationStatus, 'PENDING'>
  blockReason?: string // Required if status is BLOCKED
  feedback?: string // Required if status is ACCEPTED or REJECTED
}

// --- Draft Endpoints ---

export interface DraftDTO {
  id: number
  userId: number
  offerId: number
  customFieldsValues?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface DraftSaveBody {
  customFieldsValues?: Record<string, any>
}

export interface DraftAttachmentDTO {
    id: number;
    documentId: number;
    draftId: number;
    // ... otros campos de attachment
}

export interface DraftSaveResponse {
    data: DraftDTO & { attachments: DraftAttachmentDTO[] }
}

export interface ApplicationSubmitResponse {
    data: {
        applicationId: number
        status: ApplicationStatus
        appliedAt: string
    }
}

export interface UploadDocumentHeaders {
  'content-type': 'application/pdf'
  'content-length': number
  'x-original-filename': string
}

export interface UploadDocumentResponse extends DocumentAttachmentDTO {
    links: { rel: 'document', href: string, method: 'GET' }[]
}

export interface DocumentAttachmentDTO {
    id: number
    documentTypeId: number
    originalName: string
    size: number
    hash: { sha256: string }
}

export interface UseExistingDocumentBody {
  documentId: number
}


// --- My Documents Endpoints ---

export interface DocumentDTO {
    id: number
    documentType: DocumentTypeDTO
    originalName: string
    hash: { sha256: string }
    createdAt: string
    lastUsedAt: string
}

export interface DocumentDetailsResponse {
    data: DocumentDTO & { size: number }
    links: { rel: string, href: string, method: string }[]
}

// --- Admin Endpoints ---

export interface UserAdminDTO {
  id: number
  email: string
  phone?: string
  firstName: string
  lastName: string
  dni: string
  role: 'STUDENT' | 'ADMIN'
  createdAt: string
  updatedAt: string
  // Campos adicionales para el GET /admin/users/:id
  address?: string
  province?: string
  city?: string
}

export interface SkillCreateBody extends Pick<SkillDTO, 'name'> {
    description?: string
}

export interface SkillUpdateBody extends Partial<SkillCreateBody> {}

// Notifications Admin

export interface NotificationBroadcastBody {
    title: string
    message: string
    userIds?: number[] // If omitted, broadcasts to all students (role STUDENT). Provided userIds will be filtered to include only students.
}

export interface BroadcastResponse {
    data: {
        accepted: boolean // Indicates that the job was successfully enqueued
    }
}

export interface NotificationDTO {
    id: number
    title: string
    message: string
    type: string
    createdAt: string
    readAt?: string
}