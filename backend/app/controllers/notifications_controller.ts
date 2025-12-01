import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { preparePagination, buildWhere } from './pagination.js'

function getNotificationOrder(s?: string) {
  switch (s) {
    case 'createdAt':
      return { createdAt: 'asc' } as const
    case '-createdAt':
      return { createdAt: 'desc' } as const
    default:
      return { createdAt: 'desc' } as const
  }
}


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
    // use shared pagination validator
    // @ts-ignore
    const request: any = arguments[0]?.request
    const { query, filterWhere } = await preparePagination(request, { fieldMap: {
      id: 'number',
      title: 'string',
      message: 'string',
      type: 'string',
      createdAt: 'string'
    } })

    return await prisma.notification.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: buildWhere({ userId: auth.user?.id }, filterWhere),
      orderBy: getNotificationOrder(query.sort as any),
      omit: {
        userId: true,
      },
    })
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

    return {
      data: notification,
      links: [
        { rel: 'self', href: request.url(), method: 'GET' },
        { rel: 'mark-as-read', href: `${request.url()}/mark-as-read`, method: 'PATCH' },
      ],
    }
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