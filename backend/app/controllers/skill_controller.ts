import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class SkillsController {
    async list({}: HttpContext) {
        // TODO: Add pagination, filtering, etc.
        const skills = await prisma.skill.findMany({
            omit: {
                createdAt: true,
                updatedAt: true
            }
        })
        return {
            data: skills
        }
    }

    async get({ request, response }: HttpContext) {
        const skillId = request.param('id')
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            omit: {
                createdAt: true,
                updatedAt: true
            }
        })
        if (!skill) {
            response.notFound({ error: 'Skill not found' })
        }
        return {
            data: skill
        }
    }
}