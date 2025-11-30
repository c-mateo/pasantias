import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '@prisma/client'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class HasRoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      role: UserRole
    }
  ) {
    console.log('Checking role:', options.role, 'for user:', ctx.auth.user?.id)
    if (ctx.auth.user?.role !== options.role) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }
    return next()
  }
}