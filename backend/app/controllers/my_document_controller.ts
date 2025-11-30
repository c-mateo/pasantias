import { apiErrors } from '#exceptions/myExceptions'
import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import fs, { stat } from 'fs/promises'

const select = {
    id: true,
    originalName: true,
    hash: true,
    createdAt: true,
    lastUsedAt: true,
}


export async function documentIsOrphan(id: number) {
  const attachment = await prisma.documentAttachment.findFirst({
    where: {
      documentId: id,
    }
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
        none: {}
      }
    },
    data: {
      scheduledForDeletion: new Date(),
    }
  })
}


// TODO: Revisar
export default class MyDocumentsController {
    async list({ request, auth }: HttpContext) {
        // TODO: Add pagination, filtering, etc.
        const documents = await prisma.document.findMany({
            where: { userId: auth.user!.id, hiddenAt: null },
            include: {
                documentType: true,
            },
            select: select
        })
        return {
            data: documents.map(doc => ({
                id: doc.id,
                documentType: {
                    id: doc.documentType.id,
                    name: doc.documentType.name,
                },
                originalName: doc.originalName,
                hash: {
                    sha256: doc.hash
                },
                createdAt: doc.createdAt,
                lastUsedAt: doc.lastUsedAt,
            }))
        }
    }

    async get(context: HttpContext) {
        const { request } = context

        switch (request.accepts(['application/json'])) {
            case 'application/json':
                this.getJSON(context)
            default:
                this.download(context)
        }
    }

    async getJSON({ request, auth }: HttpContext) {
        const docId = request.param('id')
        const document = await prisma.document.findUniqueOrThrow({
            where: {
                id: docId,
                userId: auth.user!.id,
            },
            include: {
                documentType: true,
            },
            select: select
        })

        const info = await stat(document.path)
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
                    sha256: document.hash
                },
                createdAt: document.createdAt,
                lastUsedAt: document.lastUsedAt,
            },
            links: [
                { rel: 'self', href: request.url(), method : 'GET' },
                { rel: 'delete', href: request.url(), method : 'DELETE' },
            ]
        }
    }

    async hide({ request, auth, response }: HttpContext) {
        const docId = request.param('id')
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
                    }
                }
            }
        })
        
        const attachments = document._count.attachments

        if (attachments > 0) {
            throw apiErrors.resourceInUse('Document', docId, { attachments }, 'Cannot delete because it is used in applications or drafts.' )
        }

        await prisma.document.guardedUpdate({
            where: { id: docId },
            data: { hiddenAt: new Date() }
        })

        return response.noContent()
    }

    async download({ request, auth, response }: HttpContext) {
        const docId = request.param('id')
        const document = await prisma.document.findUniqueOrThrow({
            where: {
                id: docId,
                userId: auth.user!.id,
            }
        })

        // Assuming documents are stored in a local filesystem for this example
        const path = document.path

        if ((await fs.stat(path)).isFile() === false) {
            return response.notFound({ error: 'File not found on server' })
        }
        response.attachment(document.path, document.originalName)
    }
}