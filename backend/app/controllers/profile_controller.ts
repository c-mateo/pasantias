import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { checkUnique } from '../../prisma/strategies.js'
import getRoute from '../../utils/getRoutes.js'

export default class ProfilesController {
    // GET /profile
    async get({ request, auth }: HttpContext) {
        const userData = await prisma.user.findUniqueOrThrow({
            where: { id: auth.user!.id },
            include: {
                courses: true,
                skills: true,
            }
        })
        return {
            data: userData,
            links: [
                { rel: 'self', href: request.url(), method : 'GET' },
                { rel: 'update', href: request.url(), method : 'PATCH' },
                { rel: 'documents', href: getRoute('my-documents'), method : 'GET' },
                { rel: 'applications', href: getRoute('my-applications'), method : 'GET' },
            ]
        }
    }

    async update({ request, auth }: HttpContext) {
        const data = request.only(['skillsIds', 'coursesIds'])

        const updatedUser = await prisma.user.guardedUpdate({
            where: { id: auth.user!.id },
            data: {
                skills: data.skillsIds ? {
                    set: data.skillsIds.map((id: number) => ({ id }))
                } : undefined,
                courses: data.coursesIds ? {
                    set: data.coursesIds.map((id: number) => ({ id }))
                } : undefined,
            },
            include: {
                skills: true,
                courses: true,
            }
        }, [ checkUnique(['emailHash', 'dni', 'phone']) ])

        return {
            data: updatedUser
        }
    }
}