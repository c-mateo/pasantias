import { prisma } from '#start/prisma'
import { symbols } from '@adonisjs/auth'
import { SessionGuardUser, SessionUserProviderContract } from '@adonisjs/auth/types/session'
import { User } from '../../generated/prisma/client.js'

export class PrismaUserProvider implements SessionUserProviderContract<User> {
  declare [symbols.PROVIDER_REAL_USER]: User

  async createUserForGuard(user: User): Promise<SessionGuardUser<User>> {
    return {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }
  }

  async findById(identifier: number): Promise<SessionGuardUser<User> | null> {
    const user = await prisma.user.findUnique({
      where: { id: identifier },
    })

    return user ? await this.createUserForGuard(user) : null
  }
}
