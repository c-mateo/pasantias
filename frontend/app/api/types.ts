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
export interface Paginated<T> { data: T[]; pagination: CursorPagination; }
export interface QueryParams { sort?: string; filter?: string; }
export interface PaginationQuery extends QueryParams { limit?: number; after?: number; }
/** Tipo genérico para respuestas de detalle que contienen el objeto dentro de 'data' */
export interface DetailResponse<T> { data: T; links?: { rel: string, href: string, method: string }[]; }


// --- 2. Base DTOs (Canónicos) ---

export interface DocumentTypeDTO extends AuditFields { id: number; name: string; }
export interface SkillDTO extends AuditFields { id: number; name: string; description?: string | null; }
export interface CourseDTO extends AuditFields { id: number; name: string; shortName?: string | null; description?: string | null; }
export interface CompanyDTO extends AuditFields { id: number; name: string; description?: string | null; website?: string | null; email: string; phone?: string | null; logo?: string | null; }

export interface OfferDTO {
    id: number
    position: string
    description: string
    status: OfferStatus
    vacancies: number
    requirements?: string | null
    location?: string | null
    salary?: number | null
    durationWeeks?: number | null
    startDate?: string | null 
    expiresAt?: string | null 
    publishedAt: string | null 
}

export interface UserAdminDTO extends AuditFields { id: number; email: string; phone?: string | null; firstName: string; lastName: string; cuil: string; role: UserRole; address?: string | null; province?: string | null; city?: string | null; }


// --- 3. Reference DTOs (Mini-DTOs) ---

export type SkillRefDTO = Pick<SkillDTO, 'id' | 'name'>
export type CourseRefDTO = Pick<CourseDTO, 'id' | 'name' | 'shortName'>
export type CompanyRefDTO = Pick<CompanyDTO, 'id' | 'name' | 'logo'>
export type DocTypeRefDTO = Pick<DocumentTypeDTO, 'id' | 'name'>
export type ApplicationCompanyRefDTO = Pick<CompanyDTO, 'id' | 'name'>


// --- 4. Respuestas Condicionales por Rol ---

export type PublicCourseDTO = Omit<CourseDTO, keyof AuditFields>
export type PublicSkillDTO = Omit<SkillDTO, keyof AuditFields>
export type PublicDocumentTypeDTO = Omit<DocumentTypeDTO, keyof AuditFields>


// --- 5. DTOs de Request (Bodies) con Nullable para PATCH ---

/** CORREGIDO: Password no existe en UserAdminDTO; se añade directamente. */
export interface RegisterBody extends Pick<UserAdminDTO, 'email' | 'firstName' | 'lastName'> { 
    password: string;
}
export interface LoginBody { email: string; password: string; }

export interface ProfileUpdateBody extends Pick<UserAdminDTO, 'firstName' | 'lastName' | 'phone' | 'address' | 'province' | 'city'> { skillsIds?: number[]; coursesIds?: number[]; }

// New: change email / change password bodies + responses
export interface ChangeEmailBody { email: string }
export type ChangeEmailResponse = ProfileUpdateResponse

export interface ChangePasswordBody { currentPassword: string; newPassword: string }
export interface ChangePasswordResponse { message: string }

// Admin CRUD - Company
export interface CompanyCreateBody extends Pick<CompanyDTO, 'name' | 'email' | 'description' | 'website' | 'phone' | 'logo'> {}
/** CORREGIDO: Reconstrucción manual para permitir | null sin conflicto con Partial. */
export interface CompanyUpdateBody extends Partial<Pick<CompanyDTO, 'name' | 'email'>> {
    description?: string | null; 
    website?: string | null;
    phone?: string | null;
    logo?: string | null;
}

// Admin CRUD - Course
export interface CourseCreateBody extends Pick<CourseDTO, 'name' | 'shortName' | 'description'> {}

export interface CourseUpdateBody extends Partial<Pick<CourseDTO, 'name'>> { 
    shortName?: string | null; 
    description?: string | null;
}

// Admin CRUD - Skill
export interface SkillCreateBody extends Pick<SkillDTO, 'name' | 'description'> {}

export interface SkillUpdateBody extends Partial<Pick<SkillDTO, 'name'>> {
    description?: string | null;
}

