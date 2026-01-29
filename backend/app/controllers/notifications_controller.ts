import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { idValidator, broadcastValidator } from '#validators/notifications'
import { preparePagination, buildWhere } from '#utils/pagination'

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
    // use shared pagination validator
    // @ts-ignore
    const request: any = arguments[0]?.request
    const { query, filterWhere } = await preparePagination(request, {
      fieldMap: {
        id: 'number',
        title: 'string',
        message: 'string',
        type: 'string',
        createdAt: 'string',
      },
    })

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
        isRead: true,
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
    const { title, message, userIds } = await broadcastValidator.validate(request)

    // Enqueue a background job to perform the broadcast so large recipients lists
    // do not block the request. The enqueue helper will use the queue when
    // available and fall back to synchronous execution otherwise.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { enqueue } = require('#utils/jobs')
    await enqueue('BroadcastNotificationsJob', { title, message, userIds }).catch((err: any) => {
      console.error('Failed to enqueue broadcast job', err)
      throw err
    })

    // Return accepted response — job will process the broadcast asynchronously.
    response.accepted({ data: { accepted: true } })
  }
}

// Broadcast job performs fetching of recipients; no local helper required.
