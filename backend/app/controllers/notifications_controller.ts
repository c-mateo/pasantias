import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { idValidator, broadcastValidator } from '#validators/notifications'
import { buildFilterWhere } from '#utils/query_builder'
import CreateNotifications from '#jobs/create_notifications'

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

export default class NotificationsController {
  async list({ auth }: HttpContext) {
    const request: any = arguments[0]?.request
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.string().optional(),
      filter: vine
        .object({
          title: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          message: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          type: vine
            .object({ eq: vine.string().optional(), in: vine.array(vine.string()).optional() })
            .optional(),
          createdAt: vine
            .object({
              eq: vine.string().optional(),
              gte: vine.string().optional(),
              lte: vine.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere<any>(query.filter)
    filter.userId = auth.user?.id

    return await prisma.notification.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getNotificationOrder(query.sort as any),
      omit: {
        userId: true,
      },
    })
  }

  async get({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

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
    const { params } = await request.validateUsing(idValidator)

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
        readAt: true,
      },
    })

    return {
      data: notification,
    }
  }

  async delete({ request, response, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

    await prisma.notification.guardedDelete({
      where: {
        id: params.id,
        userId: auth.user?.id,
      },
    })

    return response.noContent()
  }

  async broadcast({ request, response }: HttpContext) {
    const { title, message, users = 'all' } = await request.validateUsing(broadcastValidator)
    /**
     * Enqueue a background job to perform the broadcast so large recipient lists
     * do not block the request. `enqueue` falls back to sync execution if no queue.
     */
    await CreateNotifications.dispatch({
      title,
      message,
      users,
    })

    response.accepted({ data: { accepted: true } })
  }
}
