import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { checkUnique } from '../../prisma/strategies.js'
import getRoute from '#utils/getRoutes'
import { decryptUserData, encryptUserData } from '#utils/user'
import vine from '@vinejs/vine'
import { sha256 } from '#utils/hash'
import hash from '@adonisjs/core/services/hash'
import { apiErrors } from '#exceptions/my_exceptions'

const updateValidator = vine.compile(
  vine.object({
    firstName: vine.string().alpha({ allowSpaces: true }),
    lastName: vine.string().alpha({ allowSpaces: true }),
    phone: vine.string().optional(),
    address: vine.string().alphaNumeric({ allowSpaces: true }).optional(),
    city: vine.string().optional(),
    province: vine.string().optional(),
    cuil: vine
      .string()
      .regex(/^\d{2}-\d{8}-\d{1}$/)
      .optional(),
  })
)

export default class ProfilesController {
  // GET /profile
  async get({ request, auth }: HttpContext) {
    console.log(request.parsedUrl)
    const userData = await prisma.user.findUniqueOrThrow({
      where: { id: auth.user!.id },
      select: {
        role: true,
        email: true,
        firstName: true,
        lastName: true,
        cuil: true,
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
    const validated = await request.validateUsing(updateValidator)

    // Prevent changing CUIL if already set
    if (validated.cuil) {
      const existing = await prisma.user.findUniqueOrThrow({
        where: { id: auth.user!.id },
        select: { cuil: true },
      })
      if (existing.cuil) {
        throw apiErrors.validationError([
          { field: 'cuil', message: 'CUIL cannot be changed once set' },
        ])
      }
    }
    
    const updatedUser = await prisma.user.guardedUpdate(
      {
        where: { id: auth.user!.id },
        data: {
          ...encryptUserData(validated),
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
          cuil: true,
          phone: true,
          address: true,
          city: true,
          province: true,
          courses: { select: { id: true, name: true, description: true, shortName: true } }, // PublicCourseDTO
          skills: { select: { id: true, name: true, description: true } }, // PublicSkillDTO
        },
      },
      [checkUnique(['cuil', 'phone'])]
    )

    return {
      data: decryptUserData(updatedUser),
    }
  }

  async changeEmail({ request, auth }: HttpContext) {
    const validator = vine.compile(vine.object({ email: vine.string().email() }))
    const validated = await request.validateUsing(validator)

    const emailHashUnique = (email: string) => ({
      name: 'emailHash',
      launchCustomException() {
        throw apiErrors.emailAlreadyRegistered(email)
      },
    })

    const updated = await prisma.user.guardedUpdate(
      {
        where: { id: auth.user!.id },
        data: {
          ...encryptUserData({ email: validated.email }),
          emailHash: sha256(validated.email),
        },
        select: {
          role: true,
          email: true,
          firstName: true,
          lastName: true,
          cuil: true,
          phone: true,
          address: true,
          city: true,
          province: true,
        },
      },
      [checkUnique([emailHashUnique(validated.email)])]
    )

    return {
      data: decryptUserData(updated),
    }
  }

  async changePassword({ request, auth }: HttpContext) {
    const validator = vine.compile(
      vine.object({ currentPassword: vine.string(), newPassword: vine.string().minLength(8) })
    )
    const validated = await request.validateUsing(validator)

    const user = await prisma.user.findUniqueOrThrow({ where: { id: auth.user!.id } })

    if (!hash.verify(user.password, validated.currentPassword)) {
      throw apiErrors.invalidCredentials()
    }

    const hashed = await hash.make(validated.newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    return {
      message: 'Password changed',
    }
  }
}
