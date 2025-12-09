import type { IAPIClient } from './IAPIClient'
import type { MyDocumentsListResponse, MyDocumentGetResponse, DocumentShort } from './types'
import { BaseRepository } from './baseRepository'

export class MyDocumentsRepository extends BaseRepository<DocumentShort, any, any, MyDocumentsListResponse> {
  constructor(client: IAPIClient) { super(client, 'my-documents') }

  async download(documentId: number): Promise<Blob> {
    return this.client.post<Blob>(`my-documents/${documentId}/download`, undefined, { responseType: 'blob' })
  }

  async hide(documentId: number): Promise<void> {
    return this.delete(documentId)
  }
}
