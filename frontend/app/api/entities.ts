import type { AuditFields } from "./common";

export interface DocumentTypeDTO extends AuditFields {
  id: number;
  name: string;
}
export interface SkillDTO extends AuditFields {
  id: number;
  name: string;
  description?: string | null;
}
export interface CourseDTO extends AuditFields {
  id: number;
  name: string;
  shortName?: string | null;
  description?: string | null;
}
export interface CompanyDTO extends AuditFields {
  id: number;
  name: string;
  description?: string | null;
  website?: string | null;
  email: string;
  phone?: string | null;
  logo?: string | null;
}

// Mini-DTOs (Reference)
export type SkillRefDTO = Pick<SkillDTO, "id" | "name">;
export type CourseRefDTO = Pick<CourseDTO, "id" | "name" | "shortName">;
export type CompanyRefDTO = Pick<CompanyDTO, "id" | "name" | "logo">;
export type DocTypeRefDTO = Pick<DocumentTypeDTO, "id" | "name">;
