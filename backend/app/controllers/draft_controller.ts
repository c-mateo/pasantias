import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import {
  validator,
  uploadValidator,
  deleteValidator,
  useExistingValidator,
  idValidator,
} from '#validators/draft'
import { sha256 } from '#utils/hash'
import fs from 'node:fs/promises'
import { apiErrors } from '#exceptions/my_exceptions'
import { createWriteStream } from 'node:fs'
import router from '@adonisjs/core/services/router'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { checkFK, checkUnique } from '../../prisma/strategies.js'
import { pipeline } from 'node:stream/promises'
import CreateNotifications from '#jobs/create_notifications'

const uploadsFolder = 'uploads'
const maxUploadFileSize = 10 * 1024 * 1024

/**
 * Controlador para gestionar borradores de postulación (drafts).
 *
 * @todo Consolidar la lógica de eliminación automática de documentos huérfanos.
 * @todo Añadir pruebas para flujos de subida concurrente y enlaces de documentos.
 */
export default class DraftsController {
  /** Listar/obtener borrador del usuario para una oferta. */
  async get({ request, response, auth }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const draft = await prisma.draft.findUnique({
      where: {
        userId_offerId: { userId: auth.user!.id, offerId: params.offerId },
        offer: { status: 'ACTIVE' },
      },
      include: {
        attachments: {
          select: {
            id: true,
            document: {
              select: {
                id: true,
                documentTypeId: true,
                documentType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                originalName: true,
              },
            },
          },
        },
      },
    })

    if (draft) return draft
    response.noContent()
  }

