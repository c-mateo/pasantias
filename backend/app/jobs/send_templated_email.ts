import Mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import { EmailTemplates, type EmailTemplateName } from '#services/email_templates'
import { Job } from 'adonisjs-jobs'

import type { EmailTemplateDataMap } from '#services/email_templates'

type Payload = { to: string } & {
  [K in EmailTemplateName]: { template: K; data: EmailTemplateDataMap[K] }
}[EmailTemplateName]

export default class SendTemplatedEmail extends Job {
  // static get queue() {
  //   return 'mail'
  // }

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

    // Narrow the union with a tiny switch; the heavy lifting lives in `send`
    switch (payload.template) {
      case 'auth_welcome':
        await send('auth_welcome', payload.data)
        break
      case 'auth_change_email':
        await send('auth_change_email', payload.data)
        break
      case 'auth_reset_password':
        await send('auth_reset_password', payload.data)
        break
      default:
        throw new Error('Unknown template')
    }
  }
}
