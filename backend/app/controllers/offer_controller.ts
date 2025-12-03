import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { checkFK } from '../../prisma/strategies.js'
import { validator, createValidator, updateValidator } from '#validators/offer'
import { preparePagination, buildWhere } from '#utils/pagination'


function getOfferOrder(s?: string) {
  switch (s) {
    case 'publishedAt':
      return { publishedAt: 'asc' } as const
    case '-publishedAt':
      return { publishedAt: 'desc' } as const
    case 'expiresAt':
      return { expiresAt: 'asc' } as const
    case '-expiresAt':
      return { expiresAt: 'desc' } as const
    default:
      return { publishedAt: 'desc' } as const
  }
}

export default class OffersController {
  async list({ request }: HttpContext) {
    const { query, filterWhere } = await preparePagination(request, {
      fieldMap: {
        id: 'number',
        title: 'string',
        description: 'string',
        status: 'string',
        companyId: 'number',
        publishedAt: 'string',
        expiresAt: 'string',
      },
    })

    return await prisma.offer.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: buildWhere({ status: 'ACTIVE' }, filterWhere),
      orderBy: getOfferOrder(query.sort as any),
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
        skills: true,
      },
    })
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
        requiredDocuments: requiredDocs.map((rd) => rd.documentType),
      },
    }
  }

  async create({ request }: HttpContext) {
    const { skills, requiredDocuments, ...validated } = await request.validateUsing(createValidator)

    const offer = await prisma.offer.guardedCreate(
      {
        data: {
          ...validated,
          skills: {
            connect: skills?.map((id) => ({ id })) || [],
          },
          requiredDocs: {
            createMany: {
              data: requiredDocuments?.map((docId) => ({ documentTypeId: docId })) || [],
            },
          },
        },
      },
      [checkFK(['companyId'])]
    )
    return {
      data: offer,
    }
  }

  async update({ request }: HttpContext) {
    const { params, skills, requiredDocuments, ...validated } = await request.validateUsing(updateValidator)

    const updatedOffer = await prisma.offer.guardedUpdate(
      {
        where: { id: params.id },
        data: {
          ...validated,
          skills: {
            set: skills?.map((id) => ({ id })) || [],
          },
        },
        include: {
          requiredDocs: true,
        },
      },
      [checkFK(['companyId'])]
    )

    // TODO: handle changes in custom fields and required docs as needed

    // Chequear cambios en documentos requeridos
    const toDelete = updatedOffer.requiredDocs.filter(rd => {
      return !requiredDocuments?.includes(rd.documentTypeId)
    })

    const toAdd = (requiredDocuments || []).filter(docId => {
      return !updatedOffer.requiredDocs.some(rd => rd.documentTypeId === docId)
    })

    const batch = []
    if (toDelete.length > 0) {
      batch.push(prisma.requiredDocument.deleteMany({
        where: {
          offerId: params.id,
          documentTypeId: {
            in: toDelete.map(rd => rd.documentTypeId)
          }
        }
      }))
    }
    if (toAdd.length > 0) {
      batch.push(prisma.requiredDocument.createMany({
        data: toAdd.map(docId => ({
          offerId: params.id,
          documentTypeId: docId
        }))
      }))
    }

    if (batch.length > 0) {
      const result = await prisma.$transaction(batch)

      const expectedCounts = [toDelete.length, toAdd.length]
      if (result.some((r, i) => r.count != expectedCounts[i])) {
        throw new Error('Error updating required documents for offer ' + params.id)
      }
    }

    return {
      data: updatedOffer,
    }
  }

  async delete({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    await prisma.offer.guardedDelete({ where: { id: params.id } })
    response.noContent()
  }

  async getOffers({ request }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    // Ensure the parent company exists — otherwise return 404 immediately.
    const companyExists = await prisma.company.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!companyExists) throw new Error('Company not found')

    const { query, filterWhere } = await preparePagination(request, {
      fieldMap: {
        id: 'number',
        title: 'string',
        status: 'string',
        publishedAt: 'string',
        expiresAt: 'string',
      },
    })

    return await prisma.offer.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: buildWhere({ companyId: params.id }, filterWhere),
      orderBy: getOfferOrder(query.sort),
      omit: { createdAt: true, updatedAt: true, deletedAt: true, customFieldsSchema: true },
      include: { company: true, skills: true },
    })
  }
}

