// --- 0. Enums y Tipos de Auditoría ---

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

/** Campos de auditoría visibles solo para el rol ADMIN */
export interface AuditFields {
    createdAt: string
    updatedAt: string
}

// --- 1. Utility Types ---

/** Tipo para respuestas que no devuelven body (204 No Content) */
export type NoContent = void

/** Estructura base para metadatos de paginación por cursor */
export interface CursorPagination {
  limit: number
  hasNext: boolean
  next: number | null
}
/** Respuesta paginada genérica */
export interface Paginated<T> {
  data: T[]
  pagination: CursorPagination
}
export interface QueryParams {
  sort?: string
  filter?: string
}
export interface PaginationQuery extends QueryParams {
  limit?: number
  after?: number // El cursor
}
/** Tipo genérico para respuestas de detalle que contienen el objeto dentro de 'data' */
export interface DetailResponse<T> {
  data: T
  links?: { rel: string, href: string, method: string }[]
}


// --- 2. Base DTOs (Canónicos con Auditoría para Admin) ---

export interface DocumentTypeDTO extends AuditFields {
    id: number
    name: string
}

export interface SkillDTO extends AuditFields {
  id: number
  name: string
  description?: string
}

export interface CourseDTO extends AuditFields {
  id: number
  name: string
  shortName?: string
  description?: string
}

export interface CompanyDTO extends AuditFields {
  id: number
  name: string
  description?: string
  website?: string
  email: string
  phone?: string
  logo?: string
}

export interface OfferDTO {
    id: number
    position: string
    description: string
    status: OfferStatus
    vacancies: number
    requirements?: string
    location?: string
    salary?: number
    durationWeeks?: number
    startDate?: string // ISO Date string
    expiresAt?: string // ISO Date string
    publishedAt: string // Campo esencial para todos los usuarios
}

export interface UserAdminDTO extends AuditFields {
  id: number
  email: string
  phone?: string
  firstName: string
  lastName: string
  dni: string
  role: UserRole
  address?: string
  province?: string
  city?: string
}


// --- 3. Reference DTOs (Mini-DTOs) ---

export type SkillRefDTO = Pick<SkillDTO, 'id' | 'name'>
export type CourseRefDTO = Pick<CourseDTO, 'id' | 'name' | 'shortName'>
export type CompanyRefDTO = Pick<CompanyDTO, 'id' | 'name' | 'logo'>
export type DocTypeRefDTO = Pick<DocumentTypeDTO, 'id' | 'name'>
export type ApplicationCompanyRefDTO = Pick<CompanyDTO, 'id' | 'name'>


// --- 4. Respuestas Condicionales por Rol ---

/** Tipos de recursos que ocultan campos de auditoría para el estudiante. */
export type PublicCourseDTO = Omit<CourseDTO, keyof AuditFields>
export type PublicSkillDTO = Omit<SkillDTO, keyof AuditFields>
export type PublicDocumentTypeDTO = Omit<DocumentTypeDTO, keyof AuditFields>


// --- 5. Respuestas Híbridas y Finales ---

// --- Authentication & Profile ---
export interface RegisterBody extends Pick<UserAdminDTO, 'email' | 'firstName' | 'lastName' | 'dni' | 'phone' | 'address' | 'province' | 'city'> { password: string }
export type RegisterResponse = DetailResponse<Omit<UserAdminDTO, 'phone' | 'address' | 'province' | 'city' | 'dni' | keyof AuditFields>> 

export interface LoginBody { email: string; password: string; }
export interface UserLoginDTO extends Pick<UserAdminDTO, 'id' | 'email' | 'role' | 'firstName' | 'lastName'> {}
export interface LoginResponse { data: { user: UserLoginDTO; sessionExpiresAt: string; links: { rel: string, href: string, method: string }[]; } }

export interface ProfileUpdateBody { skillsIds?: number[]; coursesIds?: number[]; }
export type ProfileDTO = Omit<UserAdminDTO, keyof AuditFields> & {
    email: string;
    courses: PublicCourseDTO[] 
    skills: PublicSkillDTO[]
}
export type ProfileResponse = DetailResponse<ProfileDTO>
export type ProfileUpdateResponse = DetailResponse<ProfileDTO>

// --- Company ---
export type CompanyListResponse = Paginated<Omit<CompanyDTO, keyof AuditFields | 'email' | 'phone'>> 
export type CompanyDetailsResponse = DetailResponse<Omit<CompanyDTO, keyof AuditFields>> 

// --- Offer ---
export interface OfferListDTO extends OfferDTO {
  company: CompanyRefDTO
  skills: SkillRefDTO[] 
  courses: CourseRefDTO[]
}
export type OfferListResponse = Paginated<OfferListDTO>

export interface OfferDetailsDTO extends OfferDTO {
    company: Pick<CompanyDTO, 'id' | 'name' | 'description' | 'logo' | 'website' | 'email' | 'phone'> 
    skills: Pick<SkillDTO, 'id' | 'name' | 'description'>[] 
    courses: CourseRefDTO[] 
    requiredDocuments: DocTypeRefDTO[]
}
export type OfferDetailsResponse = DetailResponse<OfferDetailsDTO>

export interface OfferCompanyDTO extends OfferDTO {
    skills: SkillRefDTO[]
}
export type CompanyOffersResponse = Paginated<OfferCompanyDTO>

// --- Skills & Courses ---
export type SkillListResponse = Paginated<PublicSkillDTO>
export type SkillDetailsResponse = DetailResponse<PublicSkillDTO>
export type CourseListResponse = Paginated<PublicCourseDTO>
export type CourseDetailsResponse = DetailResponse<PublicCourseDTO>


