import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { sha256 } from './auth_controller.js'
import fs, { stat } from 'fs/promises'
import { apiErrors } from '#exceptions/myExceptions'
import { createWriteStream } from 'fs'
import router from '@adonisjs/core/services/router'
import { randomUUID } from 'crypto'
import path from 'path'
import { checkFK, checkUnique } from '../../prisma/strategies.js'

const validator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.number(),
    }),
    customFieldsValues: vine.object({}).optional(),
  })
)

const uploadValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
      // Es el tipo de documento requerido, no el id del documento requerido
      reqDocId: vine.number(),
    }),
    headers: vine.object({
      'content-type': vine.string(),
      'content-length': vine.number(),
      'x-original-filename': vine.string(),
    }),
  })
)

const deleteValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
      // Es el tipo de documento requerido, no el id del documento requerido
      attachmentId: vine.number(),
    }),
  })
)

const useExistingValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
    }),
    documentId: vine.number(),
  })
)

const idValidator = vine.compile(
  vine.object({
    params: vine.object({
      offerId: vine.number(),
    }),
  })
)

const uploadsFolder = 'uploads'
const maxUploadFileSize = 10 * 1024 * 1024

export default class DraftsController {
  // Drafts
  async get({ request, response, auth }: HttpContext) {
    console.log('Getting draft for user:', auth.user!.id)
    const { params } = await request.validateUsing(validator)
    const draft = await prisma.draft.findUnique({
      where: {
        userId_offerId: { userId: auth.user!.id, offerId: params.id },
        offer: { status: 'ACTIVE' },
      },
    })

    // TODO: Revisar
    if (draft) return draft
    response.noContent()
  }

  async save({ request, auth }: HttpContext) {
    const { params, customFieldsValues } = await request.validateUsing(validator)
    console.log(customFieldsValues)

    const existingDraft = await prisma.draft.findUnique({
      where: {
        userId_offerId: { userId: auth.user!.id, offerId: params.id },
        offer: { status: 'ACTIVE' },
      },
    })

    // TODO: Implement
    throw apiErrors.internalError('Not implemented yet', '')

    // if (existingDraft) {
    //   const updatedDraft = await prisma.draft.update({
    //     where: { userId_offerId: { userId: auth.user!.id, offerId: params.offerId } },
    //     data: {
    //       customFieldsValues
    //     }
    //   })
    //   return updatedDraft
    // } else {
    //   const newDraft = await prisma.draft.create({
    //     data: {
    //       userId: auth.user!.id,
    //       offerId: offerId,
    //       content
    //     }
    //   })
    //   return newDraft
    // }
  }

