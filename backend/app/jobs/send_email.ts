// import mailer from '#services/mailer'
import mail from '@adonisjs/mail/services/main'
import { Job } from 'adonisjs-jobs'

type SendEmailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

export default class SendEmail extends Job {
  async handle({ to, subject, text, html }: SendEmailPayload) {
    this.logger.info('SendEmail job handled')

    await mail.send((message) => {
      message.to(to).subject(subject).text(text)
      if (html) message.html(html)
    })
  }
}
