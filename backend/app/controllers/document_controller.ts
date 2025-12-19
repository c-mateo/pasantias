import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs/promises'
import { idValidator } from '#validators/common'

export default class DocumentController {
  async downloadDocument({ request, response }: HttpContext) {
    const { params } = await request.validateUsing(idValidator)
    const docId = params.id

    const document = await prisma.document.findUniqueOrThrow({
      where: { id: docId },
    })

    const path = document.path

    try {
      const info = await fs.stat(path)
      if (!info.isFile()) {
        return response.notFound({ error: 'File not found on server' })
      }
    } catch (err) {
      return response.notFound({ error: 'File not found on server' })
    }

    // Update lastUsedAt
    await prisma.document.update({
      where: { id: docId },
      data: { lastUsedAt: new Date() },
    })

    // Send as attachment with original filename
    response.attachment(document.path, document.originalName)
  }
}