  async clear({ request, response, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    await prisma.draft.guardedDelete({
      where: {
        userId_offerId: {
          userId: auth.user!.id,
          offerId: params.offerId,
        },
      },
    })
    response.noContent()
  }

  async uploadDocument({ request, auth }: HttpContext) {
    const { params, headers } = await request.validateUsing(uploadValidator)
    if (headers['content-type'] !== 'application/pdf') {
      throw apiErrors.invalidFile([
        {
          reason: 'Unsupported content type',
        },
      ])
    }

    const size = headers['content-length']
    const originalName = headers['x-original-filename']

    if (size <= 0 || size > maxUploadFileSize) {
      throw apiErrors.invalidFile([
        {
          reason: `File size out of allowed range (1 byte to )`,
          field: 'content-length',
        },
      ])
    }

    const savePath = path.join(uploadsFolder, randomUUID() + '.pdf')

    try {
      await fs.mkdir(uploadsFolder, { recursive: true })
      request.request.pipe(createWriteStream(savePath, { flags: 'w' }))
    } catch (error) {
      await fs.rm(savePath)
      // TODO: Convert error if needed
      throw error
    }

    const fileStats = await stat(savePath)

    if (size != fileStats.size) {
      throw apiErrors.invalidFile([
        {
          reason: 'Uploaded file size does not match Content-Length header',
          field: 'size',
        },
      ])
    }

    const buffer = await fs.readFile(savePath)

    // No deberían repetirse los nombres de archivo por el UUID
    const document = await prisma.document.guardedCreate(
      {
        data: {
          userId: auth.user!.id,
          documentTypeId: params.reqDocId,
          hash: sha256(buffer),
          originalName: originalName,
          size: size,
          path: savePath,
        },
      },
      [checkUnique(['path'])]
    )

    // Link document to draft
    await linkDocumentToDraft(params.offerId, document)

    return {
      data: {
        id: document.id,
        documentTypeId: document.documentTypeId,
        originalName: document.originalName,
        size: document.size,
        hash: { sha256: document.hash },
      },
      links: [
        {
          rel: 'document',
          href: router.builder().params([document.id]).make('my-documents.get'),
          method: 'GET',
        },
      ],
    }
  }

  async useExistingDocument({ request }: HttpContext) {
    const { params, documentId } = await request.validateUsing(useExistingValidator)

    const document = await prisma.document.findUniqueOrThrow({
      where: {
        id: documentId,
      },
    })

    await linkDocumentToDraft(params.offerId, document)

    return {
      data: {
        id: document.id,
        documentTypeId: document.documentTypeId,
        originalName: document.originalName,
        size: document.size,
        hash: { sha256: document.hash },
      },
    }
  }

  async removeDocument({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(deleteValidator)
    await prisma.documentAttachment.guardedDelete({
      where: {
        id: params.attachmentId,
      },
    })

    response.noContent()
  }

  // TODO: Test
  async getDocuments({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    const documents = await prisma.document.findMany({
      where: {
        attachments: {
          some: {
            draft: {
              userId: auth.user!.id,
              offerId: params.offerId,
            },
          },
        },
      },
    })
    return {
      data: documents,
    }
  }

  async confirm({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

    const draft = await prisma.draft.findUniqueOrThrow({
      where: {
        userId_offerId: {
          userId: auth.user!.id,
          offerId: params.offerId,
        },
      },
      include: {
        attachments: true,
      },
    })

    // TODO: Validar que el draft está completo
    const requiredDocs = await prisma.requiredDocument.findMany({
      where: {
        offerId: params.offerId,
      },
      include: {
        documentType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // TODO: Contar los campos personalizados completados también
    const completed = draft.attachments.length
    const total = requiredDocs.length
    if (total !== completed) {
      throw apiErrors.incompleteDraft(completed, total, {
        documents: requiredDocs.map((rd) => rd.documentType.name),
      })
    }

    // Crear la postulación y eliminar el draft
    await prisma.draft.guardedDelete({
      where: {
        id: draft.id,
      },
    })

    const application = await prisma.application.guardedCreate(
      {
        data: {
          userId: auth.user!.id,
          offerId: params.offerId,
          customFieldsValues: draft.customFieldsValues ?? undefined,
          attachments: {
            connect: draft.attachments.map((att) => ({ id: att.id })),
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
      [checkUnique(['userId', 'offerId']), checkFK(['userId', 'offerId'])]
    )

    // TODO: Notificar a la empresa y al usuario

    return {
      data: {
        applicationId: application.id,
        status: application.status,
        appliedAt: application.createdAt,
      },
    }
  }
}

async function linkDocumentToDraft(
  offerId: number,
  document: { userId: number; documentTypeId: number; id: number }
) {
  // Verificar que el documento es requerido por la oferta
  const requiredDocument = await prisma.requiredDocument.findUnique({
    where: {
      offerId_documentTypeId: {
        offerId: offerId,
        documentTypeId: document.documentTypeId,
      },
    },
  })

  if (!requiredDocument) {
    // throw errors.invalidFile([{
    //     reason: 'El tipo de documento no es requerido para esta oferta'
    // }])
    throw apiErrors.notFound('RequiredDocument', document.documentTypeId)
  }

  const draft = await prisma.draft.upsert({
    where: {
      userId_offerId: {
        userId: document.userId,
        offerId: offerId,
      },
    },
    include: {
      attachments: {
        select: {
          document: {
            select: {
              id: true,
              documentTypeId: true,
            },
          },
        },
      },
    },
    create: {
      userId: document.userId,
      offerId: offerId,
      attachments: {
        create: {
          documentId: document.id,
        },
      },
    },
    update: {
      attachments: {
        create: {
          documentId: document.id,
        },
      },
    },
  })

  // Ensure the document is linked to the draft and unlink others of the same type
  const linkedDocsOfSameType = draft.attachments.filter(
    (att) => att.document.documentTypeId !== document.documentTypeId
  )
  const isLinked = linkedDocsOfSameType.some((att) => att.document.id === document.id)
  const otherLinkedDocsOfSameType = linkedDocsOfSameType.filter(
    (att) => att.document.id !== document.id
  )

  if (!isLinked)
    throw apiErrors.internalError('Document was not linked to draft', 'support@yourdomain.com')

  if (otherLinkedDocsOfSameType.length > 0) {
    // TODO: Creo que no debería haber ningún error sin manejar
    await prisma.documentAttachment.deleteMany({
      where: {
        draftId: draft.id,
        documentId: {
          in: otherLinkedDocsOfSameType.map((att) => att.document.id),
        },
      },
    })
  }

  // TODO: Marcar documentos sin usar para borrado automático
}
