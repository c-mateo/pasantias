import { prisma } from '#start/prisma'
import vine from '@vinejs/vine'
import { createCourseValidator, idValidator, updateCourseValidator } from '#validators/course'
import { buildFilterWhere } from '#utils/query_builder'
import { HttpContext } from '@adonisjs/core/http'
import { apiErrors } from '#exceptions/my_exceptions'
import { checkUnique } from '../../prisma/strategies.js'

enum CoursesSort {
  NAME = 'name',
  SHORT_NAME = 'shortName',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME_DESC = '-name',
  SHORT_NAME_DESC = '-shortName',
  CREATED_AT_DESC = '-createdAt',
  UPDATED_AT_DESC = '-updatedAt',
}

function getOrder(sort?: CoursesSort) {
  switch (sort) {
    case CoursesSort.NAME:
      return { name: 'asc' } as const
    case CoursesSort.CREATED_AT:
      return { createdAt: 'asc' } as const
    case CoursesSort.UPDATED_AT:
      return { updatedAt: 'asc' } as const
    case CoursesSort.SHORT_NAME:
      return { shortName: 'asc' } as const
    case CoursesSort.NAME_DESC:
      return { name: 'desc' } as const
    case CoursesSort.CREATED_AT_DESC:
      return { createdAt: 'desc' } as const
    case CoursesSort.UPDATED_AT_DESC:
      return { updatedAt: 'desc' } as const
    case CoursesSort.SHORT_NAME_DESC:
      return { shortName: 'desc' } as const
    default:
      return { name: 'asc' } as const
  }
}

export default class CoursesController {
  // GET /courses
  async list({ auth, request }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.enum(CoursesSort).optional(),
      filter: vine
        .object({
          name: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          shortName: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere(query.filter)
    const isNotAdmin = auth.user?.role !== 'ADMIN'

    return await prisma.course.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getOrder(query.sort),
      omit: {
        createdAt: isNotAdmin,
        updatedAt: isNotAdmin,
      },
    })
  }

  // POST /courses
  async create({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCourseValidator)

    const course = await prisma.course.guardedCreate({ data }, [checkUnique(['name'])])
    response.created({ data: course })
  }

  // GET /courses/:id
  async get({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator, { meta: { throw: true } })
    const isNotAdmin = auth.user?.role !== 'ADMIN'
    const course = await prisma.course.findUniqueOrThrow({
      where: { id: params.id },
      omit: {
        createdAt: isNotAdmin,
        updatedAt: isNotAdmin,
      },
    })
    return {
      data: course,
      links: [{ rel: 'self', href: request.url(), method: 'GET' }],
    }
  }

  // PATCH /courses/:id
  async update({ request }: HttpContext) {
    const { params, ...data } = await request.validateUsing(updateCourseValidator)
    const course = await prisma.course.guardedUpdate(
      {
        where: { id: params.id },
        data,
      },
      [checkUnique(['name'])]
    )
    if (!course) {
      throw apiErrors.notFound('Course', params.id)
    }
    return {
      data: course,
    }
  }

  // DELETE /courses/:id
  async delete({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

    await prisma.course.guardedDelete({
      where: { id: params.id },
    })

    response.noContent()
  }
}
