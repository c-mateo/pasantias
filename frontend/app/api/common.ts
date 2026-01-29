// --- Enums y Auditoría ---
export type UserRole = "STUDENT" | "ADMIN";
export type OfferStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "EXPIRED";
export type ApplicationStatus =
  | "PENDING"
  | "BLOCKED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
}

// --- Utility Types ---
export type Link = { rel: string; href: string; method: string };
export type NoContent = void;

export interface Paginated<T> {
  data: T[];
  pagination: { limit: number; hasNext: boolean; next: number | null };
}

export interface DetailResponse<T> {
  data: T;
  links?: Link[];
}
