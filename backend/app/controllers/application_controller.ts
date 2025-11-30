import { apiErrors } from '#exceptions/myExceptions'
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

const updateStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['PENDING', 'BLOCKED', 'ACCEPTED', 'REJECTED'] as const),
    blockReason: vine.string().optional().requiredWhen('status', '=', 'BLOCKED'),
    feedback: vine.string().optional().requiredWhen('status', 'in', ['ACCEPTED', 'REJECTED']),
    params: vine.object({
      id: vine.number(),
    }),
  })
)

export default class ApplicationController {
  // Para el usuario logeado solamente
  async list({ request, auth }: HttpContext) {
    const applications = await prisma.application.findMany({
      where: {
        userId: auth.user?.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        finalizedAt: true,
        offer: {
          select: {
            id: true,
            title: true,
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

    return {
      data: applications,
      // TODO: implement pagination
    }
  }

  async listAdmin({ request }: HttpContext) {
     const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        finalizedAt: true,
        offer: {
          select: {
            id: true,
            title: true,
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

    return {
      data: applications,
      // TODO: implement pagination
    }
  }

  async get({ request, auth }: HttpContext) {
    const { params } = await idValidator.validate(request)

    const application = await prisma.application.findUniqueOrThrow({
      where: {
        id: params.id,
        userId: auth.user?.id,
      },
      include: {
        offer: {
          select: {
            id: true,
            title: true,
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
      },
    })

    // const { blockedAt, unblockedAt, blockReason, finalizedAt, feedback, status, ...rest } = application

    const data: Record<string, any> = {
      id: application.id,
      offer: application.offer,
      status: application.status,
      createdAt: application.createdAt,
      customFieldsValues: application.customFieldsValues,
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
    const { params } = await idValidator.validate(request)

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
        [""]
      )
    }

    // No debería haber ningún error
    await prisma.application.update({
      where: {
        id: application.id,
      },
      data: {
        status: 'CANCELLED',
        finalizedAt: new Date(),
        attachments: {
          deleteMany: {
            applicationId: application.id
          },
        }
      }
    })

    // TODO: Debería marcar los documentos huérfanos para eliminación aquí mismo?
  }

  async updateStatus({ request }: HttpContext) {
    const { params, status, blockReason, feedback } = await request.validateUsing(updateStatusValidator)

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

function validateStatusTransition(
  currentStatus: string,
  newStatus: string
) {
  const allowed = allowedTransitions[currentStatus] || []
  return allowed.includes(newStatus)
}

function transition(status: string, applicationId: number, reason?: string, feedback?: string) {
  switch (status) {
    case 'BLOCKED':
      return {
        blockReason: reason || 'No reason provided',
        blockedAt: new Date(),
        unblockedAt: null
      }
    case 'PENDING':
      return {
        blockReason: null,
        unblockedAt: new Date()
      }
    case 'ACCEPTED':
    case 'REJECTED':
      return {
        feedback: feedback || 'No feedback provided',
        finalizedAt: new Date(),
        unblockedAt: null,
        attachments: {
          deleteMany: {
            applicationId: applicationId
          },
        }
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
  CANCELLED: []
}