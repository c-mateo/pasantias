// import type { HttpContext } from '@adonisjs/core/http'

import { prisma } from "#start/prisma"
import { HttpContext } from "@adonisjs/core/http"
import vine from "@vinejs/vine"
import { checkUnique } from "../../prisma/strategies.js"
import { apiErrors } from "#exceptions/myExceptions"
import { rsqlStringToQuery } from "rsql-prisma"

enum CompanySort {
    NAME = 'name',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    NAME_DESC = '-name',
    CREATED_AT_DESC = '-createdAt',
    UPDATED_AT_DESC = '-updatedAt',
}

const schema = vine.compile(vine.object({
    limit: vine.number().range([10, 100]).optional(),
    after: vine.number().optional(),
    sort: vine.enum(CompanySort).optional(),
    filter: vine.any().optional().transform(v => String(v)),
}))

const validator = vine.compile(vine.object({
    params: vine.object({
        id: vine.number()
    }),
}))

const createValidator = vine.compile(vine.object({
    name: vine.string().minLength(3).maxLength(200),
    description: vine.string().optional(),
    website: vine.string().url().optional(),
    email: vine.string().email(),
    phone: vine.string().optional(),
    logo: vine.string().maxLength(500).url().optional(),
}))

const updateValidator = vine.compile(vine.object({
    params: vine.object({
        id: vine.number()
    }),
    name: vine.string().minLength(3).maxLength(200).optional(),
    description: vine.string().optional(),
    website: vine.string().url().optional(),
    email: vine.string().email().optional(),
    phone: vine.string().optional(),
    logo: vine.string().maxLength(500).url().optional()
}))

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

export default class CompaniesController {
    // GET /companies
    async list({ request }: HttpContext) {
        const query = await schema.validate(request.qs())
        console.log(query)
        
        // Straightforward pagination
        // const where = query.filter ? await parse(query.filter, {
        //     id: 'number',
        //     name: 'string',
        //     description: 'string',
        //     website: 'string',
        //     email: 'string',
        //     phone: 'string',
        // }) : undefined

        const where = query.filter ? rsqlStringToQuery(query.filter) as any : undefined
        console.log(where)

        return await prisma.company.paginate({
            limit: query.limit ?? 20,
            after: query.after,
            where: where,
            orderBy: getOrder(query.sort),
            omit: {
                createdAt: true,
                updatedAt: true,
                deletedAt: true
            },
            extra: (result) => ({
                links: {
                    self: request.parsedUrl.path,
                    next: result.pagination.next ? `${request.url()}?after=${result.pagination.next}` : null,
                }
            }),
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
            }
        })
        return {
            data: company,
            links: [
                { rel: 'offers', href: `${request.url()}/offers`, method : 'GET' },
            ]
        }
    }

    // POST /companies
    async create({ request, response }: HttpContext) {
        const validated = await request.validateUsing(createValidator)
        const company = await prisma.company.guardedCreate({
            data: validated
        }, [ checkUnique(['name', 'email', 'phone']) ])
        response.created(company)
    }

    async update({ request }: HttpContext) {
        const { params, ...validated } = await request.validateUsing(updateValidator)
        const updatedCompany = await prisma.company.guardedUpdate({
            where: { id: params.id },
            data: validated,
        }, [ checkUnique(['name', 'email', 'phone']) ] )
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
        const offers = await prisma.offer.findMany({
            where: { companyId: params.id },
        })
        if (!offers) {
            throw apiErrors.notFound('Company', params.id)
        }
        return {
            data: offers,
            pagination: {
                // TODO: Implement pagination
            }
        }
    }
}