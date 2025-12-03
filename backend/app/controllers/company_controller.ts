// import type { HttpContext } from '@adonisjs/core/http'

import { prisma } from '#start/prisma'
import { HttpContext } from '@adonisjs/core/http'
import { validator, createValidator, updateValidator } from '#validators/company'
import { checkUnique } from '../../prisma/strategies.js'
import { apiErrors } from '#exceptions/myExceptions'
import { buildWhere, preparePagination } from '#utils/pagination'

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
  async list({ request }: HttpContext) {
    const { query, filterWhere } = await preparePagination(request, {
      sortEnum: CompanySort,
      fieldMap: {
        id: 'number',
        name: 'string',
        description: 'string',
        website: 'string',
        email: 'string',
        phone: 'string',
        verified: 'boolean',
        createdAt: 'string',
      },
    })

   return await prisma.company.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filterWhere,
      orderBy: getOrder(query.sort),
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    })
  }

  // GET /companies/:id
  async get({ request }: HttpContext) {
    const companyId = request.param('id')
    const company = await prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      omit: {
        createdAt: true,
        updatedAt: true,
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
