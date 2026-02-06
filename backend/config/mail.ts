import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: env.get('MAILER_DRIVER', 'smtp'),

  /**
   * The mailers object can be used to configure multiple mailers
   * each using a different transport or same transport with different
   * options.
   */
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST') ?? '',
      port: env.get('SMTP_PORT'),
      /**
       * Uncomment the auth block if your SMTP
       * server needs authentication
       */
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME') ?? '',
        pass: env.get('SMTP_PASSWORD') ?? '',
      },
    }),
    mailgun: transports.mailgun({
      baseUrl: 'https://api.mailgun.net/v3',
      key: env.get('MAILGUN_API_KEY') ?? '',
      domain: env.get('MAILGUN_DOMAIN') ?? '',

      /**
       * The following options can be overridden at
       * runtime when calling the `mail.send` method.
       */
      oDkim: true,
      oTags: ['transactional', 'adonisjs_app'],
      oDeliverytime: new Date(2024, 8, 18),
      oTestMode: false,
      oTracking: false,
      oTrackingClick: false,
      oTrackingOpens: false,
      headers: {
        // h:prefixed headers
      },
      variables: {
        appId: '',
        userId: '',
        // v:prefixed variables
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
