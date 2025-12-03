import { prisma } from '#start/prisma'

export default class BroadcastNotificationsJob {
  public static key = 'BroadcastNotificationsJob'

  public async handle(payload: { title: string; message: string; userIds?: number[] }) {
    const { title, message, userIds } = payload

    if (userIds && userIds.length > 0) {
      const data = userIds.map((id) => ({ userId: id, title, message, type: 'ADMIN_ANNOUNCEMENT' as const }))
      const result = await prisma.notification.createMany({ data })
      return { count: result.count }
    }

    // Broadcast to all students as fallback
    const users = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } })
    if (users.length === 0) return { count: 0 }

    const data = users.map((u) => ({ userId: u.id, title, message, type: 'ADMIN_ANNOUNCEMENT' as const }))
    const result = await prisma.notification.createMany({ data })
    return { count: result.count }
  }
}
