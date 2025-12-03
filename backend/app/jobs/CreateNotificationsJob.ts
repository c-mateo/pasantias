import { prisma } from '#start/prisma'

export default class CreateNotificationsJob {
  public static key = 'CreateNotificationsJob'

  public async handle(payload: { notifications: Array<{ userId: number; title: string; message: string; type?: string }>; }) {
    const { notifications } = payload
    if (!Array.isArray(notifications) || notifications.length === 0) return { count: 0 }

    // Use createMany for efficient batch insert
    const data = notifications.map((n) => ({ userId: n.userId, title: n.title, message: n.message, type: n.type || 'ADMIN_ANNOUNCEMENT' as const }))
    const result = await prisma.notification.createMany({ data })
    return { count: result.count }
  }
}
