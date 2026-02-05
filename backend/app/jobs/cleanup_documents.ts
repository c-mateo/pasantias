import { Job } from 'adonisjs-jobs'
import { prisma } from '#start/prisma'
import fs from 'node:fs/promises'

export default class CleanupDocuments extends Job {
  public static get schedule() {
    // No automatic cron here; enqueue from scheduler or run manually
    return null
  }

  public async handle() {
    const now = new Date()
    const candidates = await prisma.document.findMany({
      where: {
        scheduledForDeletion: { lte: now },
      },
    })

    for (const d of candidates) {
      try {
        const attachments = await prisma.documentAttachment.count({ where: { documentId: d.id } })
        if (attachments > 0) {
          // Document reused concurrently; clear the scheduledForDeletion
          await prisma.document.update({
            where: { id: d.id },
            data: { scheduledForDeletion: null },
          })
          continue
        }

        // Soft-hide first
        const hideAt = new Date()
        await prisma.document.update({ where: { id: d.id }, data: { hiddenAt: hideAt } })

        // Attempt to delete file from disk
        try {
          if (d.path) {
            await fs.rm(d.path)
          }
        } catch (fsErr) {
          // If file deletion fails, clear hiddenAt so record remains visible for investigation
          await prisma.document.update({ where: { id: d.id }, data: { hiddenAt: null } })
          console.error('Failed to remove file for document', d.id, fsErr)
          continue
        }

        // Finally, remove DB record
        await prisma.document.delete({ where: { id: d.id } })
        console.log('Deleted orphan document', d.id)
      } catch (err) {
        console.error('Error processing candidate document', d.id, err)
      }
    }
  }
}
