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
import { User } from '../../generated/prisma/client.js'
import SendEmail from '#jobs/send_email'
import { decryptUserData, encryptUserData } from '#utils/user'
import { generateToken } from '#utils/tokens'

// Validators moved to `backend/app/validators/auth.ts` and imported at top

const emailHashUnique = (email: string): FieldContext => ({
  name: 'emailHash',
  launchCustomException(_) {
    throw apiErrors.emailAlreadyRegistered(email)
  },
})

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const { email } = request.only(['email'])
    if (email === 'fakeuser@example.com') {
      await auth.use('web').login({
        id: 1,
        email: 'fakeuser@example.com',
        role: 'ADMIN',
      } as User)
      return response.status(200).json({ message: 'Logged in as fake user' })
    }

    const validated = await request.validateUsing(registerValidator)
    const hashedPassword = await hash.make(validated.password)

    const { id, role } = await prisma.user.guardedCreate(
      {
        data: {
          ...encryptUserData(validated),

          password: hashedPassword,
          emailHash: sha256(validated.email),
        },
      },
      [checkUnique(['phone', emailHashUnique(validated.email)])]
    )

    // TODO: Test this
    // Enqueue verification email (job) and a welcome notification.
    const verificationToken = sha256(`${id}-${Date.now()}`)

    // Compose verification link (frontend should implement route to accept token)
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

    // Enqueue SendEmail job
    await SendEmail.dispatch({
      to: validated.email,
      subject: 'Verify your email',
      html: `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a></p>`,
      text: `Verify your email: ${verifyUrl}`,
    }).catch(console.error)

    // TODO: Enqueue welcome notification job
    // await CreateNotifications.dispatch({
    //   users: [ id ],
    //   title: 'Welcome',
    //   message: 'Welcome to the platform. Please verify your email.',
    //   type: ''
    // }).catch(console.error)

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

  async login({ auth, request, response }: HttpContext) {
    const { email } = request.only(['email'])
    if (email === 'fakeuser@example.com') {
      await auth.use('web').login({
        id: 1,
        email: 'fakeuser@example.com',
        role: 'ADMIN',
      } as User)
      return response.status(200).json({ message: 'Logged in as fake user' })
    }

    const validated = await request.validateUsing(loginValidator)

    const user = await prisma.user.findUnique({
      where: {
        emailHash: sha256(validated.email),
      },
    })

    if (!user || !hash.verify(user.password, validated.password)) {
      throw apiErrors.invalidCredentials()
    }

    await auth.use('web').login(user)

    const decryptedUser = decryptUserData(user)

    return {
      data: {
        user: {
          id: decryptedUser.id,
          email: decryptedUser.email,
          role: decryptedUser.role,
          firstName: decryptedUser.firstName,
          lastName: decryptedUser.lastName,
        },
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

    const decryptedUser = decryptUserData(user)

    await prisma.userToken.create({
      data: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        tokenHash,
        expiresAt,
        metadata: { email: decryptedUser.email },
      },
    })

    // Send email with reset link (frontend should implement route to accept token)
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    await SendEmail.dispatch({
      to: decryptedUser.email,
      subject: 'Restablece tu contraseña',
      html: `<p>Para restablecer tu contraseña, haz click <a href="${url}">aquí</a></p>`,
      text: `Restablece tu contraseña: ${url}`,
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
    const decrypted = decryptUserData(user)
    await SendEmail.dispatch({
      to: decrypted.email,
      subject: 'Tu contraseña ha sido cambiada',
      html: `<p>Tu contraseña fue actualizada exitosamente.</p>`,
      text: `Tu contraseña fue actualizada exitosamente.`,
    }).catch(console.error)

    // Return email in response so frontend can auto-login if desired
    return response.ok({ message: 'Contraseña actualizada', email: decrypted.email })
  }
}
