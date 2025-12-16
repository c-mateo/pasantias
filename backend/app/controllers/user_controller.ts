import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import { idValidator } from '#validators/users'
import { preparePagination, buildWhere } from '#utils/pagination'
import { decryptUserData } from '#utils/user'
import { sha256 } from '#utils/hash'
import { updateCuilValidator } from '#validators/users'

export default class UserController {
  async list({ request }: HttpContext) {
    const { query, filterWhere } = await preparePagination(request, {
      fieldMap: {
        id: 'number',
        email: 'string',
        firstName: 'string',
        lastName: 'string',
        role: 'string',
      },
    })

    const result = await prisma.user.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: buildWhere(filterWhere),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        cuil: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      data: result.data.map(decryptUserData),
      pagination: result.pagination,
    }
  }

  async get({ request }: HttpContext) {
    const { params } = await idValidator.validate(request)

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        cuil: true,
        address: true,
        province: true,
        city: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return {
      data: decryptUserData(user),
    }
  }

  // Update CUIL (admin only)
  async updateCuil({ request, response }: HttpContext) {
    const { params, ...validated } = await request.validateUsing(updateCuilValidator)

    // Fetch target user
    const user = await prisma.user.findUniqueOrThrow({ where: { id: params.id } })

    // Single update — no transaction required because this is a single atomic
    // database operation. We avoid using a transaction here to reduce overhead.
    // If future requirements need to perform multiple related writes (audit
    // log, session invalidation, notifications), we should switch back to a
    // transaction to guarantee atomicity.
    await prisma.user.update({
      where: { id: user.id },
      data: { cuil: validated.cuil, cuilHash: sha256(validated.cuil) },
    })

    return response.ok({ message: 'CUIL actualizado' })
  }

  async delete({ request, response }: HttpContext) {
    const { params } = await idValidator.validate(request)

    await prisma.user.guardedDelete({
      where: {
        id: params.id,
        role: 'STUDENT',
      },
    })

    response.noContent()
  }
}
