import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { checkFK } from '../../prisma/strategies.js'

const validator = vine.compile(vine.object({
  params: vine.object({
    id: vine.number()
  })
}))

const createValidator = vine.compile(vine.object({
  title: vine.string(),
  description: vine.string(),
  companyId: vine.number(),
  status: vine.enum(['DRAFT', 'ACTIVE']),
  location: vine.string().optional().requiredWhen('status', '=', 'ACTIVE'),
  salary: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
  durationWeeks: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
  startDate: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),
  expiresAt: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),

  skills: vine.array(vine.number()).optional(),
  customFieldsSchema: vine.object({}).optional(),
  requiredDocuments: vine.array(vine.number()).optional(),
}))

const updateValidator = vine.compile(vine.object({
  params: vine.object({
    id: vine.number()
  }),
  title: vine.string().optional(),
  description: vine.string().optional(),
  companyId: vine.number().optional(),
  status: vine.enum(['DRAFT', 'ACTIVE', 'CLOSED']).optional(),
  location: vine.string().optional().requiredWhen('status', '=', 'ACTIVE'),
  salary: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
  durationWeeks: vine.number().optional().requiredWhen('status', '=', 'ACTIVE'),
  startDate: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),
  expiresAt: vine.date().optional().requiredWhen('status', '=', 'ACTIVE'),

  skills: vine.array(vine.number()).optional(),
  customFieldsSchema: vine.object({}).optional(),
  requiredDocuments: vine.array(vine.number()).optional(),
}))

export default class OffersController {
  async list({}: HttpContext) {
    // TODO: Add pagination, filtering, etc.
    const offers = await prisma.offer.findMany({
      where: {
        status: 'ACTIVE',
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        customFieldsSchema: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        // TODO: Revisar
        skills: true,
      },
    })
    return {
      data: offers,
    }
  }

  async get({ request }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const offer = await prisma.offer.findUniqueOrThrow({
      where: { id: params.id },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        customFieldsSchema: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            website: true,
          },
        },
        skills: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        requiredDocs: {
          select: {
            documentType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    const { requiredDocs, ...offerData } = offer

    return {
      data: {
        ...offerData,
        requiredDocuments: requiredDocs.map(rd => rd.documentType),
      }
    }
  }

  async create({ request }: HttpContext) {
    const { skills, requiredDocuments, ...validated } = await request.validateUsing(createValidator)
    const offer = await prisma.offer.guardedCreate({
      data: {
        ...validated,
        skills: {
          connect: skills?.map(id => ({ id })) || [],
        },
        requiredDocs: {
          createMany: {
            data: requiredDocuments?.map(docId => ({ documentTypeId: docId })) || [],
          }
        }
      },
    }, [ checkFK(['companyId']) ])
    return {
      data: offer,
    }
  }

  async update({ request }: HttpContext) {
    const { params, skills, requiredDocuments, ...validated } = await request.validateUsing(updateValidator)
    const offer = await prisma.offer.findUniqueOrThrow({
      where: { id: params.id },
    })

    const updatedOffer = await prisma.offer.guardedUpdate({
      where: { id: params.id },
      data: {
        ...validated,
        skills: {
          set: skills?.map(id => ({ id })) || [],
        },
        requiredDocs: {
          // TODO: Eliminar los documentos requeridos actuales y crear los nuevos
          // deleteMany: {},
          createMany: {
            data: requiredDocuments?.map(docId => ({ documentTypeId: docId })) || [],
          }
        }
      },
    }, [ checkFK(['companyId']) ])

    // TODO: Notificar a los usuarios interesados sobre los cambios en la oferta
    
    // Chequear cambios en campos custom

    // Chequear cambios en documentos requeridos

    return {
      data: updatedOffer,
    }
  }

  async delete({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    await prisma.offer.guardedDelete({
      where: { id: params.id },
    })
    response.noContent()
  }
}