// Admin CRUD - Offer
export interface OfferCreateBody extends Pick<OfferDTO, 'position' | 'description' | 'status' | 'vacancies' | 'publishedAt' | 'requirements' | 'location' | 'salary' | 'durationWeeks' | 'startDate' | 'expiresAt'> {
    companyId: number; courses?: number[]; skills?: number[]; requiredDocuments?: number[];
}

export interface OfferUpdateBody extends Partial<Pick<OfferDTO, 'position' | 'description' | 'status' | 'vacancies'>> {
    requirements?: string | null; 
    location?: string | null;
    salary?: number | null;
    durationWeeks?: number | null;
    startDate?: string | null;
    expiresAt?: string | null;
    publishedAt?: string | null;
    companyId?: number; // Puede ser cambiado en PATCH
    courses?: number[];
    skills?: number[];
    requiredDocuments?: number[];
}

// Admin - Application Status
export interface ApplicationUpdateStatusBody {
  status: Exclude<ApplicationStatus, 'CANCELLED'>;
  blockReason?: string | null;
  feedback?: string | null;
} 

// Drafts
export interface DraftSaveBody { customFieldsValues?: Record<string, any> | null; }
export interface UseExistingDocumentBody { documentId: number; }


// --- 6. Respuestas Finales (DTOs) ---

export type RegisterResponse = DetailResponse<Omit<UserAdminDTO, 'phone' | 'address' | 'province' | 'city' | 'cuil' | keyof AuditFields>> 
export interface UserLoginDTO extends Pick<UserAdminDTO, 'id' | 'email' | 'role' | 'firstName' | 'lastName'> {}
export interface LoginResponse { data: { user: UserLoginDTO; sessionExpiresAt: string; links: { rel: string, href: string, method: string }[]; } }

export type ProfileDTO = Omit<UserAdminDTO, keyof AuditFields> & { email: string; courses: PublicCourseDTO[]; skills: PublicSkillDTO[]; }
export type ProfileResponse = DetailResponse<ProfileDTO>
export type ProfileUpdateResponse = DetailResponse<ProfileDTO>

// Company
export type CompanyListResponse = Paginated<Omit<CompanyDTO, keyof AuditFields | 'email' | 'phone'>> 
export type CompanyDetailsResponse = DetailResponse<Omit<CompanyDTO, keyof AuditFields>> 
export type CompanyCreateResponse = DetailResponse<CompanyDTO>
export type CompanyUpdateResponse = DetailResponse<CompanyDTO>
export type CompanyDeleteResponse = NoContent
export type AdminCompanyListResponse = Paginated<CompanyDTO>
export type AdminCompanyDetailsResponse = DetailResponse<CompanyDTO>

// Offer
export interface OfferListDTO extends OfferDTO { company: CompanyRefDTO; skills: SkillRefDTO[]; courses: CourseRefDTO[]; }
export type OfferListResponse = Paginated<OfferListDTO>
export type AdminOfferListResponse = Paginated<OfferListDTO & AuditFields>

export interface OfferDetailsDTO extends OfferDTO {
    company: Pick<CompanyDTO, 'id' | 'name' | 'description' | 'logo' | 'website' | 'email' | 'phone'> 
    skills: Pick<SkillDTO, 'id' | 'name' | 'description'>[] 
    courses: CourseRefDTO[] 
    requiredDocuments: DocTypeRefDTO[]
}
export type OfferDetailsResponse = DetailResponse<OfferDetailsDTO>
export type AdminOfferDetailsResponse = DetailResponse<OfferDetailsDTO & AuditFields>

export interface OfferCompanyDTO extends OfferDTO { skills: SkillRefDTO[]; }
export type CompanyOffersResponse = Paginated<OfferCompanyDTO>

// Skills & Courses
export type SkillListResponse = Paginated<PublicSkillDTO>
export type SkillDetailsResponse = DetailResponse<PublicSkillDTO>
export type SkillCreateResponse = DetailResponse<SkillDTO>
export type SkillUpdateResponse = DetailResponse<SkillDTO>
export type SkillDeleteResponse = NoContent
export type AdminSkillDetailsResponse = DetailResponse<SkillDTO>
export type AdminSkillCreateResponse = DetailResponse<SkillDTO>


