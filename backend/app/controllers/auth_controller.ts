import type { HttpContext } from '@adonisjs/core/http'
import { User } from '@prisma/client'

export default class AuthController {
    async register({ request, response, auth }: HttpContext) {
        await auth.use('web').login({
            id: 1,
            email: 'fakeuser@example.com',
            role: 'ADMIN',
        } as User)
    }

    async login({ auth, request, response }: HttpContext) {
        // const email = request.input('email')
        // const password = request.input('password')

        // auth.use('web').login()
    }

    async logout({ auth, response }: HttpContext) {
        // await auth.logout()
        // return response.redirect('/login')
        await auth.use('web').logout()
    }
}