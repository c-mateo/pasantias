import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { idValidator } from '#validators/users'
import { buildFilterWhere } from '#utils/query_builder'
import { sha256 } from '#utils/hash'
import { updateCuilValidator } from '#validators/users'

export default class UserController {
  async list({ request }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.string().optional(),
      filter: vine
        .object({
          firstName: vine
            .object({
              contains: vine.string().optional(),
              eq: vine.string().optional(),
            })
            .optional(),
          lastName: vine
            .object({
              contains: vine.string().optional(),
              eq: vine.string().optional(),
            })
            .optional(),
          role: vine
            .object({
              eq: vine.string().optional(),
              in: vine.array(vine.string()).optional(),
            })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere(query.filter)

    const result = await prisma.user.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
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
      data: result.data,
      pagination: result.pagination,
    }
  }

  async get({ request }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

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
      data: user,
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
    const { params } = await request.validateUsing(idValidator)

    await prisma.user.guardedDelete({
      where: {
        id: params.id,
        role: 'STUDENT',
      },
    })

    response.noContent()
  }
}
