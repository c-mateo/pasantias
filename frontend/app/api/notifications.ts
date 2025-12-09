import type { IAPIClient } from './IAPIClient'
import type { NotificationsListResponse, NotificationResponse, MarkAsReadResponse, BroadcastAcceptedResponse, BroadcastRequest, NotificationDTO } from './types'
import { BaseRepository } from './baseRepository'

export class NotificationsRepository extends BaseRepository<NotificationDTO, any, any, NotificationsListResponse> {
  constructor(client: IAPIClient) { super(client, 'notifications') }

  async getNotificationsPaginated(limit = 20, after = 0): Promise<NotificationsListResponse> {
    return this.list({ limit, after })
  }

  async getNotificationById(id: number): Promise<NotificationResponse> {
    return this.client.get<NotificationResponse>(`notifications/${id}`)
  }

  async markAsRead(id: number): Promise<MarkAsReadResponse> {
    return this.client.patch<MarkAsReadResponse, {}>(`notifications/${id}/mark-as-read`, {})
  }

  async deleteNotification(id: number): Promise<void> {
    return this.delete(id)
  }

  async broadcast(title: string, message: string, userIds: number[]): Promise<BroadcastAcceptedResponse> {
    const payload: BroadcastRequest = { title, message, userIds }
    return this.client.post<BroadcastAcceptedResponse, BroadcastRequest>('notifications/broadcast', payload)
  }
}
