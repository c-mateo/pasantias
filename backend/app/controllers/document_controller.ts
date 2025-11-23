import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'

// TODO: Revisar
export default class DocumentsController {
    async list({ request, auth }: HttpContext) {
        // TODO: Add pagination, filtering, etc.
        const documents = await prisma.document.findMany({
            where: { userId: auth.user!.id },
            include: {
                documentType: true,
            }
        })
        return {
            data: documents.map(doc => ({
                id: doc.id,
                documentType: {
                    id: doc.documentType.id,
                    name: doc.documentType.name,
                },
                originalName: doc.originalName,
                size: doc.fileSize,
                createdAt: doc.createdAt,
                lastUsedAt: doc.lastUsedAt,
            })),
            links: [
                { rel: 'self', href: request.url() + `/${doc.id}`, method : 'GET' },
                { rel: 'delete', href: request.url() + `/${doc.id}`, method : 'DELETE' },
            ]
        }
    }

    async get({ request, auth }: HttpContext) {
        const docId = request.param('id')
        const document = await prisma.document.findFirst({
            where: {
                id: docId,
                userId: auth.user!.id,
            },
            include: {
                documentType: true,
            }
        })
        if (!document) {
            return {
                status: 404,
                body: { error: 'Document not found' }
            }
        }
        return {
            data: {
                id: document.id,
                documentType: {
                    id: document.documentType.id,
                    name: document.documentType.name,
                },
                originalName: document.originalName,
                size: document.fileSize,
                createdAt: document.createdAt,
                lastUsedAt: document.lastUsedAt,
            },
            links: [
                { rel: 'self', href: request.url(), method : 'GET' },
                { rel: 'delete', href: request.url(), method : 'DELETE' },
            ]
        }
    }

    async delete({ request, auth, response }: HttpContext) {
        const docId = request.param('id')
        const document = await prisma.document.findFirst({
            where: {
                id: docId,
                userId: auth.user!.id,
            }
        })
        if (!document) {
            return response.status(404).send({ error: 'Document not found' })
        }

        await prisma.document.delete({
            where: { id: docId }
        })

        return response.noContent()
    }
}