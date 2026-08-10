import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      isRead?: boolean;
    };

    await connectDB();
    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: body.isRead ?? true },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: String(updated._id),
        name: updated.name,
        email: updated.email,
        subject: updated.subject,
        message: updated.message,
        isRead: updated.isRead,
        replyMessage: updated.replyMessage || null,
        repliedAt: updated.repliedAt ? new Date(updated.repliedAt).toISOString() : null,
        createdAt: new Date(updated.createdAt).toISOString(),
      },
    });
  } catch (error) {
    console.error(`[admin/messages/${id}] PATCH failed:`, error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await connectDB();
    const deleted = await ContactMessage.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(`[admin/messages/${id}] DELETE failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
