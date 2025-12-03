import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { idValidator, createValidator, updateValidator, deleteValidator } from '#validators/skill'
import { preparePagination, buildWhere } from '#utils/pagination'

function getSkillOrder(sort?: string) {
    switch (sort) {
        case 'name':
            return { name: 'asc' } as const
        case '-name':
            return { name: 'desc' } as const
        case 'createdAt':
            return { createdAt: 'asc' } as const
        case '-createdAt':
            return { createdAt: 'desc' } as const
        default:
            return { id: 'asc' } as const
    }
}
import { checkDeleteRestrict, checkUnique } from '../../prisma/strategies.js'


export default class SkillsController {
    async list({ request, auth }: HttpContext) {
        const { query, filterWhere } = await preparePagination(request, { fieldMap: {
            id: 'number',
            name: 'string',
            description: 'string',
            category: 'string'
        } })

        const isNotAdmin = auth.user?.role !== 'ADMIN'

        return await prisma.skill.paginate({
            limit: query.limit ?? 20,
            after: query.after,
            where: buildWhere(filterWhere),
            orderBy: getSkillOrder(query.sort as any),
            omit: {
                createdAt: isNotAdmin,
                updatedAt: isNotAdmin,
            },
        })
    }

    async get({ request, auth }: HttpContext) {
        const { params } = await request.validateUsing(idValidator)
        const isNotAdmin = auth.user?.role !== 'ADMIN'
        const skill = await prisma.skill.findUniqueOrThrow({
            where: { id: params.id },
            omit: {
                createdAt: isNotAdmin,
                updatedAt: isNotAdmin
            }
        })
        return {
            data: skill
        }
    }

    async create({ request }: HttpContext) {
        const validated = await request.validateUsing(createValidator)
        const skill = await prisma.skill.guardedCreate({
            data: validated
        }, [checkUnique(['name'])])
        return {
            data: skill
        }
    }

    async update({ request }: HttpContext) {
        const { params, ...data } = await request.validateUsing(updateValidator)
        const updatedSkill = await prisma.skill.guardedUpdate({
            where: { id: params.id },
            data
        }, [checkUnique(['name'])])
        return {
            data: updatedSkill
        }
    }

    async delete({ request }: HttpContext) {
        const { params, force } = await request.validateUsing(deleteValidator)
        if (force) {
            // Disconnect all relations before deleting
            await prisma.skill.update({
                where: { id: params.id },
                data: {
                    users: {
                        set: []
                    },
                    offers: {
                        set: []
                    }
                }
            })
        }

        await prisma.skill.guardedDelete({
            where: { id: params.id }
        }, [checkDeleteRestrict('Skill')])
        return {
            message: `Skill with id ${params.id} deleted successfully.`
        }
    }
}