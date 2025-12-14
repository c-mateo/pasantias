import type { IAPIClient } from './IAPIClient'
import type {
  DraftGetResponse,
  DraftSaveResponse,
  UploadDocumentResponse,
  UseExistingDocumentResponse,
  DraftGetDocumentsResponse,
  DraftSubmitResponse,
  DraftSaveRequest,
  UploadDocumentRequest,
  UseExistingDocumentRequest,
} from './types'

export class DraftsRepository {
  constructor(private client: IAPIClient) {}

  async get(offerId: number): Promise<DraftGetResponse> {
    return this.client.get<DraftGetResponse>(`offers/${offerId}/draft`)
  }

  async save(offerId: number, data: DraftSaveRequest): Promise<DraftSaveResponse> {
    return this.client.patch<DraftSaveResponse, DraftSaveRequest>(`offers/${offerId}/draft`, data)
  }

  async submit(offerId: number): Promise<DraftSubmitResponse> {
    return this.client.post<DraftSubmitResponse>(`offers/${offerId}/draft/submit`)
  }

  async uploadDocument(offerId: number, file: File, reqDocId: number): Promise<UploadDocumentResponse> {
    // The server expects a raw PDF upload with headers and reqDocId as param.
    // We'll send the file as a Blob and provide the required headers and query param reqDocId.
    const blob: UploadDocumentRequest = file
    return this.client.put<UploadDocumentResponse, UploadDocumentRequest>(
      `offers/${offerId}/draft/documents`,
      blob,
      {
        params: { reqDocId },
        headers: {
          'Content-Type': file.type || 'application/pdf',
          'X-Original-Filename': file.name,
        },
      }
    )
  }

  async useExistingDocument(offerId: number, documentId: number): Promise<UseExistingDocumentResponse> {
    return this.client.post<UseExistingDocumentResponse, UseExistingDocumentRequest>(`offers/${offerId}/draft/documents/use-existing`, { documentId })
  }

  async deleteDocument(offerId: number, attachmentId: number): Promise<void> {
    return this.client.delete<void>(`offers/${offerId}/draft/documents/${attachmentId}`)
  }

  async getDocuments(offerId: number): Promise<DraftGetDocumentsResponse> {
    return this.client.get<DraftGetDocumentsResponse>(`offers/${offerId}/draft/documents`)
  }

  async getMyDrafts(): Promise<{ data: Array<{ offer: { id: number; position: string; company: { id: number; name: string } }; attachmentsCount: number }>}>
  {
    return this.client.get(`my-drafts`)
  }

  async deleteDraft(offerId: number): Promise<void> {
    return this.client.delete<void>(`offers/${offerId}/draft`)
  }
}
