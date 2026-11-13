import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env';

let transport: Transporter | null = null;

function getTransport(): Transporter {
  if (transport) return transport;
  transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transport;
}

export type MailMessage = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type MailResult = {
  messageId: string;
  accepted: string[];
  rejected: string[];
};

export const mailer = {
  async send(msg: MailMessage): Promise<MailResult> {
    const info = await getTransport().sendMail({
      from: env.MAIL_FROM,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    });
    return {
      messageId: info.messageId,
      accepted: (info.accepted ?? []).map(String),
      rejected: (info.rejected ?? []).map(String),
    };
  },
};