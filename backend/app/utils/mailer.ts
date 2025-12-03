import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  html?: string
  text?: string
}

let transporter: any

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user) {
    // fallback: use a noop transporter that logs instead of sending
    transporter = {
      sendMail: async (opts: any) => {
        console.log('[mailer] sendMail (noop) —', opts)
        return { accepted: [opts.to] }
      },
    }
    return transporter
  }

  transporter = nodemailer.createTransport({ host, port, auth: { user, pass } })
  return transporter
}

async function sendMail(opts: MailOptions) {
  const t = getTransporter()
  return t.sendMail({ from: process.env.SMTP_FROM || process.env.FROM_EMAIL || 'no-reply@example.com', to: opts.to, subject: opts.subject, html: opts.html, text: opts.text })
}

export default { sendMail }
export { sendMail }
