import type { IAPIClient } from './IAPIClient'
import type { MyApplicationsListResponse, ApplicationGetResponse, ApplicationStatusUpdateRequest } from './types'

export class ApplicationsRepository {
  constructor(private client: IAPIClient) {}

  async listMy(limit = 20, after = 0): Promise<MyApplicationsListResponse> {
    return this.client.get<MyApplicationsListResponse>('my-applications', { params: { limit, after } })
  }

  async getMy(id: number): Promise<ApplicationGetResponse> {
    return this.client.get<ApplicationGetResponse>(`my-applications/${id}`)
  }

  async deleteMy(id: number): Promise<void> {
    return this.client.delete<void>(`my-applications/${id}`)
  }

  // Admin
  async listAdmin(limit = 20, after = 0): Promise<MyApplicationsListResponse> {
    return this.client.get<MyApplicationsListResponse>('applications', { params: { limit, after } })
  }

  async getAdmin(id: number): Promise<ApplicationGetResponse> {
    return this.client.get<ApplicationGetResponse>(`applications/${id}`)
  }

  async updateStatus(id: number, status: ApplicationStatusUpdateRequest): Promise<void> {
    return this.client.patch<void, ApplicationStatusUpdateRequest>(`applications/${id}/status`, status)
  }
}