export type CourseListResponse = Paginated<PublicCourseDTO>
export type CourseDetailsResponse = DetailResponse<PublicCourseDTO>
export type CourseCreateResponse = DetailResponse<CourseDTO>
export type CourseUpdateResponse = DetailResponse<CourseDTO>
export type CourseDeleteResponse = NoContent
export type AdminCourseListResponse = Paginated<CourseDTO>
export type AdminCourseDetailsResponse = DetailResponse<CourseDTO>

// Document Types
export type DocumentTypeListResponse = Paginated<PublicDocumentTypeDTO>
export type DocumentTypeDetailsResponse = DetailResponse<PublicDocumentTypeDTO>
export type DocumentTypeCreateResponse = DetailResponse<DocumentTypeDTO>
export type DocumentTypeUpdateResponse = DetailResponse<DocumentTypeDTO>
export type DocumentTypeDeleteResponse = NoContent
export type AdminDocumentTypeListResponse = Paginated<DocumentTypeDTO>
export type AdminDocumentTypeDetailsResponse = DetailResponse<DocumentTypeDTO>

// Applications
export interface ApplicationOfferDTO { id: number; position: string; company: ApplicationCompanyRefDTO; }
export interface ApplicationUserDTO { id: number; status: ApplicationStatus; createdAt: string; finalizedAt?: string; offer: ApplicationOfferDTO; }
export type ApplicationUserListResponse = Paginated<ApplicationUserDTO>
export interface MyDraftDTO { offer: { id: number; position: string; company: { id: number; name: string } }; attachmentsCount: number }
export type MyDraftsResponse = { data: MyDraftDTO[] }

export interface ApplicationDetailsDTO {
    id: number; offer: ApplicationOfferDTO; status: ApplicationStatus; createdAt: string; customFieldsValues: Record<string, any>;
    finalizedAt?: string; feedback?: string; blockedAt?: string; blockReason?: string; unblockedAt?: string;
    documents: { id: number; originalName: string; documentType: string; }[];
}
export type ApplicationDetailsResponse = DetailResponse<ApplicationDetailsDTO>

export interface DocumentDTO { id: number; documentType: DocTypeRefDTO; originalName: string; hash: { sha256: string }; createdAt: string; lastUsedAt: string; }
export type MyDocumentsListResponse = Paginated<DocumentDTO>
export type DocumentDetailsResponse = DetailResponse<DocumentDTO & { size: number }>

// Drafts
export type DraftDeleteResponse = NoContent
export interface DraftDTO { id: number; userId: number; offerId: number; customFieldsValues?: Record<string, any> | null; createdAt: string; updatedAt: string; }
export interface DraftAttachmentDTO { id: number; documentId: number; draftId: number; }
export type DraftGetResponse = DetailResponse<DraftDTO & { attachments: DraftAttachmentDTO[] }>
export type DraftSaveResponse = DetailResponse<DraftDTO & { attachments: DraftAttachmentDTO[] }>
export interface ApplicationSubmitResponse { data: { applicationId: number; status: ApplicationStatus; appliedAt: string; } }
export interface DocumentAttachmentInfoDTO { id: number; documentTypeId: number; originalName: string; size: number; hash: { sha256: string }; }
export type UploadDocumentResponse = DetailResponse<DocumentAttachmentInfoDTO>
export interface UseExistingDocumentBody { documentId: number; }
export type UseExistingDocumentResponse = DetailResponse<DraftAttachmentDTO>

// Admin
export type UserListResponse = Paginated<UserAdminDTO>
export type UserDetailsResponse = DetailResponse<UserAdminDTO>
export type UserDeleteResponse = NoContent

export type OfferCreateResponse = DetailResponse<OfferDetailsDTO>
export type OfferUpdateResponse = DetailResponse<OfferDetailsDTO>
export type OfferDeleteResponse = NoContent

export type ApplicationUpdateStatusResponse = NoContent

export interface NotificationBroadcastBody { userIds?: number[]; title: string; message: string; }
export interface BroadcastResponse { data: { accepted: boolean; } }
export interface NotificationDTO { id: number; title: string; message: string; type: NotificationType; createdAt: string; readAt?: string; }
export type NotificationsListResponse = Paginated<NotificationDTO>

export type NotificationUpdateResponse = DetailResponse<Pick<NotificationDTO, 'id' | 'title' | 'readAt'> & { isRead: boolean }>
export type NotificationDeleteResponse = NoContent