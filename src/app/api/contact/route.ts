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
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#18181b;line-height:1.5;">
      <h1 style="font-size:20px;margin:0 0 16px;">Thanks for reaching out</h1>
      <p style="margin:0 0 12px;">Hi ${name},</p>
      <p style="margin:0 0 12px;">
        I received your message about <strong>${subject}</strong> and will get back to you soon.
      </p>
      <p style="margin:0;color:#52525b;">— Portfolio contact</p>
    </div>
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
