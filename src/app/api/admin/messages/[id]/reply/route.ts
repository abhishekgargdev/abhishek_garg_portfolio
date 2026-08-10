import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { sendMail } from "@/lib/mailer";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReplyEmailHtml(data: {
  originalName: string;
  originalMessage: string;
  formattedDate: string;
  replyText: string;
}): string {
  const originalName = escapeHtml(data.originalName);
  const originalMessage = escapeHtml(data.originalMessage).replaceAll("\n", "<br />");
  const replyText = escapeHtml(data.replyText).replaceAll("\n", "<br />");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Response from Abhishek Garg</title>
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
                  <p style="margin: 0 0 16px 0;">Hi ${originalName},</p>
                  <p style="margin: 0 0 24px 0; color: #0f172a;">${replyText}</p>
                  
                  <!-- Divider -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                    <tr>
                      <td height="1" style="background-color: #e2e8f0; font-size: 0px; line-height: 0px;">&nbsp;</td>
                    </tr>
                  </table>
                  
                  <!-- Original Message Quote -->
                  <div style="padding: 14px 18px; border-left: 4px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; font-size: 13.5px; color: #475569; line-height: 1.55;">
                    <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em;">Your message on ${data.formattedDate}:</p>
                    <p style="margin: 0; font-style: italic;">"${originalMessage}"</p>
                  </div>

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
                    Sent via portfolio response from <a href="https://abhishekgarg.dev" style="color: #0d9488; text-decoration: none; font-weight: 500;">abhishekgarg.dev</a>.
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

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      message?: string;
    };

    const replyText = body.message?.trim();
    if (!replyText) {
      return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
    }

    await connectDB();
    const doc = await ContactMessage.findById(id);
    if (!doc) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const formattedDate = new Date(doc.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });

    // Send email reply
    await sendMail({
      to: doc.email,
      subject: `Re: ${doc.subject}`,
      html: buildReplyEmailHtml({
        originalName: doc.name,
        originalMessage: doc.message,
        formattedDate,
        replyText,
      }),
    });

    // Update database record
    doc.replyMessage = replyText;
    doc.repliedAt = new Date();
    doc.isRead = true; // Automatically mark as read if we replied
    await doc.save();

    return NextResponse.json({
      item: {
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        subject: doc.subject,
        message: doc.message,
        isRead: doc.isRead,
        replyMessage: doc.replyMessage,
        repliedAt: doc.repliedAt.toISOString(),
        createdAt: new Date(doc.createdAt).toISOString(),
      },
    });
  } catch (error) {
    console.error(`[admin/messages/${id}/reply] POST failed:`, error);
    return NextResponse.json(
      { error: "Failed to send email reply" },
      { status: 500 },
    );
  }
}
