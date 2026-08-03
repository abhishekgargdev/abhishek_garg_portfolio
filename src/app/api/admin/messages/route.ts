import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const docs = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      items: docs.map((doc) => ({
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        subject: doc.subject,
        message: doc.message,
        isRead: doc.isRead,
        createdAt: new Date(doc.createdAt).toISOString(),
      })),
    });
  } catch (error) {
    console.error("[admin/messages] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 },
    );
  }
}
