import { sha256 } from '#utils/hash'
import mailer from '#services/mailer'

export default class SendEmail {
  // job key used by queue systems / dispatchers
  public static key = 'SendEmail'

  public async handle(payload: { to: string; subject: string; html?: string; text?: string }) {
    // payload should contain the destination and message
    const { to, subject, html, text } = payload

    // for auditability you may compute a message id
    const messageId = sha256(`${to}-${Date.now()}-${subject}`)

    try {
      await mailer.sendMail({ to, subject, html, text })
      return { ok: true, messageId }
    } catch (err) {
      console.error('SendEmail job failed', err)
      throw err
    }
  }
}
