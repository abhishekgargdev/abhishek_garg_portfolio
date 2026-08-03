import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  getAdminModel,
  isAdminResource,
  serializeAdminDoc,
} from "@/lib/admin-resources";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ resource: string; id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return updateRecord(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return updateRecord(request, context);
}

async function updateRecord(request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { resource, id } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    await connectDB();
    const Model = getAdminModel(resource);

    const updated = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      item: serializeAdminDoc(updated as Record<string, unknown>),
    });
  } catch (error) {
    console.error(`[admin/${resource}/${id}] update failed:`, error);
    return NextResponse.json(
      { error: "Failed to update record" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { resource, id } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await connectDB();
    const Model = getAdminModel(resource);
    const deleted = await Model.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(`[admin/${resource}/${id}] DELETE failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 },
    );
  }
}
