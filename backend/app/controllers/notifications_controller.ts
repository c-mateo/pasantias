import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'


const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number(),
    }),
  })
)

const broadcastValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(1),
    message: vine.string().minLength(1),
    userIds: vine.array(vine.number()).optional(),
  })
)

export default class NotificationsController {
  
  async list({ auth }: HttpContext) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: auth.user?.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      omit: {
        userId: true,
      },
    })

    // TODO: implement pagination
    return {
      data: notifications,
    }
  }

  async get({ request, auth }: HttpContext) {
    const { params } = await idValidator.validate(request)

    const notification = await prisma.notification.findUniqueOrThrow({
      where: {
        id: params.id,
        userId: auth.user?.id,
      },
      omit: {
        userId: true,
      },
    })

    return notification
  }
  
  async markAsRead({ request, auth }: HttpContext) {
    const { params } = await idValidator.validate(request)

    const notification = await prisma.notification.guardedUpdate({
      where: {
        id: params.id,
        userId: auth.user?.id,
      },
      data: {
        readAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        isRead: true,
        readAt: true,
      }
    })

    return {
      data: notification,
    }
  }

  async delete({ request, response, auth }: HttpContext) {
    const { params } = await idValidator.validate(request)

    await prisma.notification.guardedDelete({
      where: {
        id: params.id,
        userId: auth.user?.id
      },
    })

    return response.noContent()
  }

  async broadcast({ request, response }: HttpContext) {
    const { title, message, userIds } = await broadcastValidator.validate(request)

    // TODO: encontrar una forma más eficiente de hacer esto para muchos usuarios.
    // Tal vez con un job en segundo plano.

    const users = userIds || await getEveryUserId()

    const messages = users.map((userId) => ({
      userId,
      title,
      message,
      type: 'ADMIN_ANNOUNCEMENT' as const,
    })) 
    
    const notifications = await prisma.notification.createMany({
      data: messages,
    })

    response.created({
      data: { notificationsSent: notifications.count },
    })
  }
}

async function getEveryUserId(): Promise<number[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
    where: {
      role: 'STUDENT'
    }
  })

  return users.map((user) => user.id)
}