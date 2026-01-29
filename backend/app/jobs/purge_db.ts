import { Job } from 'adonisjs-jobs'
import path from 'node:path'
import fs from 'node:fs/promises'
import { prisma } from '#start/prisma'

type Payload = {
  notificationsOlderThanDays?: number // default: 365
  deleteExpiredTokens?: boolean // default: true
  deleteUsedTokensOlderThanDays?: number // default: 30
  deleteRejectedApplicationsOlderThanDays?: number // default: 30
  deleteUnusedDocumentsOlderThanDays?: number // default: 30
  processScheduledDocuments?: boolean // default: true
}

export default class PurgeDatabase extends Job {
  static get queue() {
    return 'maintenance'
  }

  async handle(payload: Payload) {
    const now = new Date()

    const notificationsDays = payload.notificationsOlderThanDays ?? 365
    const deleteExpiredTokens = payload.deleteExpiredTokens ?? true
    const usedTokensDays = payload.deleteUsedTokensOlderThanDays ?? 30
    const rejectedAppsDays = payload.deleteRejectedApplicationsOlderThanDays ?? 30
    const unusedDocsDays = payload.deleteUnusedDocumentsOlderThanDays ?? 30
    const processScheduled = payload.processScheduledDocuments ?? true

    // 1) Delete old notifications
    try {
      const cutoff = new Date(now.getTime() - notificationsDays * 24 * 60 * 60 * 1000)
      const del = await prisma.notification.deleteMany({ where: { createdAt: { lt: cutoff } } })
      this.logger.info(`Purged ${del.count} notifications older than ${notificationsDays} days`)
    } catch (err) {
      this.logger.error('Failed to purge notifications', err)
    }

    // 2) Delete expired tokens and old used tokens
    try {
      if (deleteExpiredTokens) {
        const expired = await prisma.userToken.deleteMany({
          where: { expiresAt: { lt: now } },
        })
        this.logger.info(`Deleted ${expired.count} expired tokens`)
      }

      // Optionally delete tokens that were used some time ago to keep db small
      const usedCutoff = new Date(now.getTime() - usedTokensDays * 24 * 60 * 60 * 1000)
      const usedDeleted = await prisma.userToken.deleteMany({
        where: { usedAt: { lt: usedCutoff } },
      })
      this.logger.info(`Deleted ${usedDeleted.count} used tokens older than ${usedTokensDays} days`)
    } catch (err) {
      this.logger.error('Failed to purge tokens', err)
    }

    // 3) Delete rejected applications older than grace period
    try {
      const appCutoff = new Date(now.getTime() - rejectedAppsDays * 24 * 60 * 60 * 1000)
      const result = await prisma.application.deleteMany({
        where: { status: 'REJECTED', finalizedAt: { lt: appCutoff } },
      })
      this.logger.info(
        `Deleted ${result.count} rejected applications older than ${rejectedAppsDays} days`
      )

      // After deleting applications, remove orphaned documents (no attachments) older than unusedDocsDays
      await this.purgeOrphanedDocuments(unusedDocsDays)
    } catch (err) {
      this.logger.error('Failed to purge applications', err)
    }

    // 4) Purge documents scheduled for deletion
    try {
      if (processScheduled) {
        const docs = await prisma.document.findMany({
          where: { scheduledForDeletion: { lte: now } },
        })
        let deleted = 0
        for (const doc of docs) {
          const attachments = await prisma.documentAttachment.findMany({
            where: { documentId: doc.id },
          })
          if (attachments.length === 0) {
            const ok = await this.deleteDocumentFileAndRow(doc)
            if (ok) deleted++
          } else {
            this.logger.info(`Skipping scheduled document ${doc.id} because it has attachments`)
          }
        }
        this.logger.info(`Processed ${docs.length} scheduled documents, deleted ${deleted}`)
      }
    } catch (err) {
      this.logger.error('Failed to process scheduled documents', err)
    }

    // 5) Delete unused orphan documents older than threshold
    try {
      await this.purgeOrphanedDocuments(unusedDocsDays)
    } catch (err) {
      this.logger.error('Failed to purge orphaned documents', err)
    }

    // 6) Optionally more cleanup: drafts expired, old notifications already handled
    try {
      // Delete draft records that have expired (or never updated recently)
      const draftCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const draftsDeleted = await prisma.draft.deleteMany({
        where: { OR: [{ expiresAt: { lt: now } }, { updatedAt: { lt: draftCutoff } }] },
      })
      this.logger.info(`Deleted ${draftsDeleted.count} expired/old drafts`)
    } catch (err) {
      this.logger.error('Failed to purge drafts', err)
    }

    this.logger.info('Purge job completed')
  }

  private async purgeOrphanedDocuments(unusedDocsDays: number) {
    const now = new Date()
    const cutoff = new Date(now.getTime() - unusedDocsDays * 24 * 60 * 60 * 1000)

    const docs = await prisma.document.findMany({
      where: { lastUsedAt: { lt: cutoff } },
    })
    let deleted = 0
    for (const doc of docs) {
      const attachments = await prisma.documentAttachment.findMany({
        where: { documentId: doc.id },
      })
      if (attachments.length === 0) {
        const ok = await this.deleteDocumentFileAndRow(doc)
        if (ok) deleted++
      }
    }

    this.logger.info(`Deleted ${deleted} orphaned documents older than ${unusedDocsDays} days`)
  }

  private async deleteDocumentFileAndRow(doc: { id: number; path: string }) {
    const relative = doc.path.replace(/^\/+/, '')
    const fullPath = path.join(process.cwd(), relative)
    try {
      await fs.stat(fullPath)
      await fs.unlink(fullPath)
      this.logger.info(`Removed file ${fullPath}`)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.logger.warn(`File not found for document ${doc.id}: ${fullPath}, deleting DB row`)
      } else {
        this.logger.error(`Failed to remove file for document ${doc.id}: ${err.message}`)
        return false
      }
    }

    try {
      await prisma.document.delete({ where: { id: doc.id } })
      this.logger.info(`Deleted document row ${doc.id}`)
      return true
    } catch (err) {
      this.logger.error(`Failed to delete document row ${doc.id}`, err)
      return false
    }
  }
}
