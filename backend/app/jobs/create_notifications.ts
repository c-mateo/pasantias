import { prisma } from '#start/prisma'
import { Job } from 'adonisjs-jobs'
import { NotificationType } from '../../generated/prisma/browser.js'

type BroadcastNotification = {
  title: string
  message: string
  type: 'ADMIN_ANNOUNCEMENT'
}

type UserSpecificNotification = {
  users: number[]
  title: string
  message: string
  type: Exclude<NotificationType, 'ADMIN_ANNOUNCEMENT'>
}

type CreateNotificationsPayload = BroadcastNotification | UserSpecificNotification

function getAllUserIds(): Promise<number[]> {
  return prisma.user.findMany({ select: { id: true } }).then((users) => users.map((u) => u.id))
}

export default class CreateNotifications extends Job {
  public async handle(payload: CreateNotificationsPayload) {
    this.logger.info('CreateNotifications job handled')

    const users = payload.type === 'ADMIN_ANNOUNCEMENT' ? await getAllUserIds() : payload.users

    const result = await prisma.notification.createMany({
      data: users.map((userId) => ({
        userId: userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
      })),
    })
    this.logger.info(`Created ${result.count} notifications`)
  }
}
