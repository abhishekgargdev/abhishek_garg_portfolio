import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/contact-schema";
import { connectDB } from "@/lib/db";
import {
  getContactReceiverEmail,
  sendMail,
} from "@/lib/mailer";
import ContactMessage from "@/models/ContactMessage";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReceiverEmailHtml(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message).replaceAll("\n", "<br />");

  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#18181b;line-height:1.5;">
      <h1 style="font-size:20px;margin:0 0 16px;">New portfolio message</h1>
      <p style="margin:0 0 20px;color:#52525b;">Someone reached out through your contact form.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;color:#71717a;width:96px;vertical-align:top;">Name</td>
          <td style="padding:8px 0;font-weight:600;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#71717a;vertical-align:top;">Email</td>
          <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#0f766e;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#71717a;vertical-align:top;">Subject</td>
          <td style="padding:8px 0;">${subject}</td>
        </tr>
      </table>
      <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f4f4f5;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">Message</p>
        <p style="margin:0;white-space:pre-wrap;">${message}</p>
      </div>
    </div>
  `;
}

function buildAckEmailHtml(data: { name: string; subject: string }): string {
  const name = escapeHtml(data.name);
  const subject = escapeHtml(data.subject);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thanks for reaching out - Abhishek Garg</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #18181b;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 40px 10px;">
        <tr>
          <td align="center">
            <!-- Main Card Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
              <!-- Top Accent Bar -->
              <tr>
                <td height="4" style="background: linear-gradient(90deg, #0d9488, #0284c7);"></td>
              </tr>
              <!-- Header Area -->
              <tr>
                <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f4f4f5;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <!-- Logo Initials -->
                      <td width="48" style="vertical-align: middle;">
                        <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #0d9488, #0284c7); border-radius: 12px; display: inline-block; text-align: center; line-height: 44px; color: #ffffff; font-weight: 700; font-size: 18px; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);">
                          AG
                        </div>
                      </td>
                      <!-- Sender Name & Title -->
                      <td style="padding-left: 14px; vertical-align: middle; text-align: left;">
                        <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2;">Abhishek Garg</div>
                        <div style="font-size: 12px; font-weight: 500; color: #64748b; margin: 2px 0 0 0; line-height: 1.2;">Senior Full Stack Engineer</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Body Content -->
              <tr>
                <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; text-align: left;">
                  <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; font-family: 'Segoe UI', system-ui, sans-serif;">Message Received</h2>
                  <p style="margin: 0 0 16px 0;">Hi <strong>${name}</strong>,</p>
                  <p style="margin: 0 0 16px 0;">
                    Thank you for reaching out! I have received your message regarding <strong>"${subject}"</strong>.
                  </p>
                  <p style="margin: 0 0 24px 0;">
                    I appreciate your interest in connecting and will review your inquiry shortly. You can expect a response from me within the next 24-48 hours.
                  </p>
                  
                  <!-- Divider -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                    <tr>
                      <td height="1" style="background-color: #e2e8f0; font-size: 0px; line-height: 0px;">&nbsp;</td>
                    </tr>
                  </table>
                  
                  <!-- Signature -->
                  <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Best Regards,</p>
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="font-size: 16px; font-weight: 700; color: #0f172a;">Abhishek Garg</div>
                        <div style="font-size: 13px; color: #0d9488; font-weight: 500; margin-top: 2px;">Senior Full Stack Engineer</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 6px; line-height: 1.4;">
                          Email: <a href="mailto:abhishekgarg2063@gmail.com" style="color: #0284c7; text-decoration: none;">abhishekgarg2063@gmail.com</a><br>
                          Web: <a href="https://abhishekgarg.dev" style="color: #0284c7; text-decoration: none;">abhishekgarg.dev</a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    This is an automated receipt confirming your submission on <a href="https://abhishekgarg.dev" style="color: #0d9488; text-decoration: none; font-weight: 500;">abhishekgarg.dev</a>.<br>
                    &copy; 2026 Abhishek Garg. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid form data",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    const recentCount = await ContactMessage.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
    });

    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        {
          error:
            "Too many messages from this email. Please try again in a few minutes.",
        },
        { status: 429 },
      );
    }

    await ContactMessage.create({
      name,
      email: normalizedEmail,
      subject,
      message,
    });

    const receiver = getContactReceiverEmail();

    await Promise.all([
      sendMail({
        to: receiver,
        subject: `Portfolio contact: ${subject}`,
        html: buildReceiverEmailHtml({
          name,
          email: normalizedEmail,
          subject,
          message,
        }),
        replyTo: normalizedEmail,
      }),
      sendMail({
        to: normalizedEmail,
        subject: "Thanks for your message",
        html: buildAckEmailHtml({ name, subject }),
      }),
    ]);

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[contact] Failed to process message:", error);
    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again." },
      { status: 500 },
    );
  }
}
