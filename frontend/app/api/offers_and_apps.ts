import {
  OfferStatus,
  ApplicationStatus,
  DetailResponse,
  Paginated,
  AuditFields,
} from "./common";
import {
  CompanyRefDTO,
  SkillRefDTO,
  CourseRefDTO,
  DocTypeRefDTO,
  SkillDTO,
  CompanyDTO,
} from "./entities";

export interface OfferDTO {
  id: number;
  position: string;
  description: string;
  status: OfferStatus;
  vacancies: number;
  requirements?: string | null;
  location?: string | null;
  salary?: number | null;
  publishedAt: string | null;
}

// Postulaciones (Coincide con ApplicationController.ts)
export interface ApplicationOfferDTO {
  id: number;
  position: string;
  company: Pick<CompanyDTO, "id" | "name">;
}

export interface ApplicationDetailsDTO {
  id: number;
  offer: ApplicationOfferDTO;
  status: ApplicationStatus;
  createdAt: string;
  customFieldsValues: Record<string, any>;
  finalizedAt?: string;
  feedback?: string;
  blockedAt?: string;
  blockReason?: string;
  unblockedAt?: string;
  documents: { id: number; originalName: string; documentType: string }[];
}

export type ApplicationDetailsResponse = DetailResponse<ApplicationDetailsDTO>;
