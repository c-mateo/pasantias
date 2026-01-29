import { apiErrors } from '#exceptions/my_exceptions'
import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { preparePagination, buildWhere } from '#utils/pagination'
import { idValidator, updateStatusValidator } from '#validators/application'

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

export default class ApplicationController {
  // Para el usuario logeado solamente
  async listUser({ request, auth }: HttpContext) {
    const { query, filterWhere } = await preparePagination(request, {
      fieldMap: {
        id: 'number',
        status: 'string',
        createdAt: 'string',
        finalizedAt: 'string',
        offerId: 'number',
      },
    })

    return await prisma.application.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: buildWhere({ userId: auth.user?.id }, filterWhere),
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
    const { query } = await preparePagination(request, { sortEnum: ApplicationSort })

    return await prisma.application.paginate({
      limit: query.limit ?? 20,
      after: query.after,
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

    console.log('Role', auth.user?.role)
    const isAdmin = auth.user?.role === 'ADMIN'

    const extraWhere = isAdmin ? {} : { userId: auth.user?.id }
    const extraFields = isAdmin
      ? {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        }
      : {}

    console.log(extraFields)

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

    // TODO: Debería marcar los documentos huérfanos para eliminación aquí mismo?
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

    // TODO: Notificar al usuario sobre el cambio de estado
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
        blockReason: reason || 'No reason provided',
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
        feedback: feedback || 'No feedback provided',
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
