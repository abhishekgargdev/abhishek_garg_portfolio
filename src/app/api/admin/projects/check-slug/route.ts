import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import Project from "@/models/Project";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const id = url.searchParams.get("id");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    await connectDB();
    const query: Record<string, unknown> = { slug };
    if (id) {
      query._id = { $ne: id };
    }
    const exists = await Project.findOne(query).lean();
    return NextResponse.json({ unique: !exists });
  } catch (error) {
    console.error("[projects/check-slug] GET failed:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