// --- 6. Aplicaciones y Documentos del Usuario ---

export interface ApplicationOfferDTO { id: number; title: string; company: ApplicationCompanyRefDTO; }
export interface ApplicationUserDTO { id: number; status: ApplicationStatus; createdAt: string; finalizedAt?: string; offer: ApplicationOfferDTO; }
export type ApplicationUserListResponse = Paginated<ApplicationUserDTO>

export interface ApplicationAttachmentMinimalDTO { id: number; originalName: string; documentType: string; }
export interface ApplicationDetailsDTO {
    id: number
    offer: ApplicationOfferDTO
    status: ApplicationStatus
    createdAt: string
    customFieldsValues: Record<string, any>
    finalizedAt?: string
    feedback?: string
    blockedAt?: string
    blockReason?: string
    unblockedAt?: string
    documents: ApplicationAttachmentMinimalDTO[]
}
export type ApplicationDetailsResponse = DetailResponse<ApplicationDetailsDTO>

export interface DocumentDTO {
    id: number
    documentType: DocTypeRefDTO
    originalName: string
    hash: { sha256: string }
    createdAt: string
    lastUsedAt: string
}
export type MyDocumentsListResponse = Paginated<DocumentDTO>

export type DocumentDetailsResponse = DetailResponse<DocumentDTO & { size: number }>


// --- 7. Drafts & Uploads (Bodies & Responses) ---

export interface DraftSaveBody { customFieldsValues?: Record<string, any>; }
export type DraftDeleteResponse = NoContent

export interface DraftDTO { id: number; userId: number; offerId: number; customFieldsValues?: Record<string, any>; createdAt: string; updatedAt: string; }
export interface DraftAttachmentDTO { id: number; documentId: number; draftId: number; }
export type DraftGetResponse = DetailResponse<DraftDTO & { attachments: DraftAttachmentDTO[] }>
export type DraftSaveResponse = DetailResponse<DraftDTO & { attachments: DraftAttachmentDTO[] }>

export interface ApplicationSubmitResponse { data: { applicationId: number; status: ApplicationStatus; appliedAt: string; } }

export interface UploadDocumentHeaders { 'content-type': 'application/pdf'; 'content-length': number; 'x-original-filename': string; }
export interface DocumentAttachmentInfoDTO { id: number; documentTypeId: number; originalName: string; size: number; hash: { sha256: string }; }
export type UploadDocumentResponse = DetailResponse<DocumentAttachmentInfoDTO>

export interface UseExistingDocumentBody { documentId: number; }
export type UseExistingDocumentResponse = DetailResponse<DraftAttachmentDTO>


// --- 8. Administración (Bodies & Responses) ---

export type UserListResponse = Paginated<UserAdminDTO>
export type UserDetailsResponse = DetailResponse<UserAdminDTO>
export type UserDeleteResponse = NoContent

// Admin CRUD - Company
export interface CompanyCreateBody extends Pick<CompanyDTO, 'name' | 'email'> { description?: string; website?: string; phone?: string; logo?: string; }
export interface CompanyUpdateBody extends Partial<CompanyCreateBody> {}
export type CompanyCreateResponse = DetailResponse<CompanyDTO>
export type CompanyUpdateResponse = DetailResponse<CompanyDTO>
export type CompanyDeleteResponse = NoContent

// Admin CRUD - Course
export interface CourseCreateBody extends Pick<CourseDTO, 'name'> { shortName?: string; description?: string; }
export interface CourseUpdateBody extends Partial<CourseCreateBody> {}
export type CourseCreateResponse = DetailResponse<CourseDTO>
export type CourseUpdateResponse = DetailResponse<CourseDTO>
export type CourseDeleteResponse = NoContent

// Admin CRUD - Skill
export interface SkillCreateBody extends Pick<SkillDTO, 'name'> { description?: string; }
export interface SkillUpdateBody extends Partial<SkillCreateBody> {}
export type SkillCreateResponse = DetailResponse<SkillDTO>
export type SkillUpdateResponse = DetailResponse<SkillDTO>
export type SkillDeleteResponse = NoContent

// Admin CRUD - Offer
export interface OfferCreateBody extends Pick<OfferDTO, 'position' | 'description' | 'status' | 'vacancies' | 'publishedAt'> {
    companyId: number; location?: string; salary?: number; durationWeeks?: number; startDate?: string; expiresAt?: string; skills?: number[]; requiredDocuments?: number[];
}
export interface OfferUpdateBody extends Partial<OfferCreateBody> {}
export type OfferCreateResponse = DetailResponse<OfferDetailsDTO>
export type OfferUpdateResponse = DetailResponse<OfferDetailsDTO>
export type OfferDeleteResponse = NoContent

// Admin - Application Status
export interface ApplicationUpdateStatusBody {
  status: Exclude<ApplicationStatus, 'CANCELLED'>
  blockReason?: string
  feedback?: string 
} 
export type ApplicationUpdateStatusResponse = NoContent

// Admin - Notifications
// If omitted, broadcasts to all students (role STUDENT)
export interface NotificationBroadcastBody { userIds?: number[]; title: string; message: string; }
export interface BroadcastResponse { data: { accepted: boolean; } }
export interface NotificationDTO {
    id: number; title: string; message: string; type: NotificationType; createdAt: string; readAt?: string;
}
export type NotificationsListResponse = Paginated<NotificationDTO>

export type NotificationUpdateResponse = DetailResponse<Pick<NotificationDTO, 'id' | 'title' | 'readAt'> & { isRead: boolean }>
export type NotificationDeleteResponse = NoContent