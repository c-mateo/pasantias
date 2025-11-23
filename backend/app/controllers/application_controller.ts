import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class ApplicationController {
  
  async list({}: HttpContext) {
  }

  // Drafts
  async getDraft({ request, auth }: HttpContext) {
    const offerId = request.param('id')
    const draft = await prisma.applicationDraft.findUnique({
      where: { userId_offerId: { userId: auth.user!.id, offerId: offerId } }
    })
    // TODO: Revisar
    return draft
  }
}