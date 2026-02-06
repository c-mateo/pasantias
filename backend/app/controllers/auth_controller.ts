import { apiErrors } from '#exceptions/my_exceptions'
import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/auth'
import { sha256 } from '#utils/hash'
import { checkUnique, FieldContext } from '../../prisma/strategies.js'
import getRoute from '#utils/getRoutes'

import { generateToken } from '#utils/tokens'
import SendTemplatedEmail from '#jobs/send_templated_email'
import CreateNotifications from '#jobs/create_notifications'
import env from '#start/env'

// Validators moved to `backend/app/validators/auth.ts` and imported at top

const emailHashUnique = (email: string): FieldContext => ({
  name: 'emailHash',
  launchCustomException(_) {
    throw apiErrors.emailAlreadyRegistered(email)
  },
})

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const validated = await request.validateUsing(registerValidator)
    const hashedPassword = await hash.make(validated.password)

    const userCount = await prisma.user.count()

    const { id, role } = await prisma.user.guardedCreate(
      {
        data: {
          ...validated,

          role: userCount === 0 ? 'ADMIN' : 'STUDENT', // First registered user gets ADMIN
          password: hashedPassword,
          emailHash: sha256(validated.email),
        },
      },
      [checkUnique([emailHashUnique(validated.email)])]
    )

    // TODO: Test this
    // Enqueue verification email (job) and a welcome notification.
    const verificationToken = sha256(`${id}-${Date.now()}`)

    // Compose verification link (frontend should implement route to accept token)
    const verifyUrl = `${env.get('FRONTEND_URL')}/verify-email?token=${verificationToken}`

    await SendTemplatedEmail.dispatch({
      to: validated.email,
      template: 'auth_welcome',
      data: {
        name: validated.firstName,
        verifyUrl,
      },
    }).catch(console.error)

    await CreateNotifications.dispatch({
      users: [id],
      title: 'Welcome',
      message: 'Welcome to the platform. Please verify your email.',
      tag: 'email-verification',
    }).catch(console.error)

    return response.created({
      data: {
        id,
        email: validated.email,
        role,
        firstName: validated.firstName,
        lastName: validated.lastName,
      },
      links: [{ rel: 'login', href: getRoute('auth.login'), method: 'POST' }],
    })
  }

  async login({ auth, request }: HttpContext) {
    const validated = await request.validateUsing(loginValidator)

    const user = await prisma.user.findUnique({
      where: {
        emailHash: sha256(validated.email),
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        password: true,
      },
    })

    if (!user || !hash.verify(user.password, validated.password)) {
      throw apiErrors.invalidCredentials()
    }

    await auth.use('web').login(user)

    const { password, ...userWithoutPassword } = user

    return {
      data: {
        user: userWithoutPassword,
        // TODO: Implement proper session expiration management
        sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
        links: [
          { rel: 'profile', href: getRoute('profile'), method: 'GET' },
          { rel: 'applications', href: getRoute('my-applications'), method: 'GET' },
          { rel: 'documents', href: getRoute('my-documents'), method: 'GET' },
          { rel: 'offers', href: getRoute('offers'), method: 'GET' },
          { rel: 'logout', href: getRoute('auth.logout'), method: 'POST' },
        ],
      },
    }
  }

  async logout({ auth, response }: HttpContext) {
    // await auth.logout()
    // return response.redirect('/login')
    await auth.use('web').logout()
    response.noContent()
  }

  // POST /auth/password/forgot
  async forgotPassword({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)

    // Anti-enumeration: always return same message
    const message = { message: 'Si el correo existe, recibirás un email' }

    // Find user by hashed email
    const user = await prisma.user.findUnique({ where: { emailHash: sha256(email) } })
    if (!user) {
      return response.ok(message)
    }

    // Invalidate active PASSWORD_RESET tokens
    await prisma.userToken
      .updateMany({
        where: { userId: user.id, type: 'PASSWORD_RESET', usedAt: null },
        data: { usedAt: new Date() },
      })
      .catch(() => {})

    // Generate token and save hashed
    const { token, tokenHash } = generateToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 60 minutes

    await prisma.userToken.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        tokenHash,
        expiresAt,
        metadata: { email: user.email },
      },
    })

    // Send email with reset link (frontend should implement route to accept token)
    const url = `${env.get('FRONTEND_URL')}/reset-password?token=${token}`
    await SendTemplatedEmail.dispatch({
      to: user.email,
      template: 'auth_reset_password',
      data: {
        name: user.firstName ?? user.email,
        expiresInMinutes: 60,
        resetUrl: url,
      },
    }).catch(console.error)

    return response.ok(message)
  }

  // POST /auth/password/reset
  async resetPassword({ request, response }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const tokenHash = sha256(token)

    const record = await prisma.userToken.findUnique({ where: { tokenHash } })
    if (!record) throw apiErrors.invalidToken()
    if (record.type !== 'PASSWORD_RESET') throw apiErrors.invalidToken()
    if (record.usedAt) throw apiErrors.invalidToken()
    if (record.expiresAt < new Date()) throw apiErrors.expiredToken()

    // Everything valid => perform all related updates atomically. We use a
    // transaction because we must ensure the password change and marking the
    // reset token as used happen together; otherwise a partial state could
    // allow reuse of the token or leave the user without the updated password.
    const hashed = await hash.make(password)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: record.userId }, data: { password: hashed } })
      await tx.userToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })

      // Optionally, invalidate other password reset tokens
      await tx.userToken.updateMany({
        where: { userId: record.userId, type: 'PASSWORD_RESET', usedAt: null },
        data: { usedAt: new Date() },
      })

      // TODO: invalidate user sessions — see note in docs
    })

    // Notify user
    // We need user's email for notification
    const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } })
    await SendTemplatedEmail.dispatch({
      to: user.email,
      template: 'auth_password_changed',
      data: { name: user.firstName ?? user.email },
    }).catch(console.error)

    // Return email in response so frontend can auto-login if desired
    return response.ok({ message: 'Contraseña actualizada', email: user.email })
  }
}
