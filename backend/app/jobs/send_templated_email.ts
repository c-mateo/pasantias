import Mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { EmailTemplates, type EmailTemplateName } from '#services/email_templates'
import { Job } from 'adonisjs-jobs'
import { apiErrors } from '#exceptions/my_exceptions'

import type { EmailTemplateDataMap } from '#services/email_templates'

type Payload = { to: string } & {
  [K in EmailTemplateName]: { template: K; data: EmailTemplateDataMap[K] }
}[EmailTemplateName]

export default class SendTemplatedEmail extends Job {
  // Queue name can be specified here if a dedicated queue is desired.

  // nombre común: handle
  async handle(payload: Payload) {
    const appName = env.get('APP_NAME')

    const send = async <K extends EmailTemplateName>(
      template: K,
      data: EmailTemplateDataMap[K]
    ) => {
      const t = EmailTemplates[template]
      await Mail.send((message) => {
        message
          .to(payload.to)
          .subject(t.subject(data))
          .htmlView(t.htmlView, { ...data, appName })
          .textView(t.textView, { ...data, appName })
      })
    }

    // Dynamic send: validate that the template exists in EmailTemplates
    const tplName = payload.template as EmailTemplateName
    if (!EmailTemplates[tplName]) {
      throw apiErrors.internalError('unknown-email-template-' + String(payload.template))
    }
    await send(tplName, payload.data as any)
  }
}
