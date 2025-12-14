import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { checkUnique } from '../../prisma/strategies.js'
import getRoute from '#utils/getRoutes'
import { decryptUserData, encryptUserData } from '#utils/user'

export default class ProfilesController {
  // GET /profile
  async get({ request, auth }: HttpContext) {
    const userData = await prisma.user.findUniqueOrThrow({
      where: { id: auth.user!.id },
      select: {
        role: true,
        email: true,
        firstName: true,
        lastName: true,
        dni: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        courses: { select: { id: true, name: true, description: true, shortName: true } }, // PublicCourseDTO
        skills: { select: { id: true, name: true, description: true } }, // PublicSkillDTO
      },
    })
    return {
      data: decryptUserData(userData),
      links: [
        { rel: 'self', href: request.url(), method: 'GET' },
        { rel: 'update', href: request.url(), method: 'PATCH' },
        { rel: 'documents', href: getRoute('my-documents'), method: 'GET' },
        { rel: 'applications', href: getRoute('my-applications'), method: 'GET' },
      ],
    }
  }

  async update({ request, auth }: HttpContext) {
    const data = request.only(['skillsIds', 'coursesIds'])

    const updatedUser = await prisma.user.guardedUpdate(
      {
        where: { id: auth.user!.id },
        data: {
          skills: data.skillsIds
            ? {
                set: data.skillsIds.map((id: number) => ({ id })),
              }
            : undefined,
          // TODO: Debería permitir a los usuarios controlar esto?
          courses: data.coursesIds
            ? {
                set: data.coursesIds.map((id: number) => ({ id })),
              }
            : undefined,
        },
        select: {
          role: true,
          email: true,
          firstName: true,
          lastName: true,
          dni: true,
          phone: true,
          address: true,
          city: true,
          province: true,
          courses: { select: { id: true, name: true, description: true, shortName: true } }, // PublicCourseDTO
          skills: { select: { id: true, name: true, description: true } }, // PublicSkillDTO
        },
      },
      [checkUnique(['emailHash', 'dni', 'phone'])]
    )

    return {
      data: decryptUserData(updatedUser),
    }
  }
}
