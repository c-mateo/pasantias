// import type { HttpContext } from '@adonisjs/core/http'

import { prisma } from "#start/prisma"
import { HttpContext } from "@adonisjs/core/http"
import vine from "@vinejs/vine"
import { parse } from "odata"

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
    before: vine.number().optional(),
    after: vine.number().optional(),
    // cursor: vine.number().optional(),
    sort: vine.enum(CompanySort).optional(),
    filter: vine.any().optional().transform(v => String(v)),
}))

const createValidator = vine.compile(vine.object({
    name: vine.string().minLength(3).maxLength(200),
    description: vine.string().optional(),
    website: vine.string().url().optional(),
    email: vine.string().email(),
    phone: vine.string().optional(),
    logo: vine.string().maxLength(500).url().optional(),
}))

function getOrderBy(sort?: CompanySort) {
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
        // const qs = request.qs()
        // if (Array.isArray(qs.filter)) {
        //     qs.filter = qs.filter.join(' ')
        // }
        const query = await schema.validate(request.qs())
        console.log(query)

        const filter = query.filter
        // console.log(filter)

        // if (filter.before && !filter.after) {
            //     await prisma.company.findMany({
        //         take: -filter.limit!,
        //         cursor: {
            //             id: filter.before,
        //         },
        //         skip: 1,
        //     })
        // }
        // const sign = filter.before ? -1 : 1
        
        // Straightforward pagination
        const limit = query.limit ?? 2
        // console.log(limit)

        const cursor = query.after ? { id: query.after } : undefined

        const where = filter ? await parse(filter, {
            id: 'number',
            name: 'string',
            description: 'string',
            website: 'string',
            email: 'string',
            phone: 'string',
        }) : undefined

        const companies = await prisma.company.findMany({
            cursor: cursor,
            take: limit ? limit + 1 : undefined,
            skip: cursor ? 1 : 0,
            omit: {
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                // TODO: Realmente es necesario saber cuando se verificó?
                verifiedAt: true,
            },
            where: where,
            orderBy: getOrderBy(query.sort)
        })
        
        const hasNext = companies.length === (limit + 1)
        const next = hasNext ? companies.splice(-1)[0] : null

        // Backward pagination
        // const limit = filter.limit ?? 2
        // const take = -(limit + 2)
        // // console.log(limit)

        // const cursor = filter.before ? { id: filter.before } : undefined
        // // const cursor = filter.after ? { id: filter.after } : undefined

        // const companies = await prisma.company.findMany({
        //     cursor: cursor,
        //     take: take,
        //     // skip: 1,
        //     // where: {
        //     //     id: {
        //     //         lt: filter.before,
        //     //     }
        //     // }
        // })

        // const hasNext = companies[companies.length - 1].id === filter.before
        // const hasPrev = companies.length === (limit + 2) || !hasNext && companies.length === (limit + 1)
        // const prev = hasPrev ? companies[1 + Number(!hasNext)] : null
        // const next = hasNext ? companies.splice(-1)[0] : null

        // const data = companies.splice(-limit, limit)

        return {
            data: companies,
            pagination: {
                limit: limit,
                next: next ? next.id : null,
                hasNext: hasNext,
                // prev: prev ? prev.id : null,
                // next: next ? next.id : null,
                // hasPrev: hasPrev,
                // hasNext: hasNext
            },
            links: [
                {
                    rel: "self",
                    href: request.parsedUrl.path
                },
                // {
                //     rel: "prev",
                //     href: prev ? `${request.url()}?before=${prev.id}` : null
                // },
                {
                    rel: "next",
                    href: next ? `${request.url()}?after=${next.id}` : null
                }
            ]
        }
    }

    // GET /companies/:id
    async get({ request, response }: HttpContext) {
        const companyId = request.param('id')
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            omit: {
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                verifiedAt: true,
            }
        })
        if (!company) {
            response.notFound({ error: 'Company not found' })
        }
        return {
            data: company,
            links: [
                { rel: 'offers', href: `${request.url()}/offers`, method : 'GET' },
            ]
        }
    }

    async getOffers({ request, response }: HttpContext) {
        const companyId = request.param('id')
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        })
        if (!company) {
            response.notFound({ error: 'Company not found' })
        }
        const offers = await prisma.offer.findMany({
            where: { companyId: companyId },
        })
        return {
            data: offers,
            pagination: {
                // TODO: Implement pagination
            }
        }
    }
    
    // POST /companies
    async create({ request }: HttpContext) {
        const validated = await request.validateUsing(createValidator)
        return await prisma.company.create({
            data: {
                name: validated.name,
                description: validated.description,
                website: validated.website,
                email: validated.email,
                phone: validated.phone,
                logo: validated.logo,
            }
        })
    }
}