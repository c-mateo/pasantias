import { apiErrors } from '#exceptions/my_exceptions'
import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import vine from '@vinejs/vine'
import { buildFilterWhere } from '#utils/query_builder'
import { idValidator } from '#validators/common'

function getDocumentOrder(s?: string) {
  switch (s) {
    case 'createdAt':
      return { createdAt: 'asc' } as const
    case '-createdAt':
      return { createdAt: 'desc' } as const
    default:
      return { createdAt: 'desc' } as const
  }
}

const select = {
  id: true,
  originalName: true,
  hash: true,
  createdAt: true,
  lastUsedAt: true,
}

async function fileExists(path: string) {
  try {
    await fs.access(path)
    const stat = await fs.stat(path)
    return stat.isFile()
  } catch (error) {
    // Check if the error code is 'ENOENT' (Entry Not Found)
    if (error.code === 'ENOENT') {
      return false // File does not exist
    }
    // Re-throw other unexpected errors
    throw error
  }
}

export async function documentIsOrphan(id: number) {
  const attachment = await prisma.documentAttachment.findFirst({
    where: {
      documentId: id,
    },
  })
  return !attachment
}

export async function markOrphanDocuments(ids: number[]) {
  // TODO: Puede que de errores. Revisar
  await prisma.document.updateMany({
    where: {
      id: {
        in: ids,
      },
      attachments: {
        none: {},
      },
    },
    data: {
      scheduledForDeletion: new Date(),
    },
  })
}

// TODO: Revisar
export default class MyDocumentsController {
  async list({ request, auth }: HttpContext) {
    const paginationSchema = vine.create({
      limit: vine.number().range([1, 100]).optional(),
      after: vine.number().optional(),
      sort: vine.string().optional(),
      filter: vine
        .object({
          originalName: vine
            .object({ contains: vine.string().optional(), eq: vine.string().optional() })
            .optional(),
          documentTypeId: vine
            .object({ eq: vine.number().optional(), in: vine.array(vine.number()).optional() })
            .optional(),
          createdAt: vine
            .object({
              eq: vine.string().optional(),
              gte: vine.string().optional(),
              lte: vine.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })

    const query = await paginationSchema.validate(request.qs())

    const filter = buildFilterWhere<any>(query.filter)
    filter.userId = auth.user!.id
    filter.hiddenAt = null

    const result = await prisma.document.paginate({
      limit: query.limit ?? 20,
      after: query.after,
      where: filter,
      select: {
        ...select,
        documentType: true,
      },
      orderBy: getDocumentOrder(query.sort as any),
    })

    return {
      data: result.data.map((doc: any) => ({
        id: doc.id,
        documentType: {
          id: doc.documentType.id,
          name: doc.documentType.name,
        },
        originalName: doc.originalName,
        hash: {
          sha256: doc.hash,
        },
        createdAt: doc.createdAt,
        lastUsedAt: doc.lastUsedAt,
      })),
      pagination: result.pagination,
    }
  }

  async get(context: HttpContext) {
    const { request } = context

    switch (request.accepts(['application/json'])) {
      case 'application/json':
        this.getJSON(context)
        break
      default:
        this.download(context)
        break
    }
  }

  async getJSON({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    const docId = params.id

    const document = await prisma.document.findUniqueOrThrow({
      where: {
        id: docId,
        userId: auth.user!.id,
      },
      select: {
        ...select,
        documentType: true,
        path: true,
      },
    })

    const info = await fs.stat(document.path)
    const fileSize = info.size

    return {
      data: {
        id: document.id,
        documentType: {
          id: document.documentType.id,
          name: document.documentType.name,
        },
        originalName: document.originalName,
        size: fileSize,
        hash: {
          sha256: document.hash,
        },
        createdAt: document.createdAt,
        lastUsedAt: document.lastUsedAt,
      },
      links: [
        { rel: 'self', href: request.url(), method: 'GET' },
        { rel: 'delete', href: request.url(), method: 'DELETE' },
      ],
    }
  }

  async hide({ request, auth, response }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    const docId = params.id

    const document = await prisma.document.findUniqueOrThrow({
      where: {
        id: docId,
        userId: auth.user!.id,
        hiddenAt: null,
      },
      include: {
        _count: {
          select: {
            attachments: true,
          },
        },
      },
    })

    const attachments = document._count.attachments

    if (attachments > 0) {
      throw apiErrors.resourceInUse(
        'Document',
        docId,
        { attachments },
        'Cannot delete because it is used in applications or drafts.'
      )
    }

    await prisma.document.guardedUpdate({
      where: { id: docId },
      data: { hiddenAt: new Date() },
    })

    return response.noContent()
  }

  async download({ request, auth, response }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    const docId = params.id

    const document = await prisma.document.findUniqueOrThrow({
      where: {
        id: docId,
        userId: auth.user!.id,
      },
    })

    // Assuming documents are stored in a local filesystem for this example
    const path = document.path

    if (!(await fileExists(path))) {
      return response.notFound({ error: 'File not found on server' })
    }
    response.attachment(document.path, document.originalName)
  }
}
