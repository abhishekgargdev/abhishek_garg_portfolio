import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/admin-auth";
import { getAdminModel, isAdminResource } from "@/lib/admin-resources";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ resource: string }>;
};

type ReorderBody = {
  updates?: { id?: string; order?: number }[];
};

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { resource } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as ReorderBody;
    const updates = body.updates ?? [];

    if (!updates.length) {
      return NextResponse.json(
        { error: "No reorder updates provided" },
        { status: 400 },
      );
    }

    for (const update of updates) {
      if (!update.id || !mongoose.Types.ObjectId.isValid(update.id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }
      if (typeof update.order !== "number" || Number.isNaN(update.order)) {
        return NextResponse.json({ error: "Invalid order" }, { status: 400 });
      }
    }

    await connectDB();
    const Model = getAdminModel(resource);

    await Promise.all(
      updates.map((update) =>
        Model.findByIdAndUpdate(update.id, { order: update.order }),
      ),
    );

    return NextResponse.json({ message: "Reordered" });
  } catch (error) {
    console.error(`[admin/${resource}/reorder] POST failed:`, error);
    return NextResponse.json(
      { error: "Failed to reorder records" },
      { status: 500 },
    );
  }
}
