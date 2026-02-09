import { prisma } from '#start/prisma'
import { Job } from 'adonisjs-jobs'

type BroadcastNotification = {
  users: 'all'
  title: string
  message: string
}

type UserSpecificNotification = {
  users: number[]
  title: string
  message: string
  tag?: string
}

type CreateNotificationsPayload = BroadcastNotification | UserSpecificNotification

// IMPORTANT: Broadcasts (ADMIN_ANNOUNCEMENT) are intended for students only.
// This helper returns only users with role = STUDENT (excludes admins).
function getAllStudentIds(): Promise<number[]> {
  return prisma.user
    .findMany({ where: { role: 'STUDENT', deletedAt: null }, select: { id: true } })
    .then((users) => users.map((u) => u.id))
}

export default class CreateNotifications extends Job {
  public async handle(payload: CreateNotificationsPayload) {
    this.logger.info('CreateNotifications job handled')

    let users: number[] = []

    if (payload.users === 'all') {
      users = await getAllStudentIds()
    } else {
      // Sanitize provided user ids: only keep existing users with role = STUDENT
      const ids = payload.users ?? []
      const result = await prisma.user.findMany({
        where: { id: { in: ids }, role: 'STUDENT', deletedAt: null },
        select: { id: true },
      })
      users = result.map((u) => u.id)
    }

    await prisma.notification.createMany({
      data: users.map((userId) => ({
        userId: userId,
        title: payload.title,
        message: payload.message,
        tag: (payload as any).tag ?? '',
      })),
    })
  }
}