  async save({ request, auth }: HttpContext) {
    const { params, customFieldsValues } = await request.validateUsing(validator)

    const offerId = params.offerId

    // Ensure the offer exists and is ACTIVE
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      select: { id: true, status: true },
    })

    if (!offer || offer.status !== 'ACTIVE') {
      throw apiErrors.notFound('Offer', offerId)
    }

    // Upsert draft: create if not exists, otherwise update custom fields
    const draft = await prisma.draft.upsert({
      where: {
        userId_offerId: { userId: auth.user!.id, offerId },
      },
      create: {
        userId: auth.user!.id,
        offerId,
        customFieldsValues: customFieldsValues ?? undefined,
      },
      update: {
        customFieldsValues: customFieldsValues ?? undefined,
      },
      include: {
        attachments: true,
      },
    })

    return { data: draft }
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
      await pipeline(request.request, createWriteStream(savePath, { flags: 'w' }))
    } catch (error) {
      await fs.rm(savePath)
      // Re-throw for upstream handling; consider mapping to apiErrors if needed.
      throw error
    }

    const fileStats = await fs.stat(savePath)

    if (size !== fileStats.size) {
      throw apiErrors.invalidFile([
        {
          reason: 'Uploaded file size does not match Content-Length header',
          field: 'size',
        },
      ])
    }

    const buffer = await fs.readFile(savePath)
    const hash = await sha256(buffer)

    let document = await prisma.document.findFirst({
      where: {
        hash: hash,
      },
    })

    if (document) {
      // Eliminar el archivo subido ya que el documento ya existe
      await fs.rm(savePath)
      if (document.documentTypeId !== params.reqDocId) {
        // If the existing document belongs to the same user and is orphan (no attachments),
        // allow reassigning its documentType to the requested one so the user can re-upload
        // after unlinking/deleting the previous attachment.
        const attachment = await prisma.documentAttachment.findFirst({
          where: { documentId: document.id },
        })
        const isOrphan = !attachment
        if (document.userId !== auth.user!.id) {
          // Document exists but belongs to another user
          throw apiErrors.internalError('Document with same content already exists')
        }
        if (!isOrphan) {
          // Document exists and cannot be reused
          throw apiErrors.invalidFile([
            {
              reason: 'A document with the same content already exists but is of a different type',
              field: 'document-type',
            },
          ])
        }

        // Update the existing orphan document to the requested type and original name
        await prisma.document.guardedUpdate({
          where: { id: document.id },
          data: {
            documentTypeId: params.reqDocId,
            originalName: originalName,
          },
        })
        // reload document after update
        document = await prisma.document.findUniqueOrThrow({ where: { id: document.id } })
      }
    } else {
      // No deberían repetirse los nombres de archivo por el UUID
      document = await prisma.document.guardedCreate(
        {
          data: {
            userId: auth.user!.id,
            documentTypeId: params.reqDocId,
            hash,
            originalName: originalName,
            size: size,
            path: savePath,
          },
        },
        [checkUnique(['path'])]
      )
    }

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

    // Fetch attachment to know documentId before deleting
    const attachment = await prisma.documentAttachment.findUniqueOrThrow({
      where: { id: params.attachmentId },
      select: { id: true, documentId: true },
    })

    await prisma.documentAttachment.guardedDelete({
      where: {
        id: params.attachmentId,
      },
    })

    // If the document has no more attachments, schedule it for deletion (grace period)
    const remaining = await prisma.documentAttachment.count({
      where: { documentId: attachment.documentId },
    })
    if (remaining === 0) {
      const TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
      await prisma.document.update({
        where: { id: attachment.documentId },
        data: { scheduledForDeletion: new Date(Date.now() + TTL_MS) },
      })
    }

    response.noContent()
  }

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

  // List drafts for the current user
  async listUser({ auth }: HttpContext) {
    const drafts = await prisma.draft.findMany({
      where: { userId: auth.user!.id },
      include: {
        offer: {
          select: {
            id: true,
            position: true,
            company: { select: { id: true, name: true } },
          },
        },
        attachments: { select: { id: true } },
      },
    })

    return {
      data: drafts.map((d) => ({
        offer: d.offer,
        attachmentsCount: d.attachments.length,
      })),
    }
  }

  async submit({ request, auth }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)

    // Primero obtener los documentos requeridos para la oferta (pueden ser 0)
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

    // Intentar obtener el draft del usuario — puede no existir.
    const draft = await prisma.draft.findUnique({
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

    // Si no hay draft y no se requieren documentos, crear la aplicación directamente.
    if (!draft && requiredDocs.length === 0) {
      const application = await prisma.application.guardedCreate(
        {
          data: {
            userId: auth.user!.id,
            offerId: params.offerId,
            // No hay draft ni attachments; conservar campo custom si aplica en futuros cambios.
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        [checkUnique(['userId', 'offerId']), checkFK(['userId', 'offerId'])]
      )

      // Enqueue notification and email jobs (mismo comportamiento que cuando hay draft)
      await CreateNotifications.dispatch({
        users: [auth.user!.id],
        title: 'Application submitted',
        message: `Your application for offer ${params.offerId} was submitted.`,
        tag: 'APPLICATION_SUBMITTED',
      })

      const companyAdmins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      })
      if (companyAdmins.length > 0) {
        await CreateNotifications.dispatch({
          users: companyAdmins.map((u) => u.id),
          title: 'New application',
          message: `A new application was submitted for offer ${params.offerId}.`,
          tag: 'APPLICATION_SUBMITTED',
        }).catch(console.error)
      }

      return {
        data: {
          applicationId: application.id,
          status: application.status,
          appliedAt: application.createdAt,
        },
      }
    }

    // Si no existe el draft y sí hay requisitos, devolver 404 (igual comportamiento anterior).
    if (!draft) {
      throw apiErrors.notFound('Draft', params.offerId)
    }

    // Validar que el draft está completo (documentos requeridos)
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

    // Enqueue notification and email jobs
    // Notify applicant (user)

    await CreateNotifications.dispatch({
      users: [auth.user!.id],
      title: 'Application submitted',
      message: `Your application for offer ${params.offerId} was submitted.`,
      tag: 'APPLICATION_SUBMITTED',
    })

    // Notify company admins — for now create a notification for all company users with role ADMIN
    const companyAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })
    if (companyAdmins.length > 0) {
      await CreateNotifications.dispatch({
        users: companyAdmins.map((u) => u.id),
        title: 'New application',
        message: `A new application was submitted for offer ${params.offerId}.`,
        tag: 'APPLICATION_SUBMITTED',
      }).catch(console.error)
    }

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

  // Upsert draft but DO NOT create attachments here. Attachments are created separately to avoid duplicate/create-on-update issues.
  let draft = await prisma.draft.upsert({
    where: {
      userId_offerId: {
        userId: document.userId,
        offerId: offerId,
      },
    },
    include: {
      attachments: {
        select: {
          id: true,
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
    },
    update: {},
  })

  // Create the DocumentAttachment only if it does not exist yet for this draft.
  const hasAttachmentForDocument = draft.attachments.some((att) => att.document.id === document.id)
  if (!hasAttachmentForDocument) {
    try {
      await prisma.documentAttachment.guardedCreate(
        {
          data: {
            documentId: document.id,
            draftId: draft.id,
          },
        },
        [checkUnique([['documentId', 'draftId']])]
      )
    } catch (err) {
      // If another request created the attachment concurrently we'll get an already-exists error — ignore it.
      // Any other error should bubble up.
    }

    // Reload attachments to include the newly created one
    draft = (await prisma.draft.findUnique({
      where: { id: draft.id },
      include: {
        attachments: {
          select: {
            id: true,
            document: {
              select: {
                id: true,
                documentTypeId: true,
              },
            },
          },
        },
      },
    })) as any
  }

  // Ensure the document is linked to the draft and unlink others of the same type
  const linkedDocsOfSameType = draft.attachments.filter(
    (att) => att.document.documentTypeId === document.documentTypeId
  )
  const isLinked = linkedDocsOfSameType.some((att) => att.document.id === document.id)
  const otherLinkedDocsOfSameType = linkedDocsOfSameType.filter(
    (att) => att.document.id !== document.id
  )

  if (!isLinked) throw apiErrors.internalError('Document was not linked to draft')

  if (otherLinkedDocsOfSameType.length > 0) {
    // Eliminar attachments antiguos del mismo tipo sin detener el flujo.
    await prisma.documentAttachment.deleteMany({
      where: {
        draftId: draft.id,
        documentId: {
          in: otherLinkedDocsOfSameType.map((att) => att.document.id),
        },
      },
    })
  }

  // If the document was previously scheduled for deletion (orphan), clear it because
  // it's now in use again and update lastUsedAt.
  const doc = await prisma.document.findUnique({
    where: { id: document.id },
    select: { id: true, scheduledForDeletion: true },
  })
  if (doc && doc.scheduledForDeletion) {
    await prisma.document.update({
      where: { id: document.id },
      data: { scheduledForDeletion: null, lastUsedAt: new Date() },
    })
  }

  // Considerar marcar documentos sin usar para borrado automático desde jobs/cleanup.
}
