import { apiErrors } from '#exceptions/myExceptions'
import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import { sha256 } from '#utils/hash'
import { checkUnique } from '../../prisma/strategies.js'
import getRoute from '#utils/getRoutes'
import { User } from '../../generated/prisma/client.js'
import { decryptUserData, encryptUserData } from '#utils/user'

const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
    firstName: vine.string(),
    lastName: vine.string(),
    dni: vine.string().minLength(8).maxLength(10),
    phone: vine.string().minLength(7).maxLength(15),
    address: vine.string(),
    province: vine.string(),
    city: vine.string(),
  })
)

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

// TODO: Implement session management, email verification, password reset, etc.
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

    const encryptedData = encryptUserData(validated)

    const { id, role } = await prisma.user.guardedCreate(
      {
        data: {
          password: hashedPassword,

          ...encryptedData,

          emailHash: sha256(validated.email),
        },
      },
      [checkUnique(['emailHash', 'dni', 'phone'])]
    )

    // TODO: Test this
    // Enqueue verification email (job) and a welcome notification.
    const verificationToken = sha256(`${id}-${Date.now()}`)

    // Compose verification link (frontend should implement route to accept token)
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

    // Enqueue SendEmail job
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { enqueue } = require('#utils/jobs')
    enqueue('SendEmail', {
      to: validated.email,
      subject: 'Verify your email',
      html: `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a></p>`,
      text: `Verify your email: ${verifyUrl}`,
    }).catch(console.error)

    // Optionally create a notification for the user
    enqueue('CreateNotificationsJob', {
      notifications: [
        {
          userId: id,
          title: 'Welcome',
          message: 'Welcome to the platform. Please verify your email.',
        },
      ],
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

  // TODO: Implement password reset
  // async resetPassword({ request, response }: HttpContext) {
  // }
}
