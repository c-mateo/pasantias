import { prisma } from '#start/prisma'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { validator, createValidator, updateValidator } from '#validators/company'
import { checkUnique } from '../../prisma/strategies.js'
import { apiErrors } from '#exceptions/my_exceptions'
import { buildFilterWhere } from '#utils/query_builder'

enum CompanySort {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME_DESC = '-name',
  CREATED_AT_DESC = '-createdAt',
  UPDATED_AT_DESC = '-updatedAt',
}

// pagination schema is provided by `validatePagination` helper

function getOrder(sort?: CompanySort) {
  switch (sort) {
    case CompanySort.NAME:
      return { name: 'asc' } as const
    case CompanySort.CREATED_AT:
      return { createdAt: 'asc' } as const
    case CompanySort.UPDATED_AT:
      return { updatedAt: 'asc' } as const
    case CompanySort.NAME_DESC:
      return { name: 'desc' } as const
    case CompanySort.CREATED_AT_DESC:
      return { createdAt: 'desc' } as const
    case CompanySort.UPDATED_AT_DESC:
      return { updatedAt: 'desc' } as const
    default:
      return { id: 'asc' } as const
  }
}

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

export default class CompaniesController {
  // GET /companies
  async list({ request, auth }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.enum(CompanySort).optional(),
      filter: vine
        .object({
          id: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
          name: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          description: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          website: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          email: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          phone: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere(query.filter)

    const isNotAdmin = auth.user?.role !== 'ADMIN'

    return await prisma.company.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getOrder(query.sort),
      omit: {
        createdAt: isNotAdmin, // Ocultar auditoría al estudiante
        updatedAt: isNotAdmin,
        deletedAt: true,
        email: isNotAdmin, // Ocultar email/phone en lista pública
        phone: isNotAdmin,
      },
    })
  }

  // GET /companies/:id
  async get({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const isNotAdmin = auth.user?.role !== 'ADMIN'

    const company = await prisma.company.findUniqueOrThrow({
      where: { id: params.id },
      omit: {
        createdAt: isNotAdmin, // Ocultar auditoría
        updatedAt: isNotAdmin,
        deletedAt: true,
      },
    })
    return {
      data: company,
      links: [{ rel: 'offers', href: `${request.url()}/offers`, method: 'GET' }],
    }
  }

  // POST /companies
  async create({ request, response }: HttpContext) {
    const validated = await request.validateUsing(createValidator)
    const company = await prisma.company.guardedCreate(
      {
        data: validated,
      },
      [checkUnique(['name', 'email', 'phone'])]
    )
    response.created(company)
  }

  async update({ request }: HttpContext) {
    const { params, ...validated } = await request.validateUsing(updateValidator)
    const updatedCompany = await prisma.company.guardedUpdate(
      {
        where: { id: params.id },
        data: validated,
      },
      [checkUnique(['name', 'email', 'phone'])]
    )
    return {
      data: updatedCompany,
    }
  }

  // DELETE /companies/:id
  async delete({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    await prisma.company.guardedDelete({
      where: { id: params.id },
    })
    response.noContent()
  }

  async getOffers({ request }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    // Ensure the parent company exists — otherwise return 404 immediately.
    const companyExists = await prisma.company.findUnique({
      where: { id: params.id },
      select: { id: true },
    })
    if (!companyExists) {
      throw apiErrors.notFound('Company', params.id)
    }
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.string().optional(),
      filter: vine
        .object({
          id: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
          title: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          status: vine
            .object({ eq: vine.string().optional(), in: vine.array(vine.string()).optional() })
            .optional(),
          publishedAt: vine
            .object({
              eq: vine.string().optional(),
              gte: vine.string().optional(),
              lte: vine.string().optional(),
            })
            .optional(),
          expiresAt: vine
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

    // Build the filter where first, then inject the companyId condition
    // into the resolved where object so we don't duplicate operator logic.
    const filter = buildFilterWhere(query.filter)

    filter.companyId = params.id

    return await prisma.offer.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getOfferOrder(query.sort),
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        customFieldsSchema: true,
        companyId: true, // Omitido: Redundante en este endpoint
      },
      include: {
        skills: true,
      },
    })
  }
}
