import { apiErrors } from '#exceptions/my_exceptions'
import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { buildFilterWhere } from '#utils/query_builder'
import { idValidator, updateStatusValidator } from '#validators/application'
import SendTemplatedEmail from '#jobs/send_templated_email'
import CreateNotifications from '#jobs/create_notifications'
import env from '#start/env'

function getApplicationOrder(s?: string) {
  switch (s) {
    case 'createdAt':
      return { createdAt: 'asc' } as const
    case '-createdAt':
      return { createdAt: 'desc' } as const
    default:
      return { createdAt: 'desc' } as const
  }
}

enum ApplicationSort {
  CREATED_AT = 'createdAt',
  CREATED_AT_DESC = '-createdAt',
}

/**
 * Controlador de aplicaciones (postulaciones).
 *
 * @todo Revisar marcaje/eliminación de documentos huérfanos tras cancelación.
 * @todo Confirmar URLs incluidos en notificaciones y correos.
 */
export default class ApplicationController {
  async listUser({ request, auth }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.string().optional(),
      filter: vine
        .object({
          status: vine
            .object({ eq: vine.string().optional(), in: vine.array(vine.string()).optional() })
            .optional(),
          offerId: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere(query.filter)

    filter.userId = auth.user?.id

    return await prisma.application.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getApplicationOrder(query.sort as any),
      select: {
        id: true,
        status: true,
        createdAt: true,
        finalizedAt: true,
        offer: {
          select: {
            id: true,
            position: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  }

  async listAdmin({ request }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.enum(ApplicationSort).optional(),
      filter: vine
        .object({
          id: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
          status: vine
            .object({ eq: vine.string().optional(), in: vine.array(vine.string()).optional() })
            .optional(),
          offerId: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
          userId: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere(query.filter)

    return await prisma.application.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getApplicationOrder(query.sort as any),
      select: {
        id: true,
        status: true,
        createdAt: true,
        finalizedAt: true,
        offer: {
          select: {
            id: true,
            position: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })
  }

  async get({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

    const isAdmin = auth.user?.role === 'ADMIN'

    const extraWhere = isAdmin ? {} : { userId: auth.user?.id }
    const extraFields = isAdmin
      ? {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              cuil: true,
              address: true,
              city: true,
              province: true,
              phone: true,
            },
          },
        }
      : {}

    const application = await prisma.application.findUniqueOrThrow({
      where: {
        id: params.id,
        ...extraWhere,
      },
      omit: {
        userId: true,
      },
      include: {
        offer: {
          select: {
            id: true,
            position: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attachments: {
          select: {
            document: {
              select: {
                id: true,
                originalName: true,
                documentType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        ...extraFields,
      },
    })

    const data: Record<string, any> = {
      id: application.id,
      status: application.status,
      offer: application.offer,
      user: application.user,
      createdAt: application.createdAt,
    }

    if (application.status.match(/^(ACCEPTED|REJECTED|CANCELED)$/)) {
      data.finalizedAt = application.finalizedAt
      data.feedback = application.feedback

      if (application.unblockedAt) {
        data.unblockedAt = application.unblockedAt
      }
    } else if (application.status === 'BLOCKED') {
      data.blockedAt = application.blockedAt
      data.blockReason = application.blockReason
    }

    data.documents = application.attachments.map((att) => ({
      id: att.document.id,
      originalName: att.document.originalName,
      documentType: att.document.documentType.name,
    }))

    return {
      data,
      links: [
        { rel: 'offer', href: `/offers/${application.offer.id}`, method: 'GET' },
        { rel: 'documents', href: `/applications/${application.id}/documents`, method: 'GET' },
        { rel: 'cancel', href: `/applications/${application.id}`, method: 'DELETE' },
      ],
    }
  }

  async delete({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

    const application = await prisma.application.findUniqueOrThrow({
      where: {
        id: params.id,
        userId: auth.user?.id,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!application.status.match(/^(PENDING|BLOCKED)$/)) {
      throw apiErrors.invalidStateTransition(
        'Application',
        application.id,
        application.status,
        'CANCELLED',
        ['']
      )
    }

    // No debería haber ningún error
    await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: 'CANCELED',
        finalizedAt: new Date(),
        attachments: {
          deleteMany: {
            applicationId: application.id,
          },
        },
      },
    })

    // Nota: considerar marcar documentos huérfanos para eliminación.
  }

  async updateStatus({ request }: HttpContext) {
    const { params, status, blockReason, feedback } =
      await request.validateUsing(updateStatusValidator)

    const application = await prisma.application.findUniqueOrThrow({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        status: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        offer: { select: { id: true, position: true } },
      },
    })

    if (!validateStatusTransition(application.status, status)) {
      throw apiErrors.invalidStateTransition(
        'Application',
        application.id,
        application.status,
        status,
        allowedTransitions[application.status] || []
      )
    }

    await prisma.application.update({
      where: {
        id: params.id,
      },
      data: {
        status,
        ...transition(status, params.id, blockReason, feedback),
      },
    })

    // Notify user in-site and via email
    const user = application.user
    const fullname = user.firstName ?? user.email
    // Link for end-user should point to the public application view
    const appUrl = `${env.get('APP_URL')}/applications/${application.id}`

    const title =
      status === 'ACCEPTED'
        ? 'Postulación aceptada'
        : status === 'REJECTED'
          ? 'Postulación rechazada'
          : 'Estado de postulación actualizado'

    const message =
      status === 'ACCEPTED'
        ? `Tu postulación #${application.id} fue aceptada.`
        : status === 'REJECTED'
          ? `Tu postulación #${application.id} fue rechazada.`
          : `El estado de tu postulación #${application.id} cambió a ${status}.`

    // Create in-site notification
    await CreateNotifications.dispatch({
      users: [user.id],
      title,
      message,
      tag: 'application',
    }).catch((err) => {
      console.error('CreateNotifications error', err)
    })

    const templateMap: Record<string, string> = {
      ACCEPTED: 'application_accepted',
      REJECTED: 'application_rejected',
    }

    // Send email using templated email job
    const template = templateMap[status]
    if (template) {
      await SendTemplatedEmail.dispatch({
        to: user.email,
        template: template as any,
        data: {
          name: fullname,
          applicationId: application.id,
          offerPosition: application.offer?.position,
          appUrl,
        },
      }).catch((err) => console.error('SendTemplatedEmail error', err))
    }
  }
}

function validateStatusTransition(currentStatus: string, newStatus: string) {
  const allowed = allowedTransitions[currentStatus] || []
  return allowed.includes(newStatus)
}

function transition(status: string, applicationId: number, reason?: string, feedback?: string) {
  switch (status) {
    case 'BLOCKED':
      return {
        blockReason: reason,
        blockedAt: new Date(),
        unblockedAt: null,
      }
    case 'PENDING':
      return {
        blockReason: null,
        unblockedAt: new Date(),
      }
    case 'ACCEPTED':
    case 'REJECTED':
      return {
        feedback: feedback,
        finalizedAt: new Date(),
        unblockedAt: null,
        attachments: {
          deleteMany: {
            applicationId: applicationId,
          },
        },
      }
    default:
      return {}
  }
}

const allowedTransitions: Record<string, string[]> = {
  PENDING: ['BLOCKED', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  BLOCKED: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: [],
  REJECTED: [],
  CANCELLED: [],
}
