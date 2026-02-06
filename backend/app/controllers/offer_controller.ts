import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { checkFK } from '../../prisma/strategies.js'
import { apiErrors } from '#exceptions/my_exceptions'
import { validator, createValidator, updateValidator, paginationValidator } from '#validators/offer'
import { buildFilterWhere } from '#utils/query_builder'

function getOfferOrder(s?: string) {
  switch (s) {
    case 'position':
      return { position: 'asc' } as const
    case '-position':
      return { position: 'desc' } as const
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
  async list({ request, auth }: HttpContext) {
    const isAdmin = (await auth.user?.role) === 'ADMIN'

    // Validate pagination + filter structure from querystring
    const query = await paginationValidator.validate(request.qs())
    const filter = buildFilterWhere(query.filter)

    if (!isAdmin || !filter.status) {
      filter.status = 'ACTIVE'
    }

    return await prisma.offer.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getOfferOrder(query.sort as any),
      omit: {
        companyId: true,
        deletedAt: true,
        customFieldsSchema: true,
      },
      include: {
        company: { select: { id: true, name: true, logo: true } },
        skills: { select: { id: true, name: true } },
        courses: { select: { id: true, name: true, shortName: true } },
      },
    })
  }

  async get({ request }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const offer = await prisma.offer.findUniqueOrThrow({
      where: { id: params.id },
      omit: {
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
            email: true,
            phone: true,
          },
        },
        skills: {
          select: { id: true, name: true, description: true },
        },
        courses: {
          select: { id: true, name: true, shortName: true },
        },
        requiredDocs: {
          select: {
            documentType: {
              select: { id: true, name: true }, // DocTypeRefDTO
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
    const { courses, skills, requiredDocuments, ...validated } =
      await request.validateUsing(createValidator)

    const offer = await prisma.offer.guardedCreate(
      {
        data: {
          ...validated,
          skills: {
            connect: skills?.map((id) => ({ id })) || [],
          },
          courses: {
            connect: courses?.map((id) => ({ id })) || [],
          },
          requiredDocs: {
            createMany: {
              data: requiredDocuments?.map((docId) => ({ documentTypeId: docId })) || [],
            },
          },
        },
        omit: {
          companyId: true,
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
              email: true,
              phone: true, // Company Detalle
            },
          },
          skills: {
            select: { id: true, name: true, description: true }, // Skill Detalle
          },
          courses: {
            select: { id: true, name: true, shortName: true }, // Course Ref
          },
          requiredDocs: {
            select: {
              documentType: {
                select: { id: true, name: true }, // DocTypeRefDTO
              },
            },
          },
        },
      },
      [checkFK(['companyId'])]
    )

    return {
      data: {
        ...offer,
        requiredDocuments: offer.requiredDocs.map((rd) => rd.documentType),
      },
    }
  }

  async update({ request }: HttpContext) {
    const { params, courses, skills, requiredDocuments, ...validated } =
      await request.validateUsing(updateValidator)

    const offer = await prisma.offer.findUniqueOrThrow({
      where: { id: params.id },
      select: { status: true },
    })

    const setPublishedAt = offer.status !== 'ACTIVE' && validated.status === 'ACTIVE'

    const updatedOffer = await prisma.offer.guardedUpdate(
      {
        where: { id: params.id },
        data: {
          ...validated,
          publishedAt: setPublishedAt ? new Date() : undefined,
          courses: {
            set: courses?.map((id) => ({ id })) || [],
          },
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
    const toDelete = updatedOffer.requiredDocs.filter((rd) => {
      return !requiredDocuments?.includes(rd.documentTypeId)
    })

    const toAdd = (requiredDocuments || []).filter((docId) => {
      return !updatedOffer.requiredDocs.some((rd) => rd.documentTypeId === docId)
    })

    const batch = []

    if (toDelete.length > 0) {
      batch.push(
        prisma.requiredDocument.deleteMany({
          where: {
            offerId: params.id,
            documentTypeId: {
              in: toDelete.map((rd) => rd.documentTypeId),
            },
          },
        })
      )
    }
    if (toAdd.length > 0) {
      batch.push(
        prisma.requiredDocument.createMany({
          data: toAdd.map((docId) => ({
            offerId: params.id,
            documentTypeId: docId,
          })),
        })
      )
    }

    if (batch.length > 0) {
      // Perform the batch operations in a single transaction to ensure the
      // required document deletions and insertions are applied together. This
      // avoids partial updates that could leave the offer in an inconsistent
      // state.
      const expectedCounts = [toDelete.length, toAdd.length].filter((count) => count > 0)

      const result = await prisma.$transaction(batch)
      const resultCounts = result.map((r) => r.count)

      if (expectedCounts.some((count, i) => resultCounts[i] !== count)) {
        throw apiErrors.internalError('update-required-docs-' + params.id)
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
    const companyExists = await prisma.company.findUnique({
      where: { id: params.id },
      select: { id: true },
    })
    if (!companyExists) throw apiErrors.notFound('Company', params.id)

    const query = await paginationValidator.validate(request.qs())

    const filter = buildFilterWhere(query.filter)
    filter.companyId = params.id

    return await prisma.offer.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getOfferOrder(query.sort),
      omit: { createdAt: true, updatedAt: true, deletedAt: true, customFieldsSchema: true },
      include: { company: true, skills: true },
    })
  }
}
