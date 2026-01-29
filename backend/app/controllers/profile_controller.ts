import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { checkUnique } from '../../prisma/strategies.js'
import getRoute from '#utils/getRoutes'
import { sha256 } from '#utils/hash'
import hash from '@adonisjs/core/services/hash'
import { apiErrors } from '#exceptions/my_exceptions'
import { generateToken } from '#utils/tokens'
import SendTemplatedEmail from '#jobs/send_templated_email'
import {
  updateValidator,
  requestEmailChangeValidator,
  confirmEmailChangeValidator,
  changePasswordValidator,
} from '#validators/profile'
import CreateNotifications from '#jobs/create_notifications'
import env from '#start/env'

// Validators moved to `backend/app/validators/profile.ts` and imported at top

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
      data: userData,
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
          {
            field: 'cuil',
            message: 'CUIL cannot be changed once set. Contact support for assistance.',
          },
        ])
      }
    }

    const updatedUser = await prisma.user.guardedUpdate(
      {
        where: { id: auth.user!.id },
        data: {
          ...validated,
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
      data: updatedUser,
    }
  }

  async requestEmailChange({ request, auth }: HttpContext) {
    const { newEmail, currentPassword } = await request.validateUsing(requestEmailChangeValidator)

    // Re-authenticate
    const user = await prisma.user.findUniqueOrThrow({ where: { id: auth.user!.id } })
    if (!hash.verify(user.password, currentPassword)) throw apiErrors.invalidCredentials()

    // Ensure new email not in use
    const existing = await prisma.user.findUnique({ where: { emailHash: sha256(newEmail) } })
    if (existing) throw apiErrors.emailAlreadyRegistered(newEmail)

    // Invalidate previous EMAIL_CHANGE tokens
    await prisma.userToken
      .updateMany({
        where: { userId: user.id, type: 'EMAIL_CHANGE', usedAt: null },
        data: { usedAt: new Date() },
      })
      .catch(() => {})

    const { token, tokenHash } = generateToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 60 mins

    await prisma.userToken.create({
      data: {
        userId: user.id,
        type: 'EMAIL_CHANGE',
        tokenHash,
        expiresAt,
        metadata: { newEmail },
      },
    })

    // Send confirmation to new email
    const url = `${env.get('FRONTEND_URL')}/confirm-email?token=${token}`
    await SendTemplatedEmail.dispatch({
      to: newEmail,
      template: 'auth_change_email',
      data: { name: user.firstName ?? user.email, newEmail, confirmUrl: url },
    }).catch(console.error)

    // Notify current email
    await SendTemplatedEmail.dispatch({
      to: user.email,
      template: 'auth_change_email_requested',
      data: { name: user.firstName ?? user.email, newEmail },
    }).catch(console.error)

    return { message: 'Revisa tu correo para confirmar el cambio' }
  }

  async verify({ request }: HttpContext) {
    const { token } = await request.validateUsing(confirmEmailChangeValidator)

    const tokenHash = sha256(token)
    const record = await prisma.userToken.findUnique({ where: { tokenHash } })
    if (!record) throw apiErrors.invalidToken()
    if (record.type !== 'EMAIL_VERIFY') throw apiErrors.invalidToken()
    if (record.usedAt) throw apiErrors.invalidToken()
    if (record.expiresAt < new Date()) throw apiErrors.expiredToken()

    const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } })
    if (user.emailVerifiedAt) {
      throw apiErrors.validationError([
        {
          field: 'email',
          message: 'Email is already verified.',
        },
      ])
    }

    // Transactional update: set emailVerifiedAt and mark the token used in a single atomic operation.
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      })
      await tx.userToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
      await tx.notification.deleteMany({
        where: { userId: record.userId, tag: 'email-verification' },
      })
    })
  }

  async confirmEmailChange({ request }: HttpContext) {
    const { token } = await request.validateUsing(confirmEmailChangeValidator)

    const tokenHash = sha256(token)
    const record = await prisma.userToken.findUnique({ where: { tokenHash } })
    if (!record) throw apiErrors.invalidToken()
    if (record.type !== 'EMAIL_CHANGE') throw apiErrors.invalidToken()
    if (record.usedAt) throw apiErrors.invalidToken()
    if (record.expiresAt < new Date()) throw apiErrors.expiredToken()

    const newEmail = (record.metadata as any)?.newEmail
    if (!newEmail) throw apiErrors.invalidToken()

    const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } })
    const oldEmail = user.email

    // Transactional update: change email, reset emailVerifiedAt, and mark the
    // token used in a single atomic operation. A transaction is necessary to
    // prevent race conditions where the token could be consumed twice or the
    // email is only partially updated while tokens remain active.
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: record.userId },
        data: { email: newEmail, emailHash: sha256(newEmail), emailVerifiedAt: null },
      })
      await tx.userToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })

      // invalidate previous EMAIL_CHANGE tokens
      await tx.userToken.updateMany({
        where: { userId: record.userId, type: 'EMAIL_CHANGE', usedAt: null },
        data: { usedAt: new Date() },
      })
    })

    // Notify new email
    await SendTemplatedEmail.dispatch({
      to: newEmail,
      template: 'auth_email_updated',
      data: { name: user.firstName ?? user.email, email: newEmail },
    }).catch(console.error)

    // Notify old email
    await SendTemplatedEmail.dispatch({
      to: oldEmail,
      template: 'auth_email_update_notification',
      data: { name: user.firstName ?? user.email, oldEmail },
    }).catch(console.error)

    // Notify in-site
    await CreateNotifications.dispatch({
      users: [record.userId],
      title: 'Correo actualizado',
      message: 'Tu correo fue actualizado correctamente.',
      tag: 'email-change',
    }).catch(console.error)

    return { message: 'Correo actualizado' }
  }

  async changePassword({ request, auth }: HttpContext) {
    const validated = await request.validateUsing(changePasswordValidator)

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
