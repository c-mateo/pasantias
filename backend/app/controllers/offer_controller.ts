import { prisma } from '#start/prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class OffersController {
  async list({}: HttpContext) {
    // TODO: Add pagination, filtering, etc.
    const offers = await prisma.offer.findMany({
      where: {
        status: 'ACTIVE',
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        customFieldsSchema: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        // TODO: Revisar
        skills: true,
      },
    })
    return {
      data: offers,
    }
  }

  async get({ request, response }: HttpContext) {
    const offerId = request.param('id')
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      omit: {
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        customFieldsSchema: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            website: true,
          },
        },
        skills: true,
      },
    })
    if (!offer) {
      response.notFound({ error: 'Offer not found' })
    }
    return {
      data: offer,
    }
  }
}
