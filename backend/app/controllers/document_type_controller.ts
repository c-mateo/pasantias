import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import {
  idValidator,
  createValidator,
  updateValidator,
  deleteValidator,
} from '#validators/document_type'
import vine from '@vinejs/vine'
import { buildFilterWhere } from '#utils/query_builder'
import { checkDeleteRestrict, checkUnique } from '../../prisma/strategies.js'

function getDocumentTypeOrder(sort?: string) {
  switch (sort) {
    case 'name':
      return { name: 'asc' } as const
    case '-name':
      return { name: 'desc' } as const
    case 'createdAt':
      return { createdAt: 'asc' } as const
    case '-createdAt':
      return { createdAt: 'desc' } as const
    default:
      return { id: 'asc' } as const
  }
}

export default class DocumentTypeController {
  async list({ request, auth }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.string().optional(),
      filter: vine
        .object({
          name: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere(query.filter)

    const isNotAdmin = auth.user?.role !== 'ADMIN'

    return await prisma.documentType.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      orderBy: getDocumentTypeOrder(query.sort as any),
      omit: {
        createdAt: isNotAdmin,
        updatedAt: isNotAdmin,
      },
    })
  }

  async get({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    const isNotAdmin = auth.user?.role !== 'ADMIN'
    const dt = await prisma.documentType.findUniqueOrThrow({
      where: { id: params.id },
      omit: {
        createdAt: isNotAdmin,
        updatedAt: isNotAdmin,
      },
    })
    return { data: dt }
  }

  async create({ request }: HttpContext) {
    const validated = await request.validateUsing(createValidator)
    const documentType = await prisma.documentType.guardedCreate({ data: validated }, [
      checkUnique(['name']),
    ])
    return { data: documentType }
  }

  async update({ request }: HttpContext) {
    const { params, ...data } = await request.validateUsing(updateValidator)
    const updated = await prisma.documentType.guardedUpdate({ where: { id: params.id }, data }, [
      checkUnique(['name']),
    ])
    return { data: updated }
  }

  async delete({ request }: HttpContext) {
    const { params } = await request.validateUsing(deleteValidator)
    if (params.force) {
      // No relations to disconnect currently, but keep pattern for future
    }
    await prisma.documentType.guardedDelete({ where: { id: params.id } }, [
      checkDeleteRestrict('DocumentType'),
    ])
    return { message: `DocumentType with id ${params.id} deleted successfully.` }
  }
}
