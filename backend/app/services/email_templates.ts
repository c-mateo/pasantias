export type AuthWelcomeData = {
  name: string
  verifyUrl?: string
}

export type AuthChangeEmailData = {
  name: string
  newEmail: string
  confirmUrl: string
}

export type AuthResetPasswordData = {
  name: string
  expiresInMinutes: number
  resetUrl: string
}

export type AuthPasswordChangedData = {
  name: string
}

export type AuthChangeEmailRequestedData = {
  name: string
  newEmail: string
}

export type AuthEmailUpdatedData = {
  name: string
  email: string
}

export type AuthEmailUpdateNotificationData = {
  name: string
  oldEmail: string
}

export type EmailTemplateDataMap = {
  auth_welcome: AuthWelcomeData
  auth_change_email: AuthChangeEmailData
  auth_reset_password: AuthResetPasswordData
  auth_password_changed: AuthPasswordChangedData
  auth_change_email_requested: AuthChangeEmailRequestedData
  auth_email_updated: AuthEmailUpdatedData
  auth_email_update_notification: AuthEmailUpdateNotificationData
}

export type EmailTemplateName = keyof EmailTemplateDataMap

type EmailTemplate<T> = {
  subject: (data: T) => string
  htmlView: string
  textView: string
}

export const EmailTemplates: { [K in EmailTemplateName]: EmailTemplate<EmailTemplateDataMap[K]> } = {
  auth_welcome: {
    subject: (data) => `¡Bienvenido, ${data.name}!`,
    htmlView: 'emails/auth/welcome_html',
    textView: 'emails/auth/welcome_text',
  },
  auth_change_email: {
    subject: () => 'Confirmá tu nuevo correo',
    htmlView: 'emails/auth/change_email_html',
    textView: 'emails/auth/change_email_text',
  },
  auth_reset_password: {
    subject: () => 'Restablecer contraseña',
    htmlView: 'emails/auth/reset_password_html',
    textView: 'emails/auth/reset_password_text',
  },
  auth_password_changed: {
    subject: () => 'Tu contraseña ha sido cambiada',
    htmlView: 'emails/auth/password_changed_html',
    textView: 'emails/auth/password_changed_text',
  },
  auth_change_email_requested: {
    subject: () => 'Solicitud de cambio de correo electrónico',
    htmlView: 'emails/auth/change_email_requested_html',
    textView: 'emails/auth/change_email_requested_text',
  },
  auth_email_updated: {
    subject: () => 'Correo actualizado',
    htmlView: 'emails/auth/email_updated_html',
    textView: 'emails/auth/email_updated_text',
  },
  auth_email_update_notification: {
    subject: () => 'Correo actualizado',
    htmlView: 'emails/auth/email_update_notification_html',
    textView: 'emails/auth/email_update_notification_text',
  },
}
