import nodemailer from "nodemailer";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Set it in your environment.`);
  }
  return value;
}

let transporter: nodemailer.Transporter | null = null;

export function getMailer() {
  if (!transporter) {
    const port = Number(requireEnv("SMTP_PORT"));

    transporter = nodemailer.createTransport({
      host: requireEnv("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: {
        user: requireEnv("SMTP_USER"),
        pass: requireEnv("SMTP_PASS"),
      },
    });
  }

  return transporter;
}

export function getMailFromAddress(): string {
  return requireEnv("SMTP_USER");
}

export function getContactReceiverEmail(): string {
  return requireEnv("CONTACT_RECEIVER_EMAIL");
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const mailer = getMailer();
  const from = getMailFromAddress();

  return mailer.sendMail({
    from: `"Portfolio Contact" <${from}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  });
}
