import type { DetailResponse, NoContent } from "./common";

export interface DraftSaveBody {
  customFieldsValues?: Record<string, any> | null;
}

export interface DraftDTO {
  id: number;
  userId: number;
  offerId: number;
  customFieldsValues?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftAttachmentDTO {
  id: number;
  documentId: number;
  draftId: number;
}
export type DraftGetResponse = DetailResponse<
  DraftDTO & { attachments: DraftAttachmentDTO[] }
>;
export type DraftDeleteResponse = NoContent;

export interface UseExistingDocumentBody {
  documentId: number;
}
