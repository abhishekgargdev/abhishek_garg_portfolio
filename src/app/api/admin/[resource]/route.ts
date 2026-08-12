import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  getAdminModel,
  isAdminResource,
  serializeAdminDoc,
} from "@/lib/admin-resources";
import { connectDB } from "@/lib/db";
import { syncOnCreate, reconcileDatabase } from "@/lib/sync";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ resource: string }>;
};

function sortForResource(resource: string): Record<string, 1 | -1> {
  if (resource === "education") return { year: -1 };
  if (resource === "about") return { updatedAt: -1 };
  return { order: 1, createdAt: -1 };
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { resource } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  try {
    await connectDB();
    if (["timeline", "experience", "education", "certifications", "achievements"].includes(resource)) {
      reconcileDatabase().catch((err) =>
        console.error("[Sync] Background reconcileDatabase failed:", err)
      );
    }
    const Model = getAdminModel(resource);
    const docs = await Model.find().sort(sortForResource(resource)).lean();
    return NextResponse.json({
      items: docs.map((doc) =>
        serializeAdminDoc(doc as Record<string, unknown>),
      ),
    });
  } catch (error) {
    console.error(`[admin/${resource}] GET failed:`, error);
    return NextResponse.json(
      { error: "Failed to load records" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { resource } = await context.params;
  if (!isAdminResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  try {
    const body = await request.json();
    await connectDB();
    const Model = getAdminModel(resource);

    if (resource === "about") {
      const existing = await Model.countDocuments();
      if (existing > 0) {
        return NextResponse.json(
          { error: "About profile already exists. Edit the existing record." },
          { status: 400 },
        );
      }
    }

    if (resource === "projects" && body.slug) {
      const exists = await Model.findOne({ slug: body.slug }).lean();
      if (exists) {
        return NextResponse.json(
          { error: "Slug is already taken by another project" },
          { status: 409 },
        );
      }
    }

    const created = await Model.create(body);
    await syncOnCreate(resource, created);
    return NextResponse.json(
      { item: serializeAdminDoc(created.toObject()) },
      { status: 201 },
    );
  } catch (error) {
    console.error(`[admin/${resource}] POST failed:`, error);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 },
    );
  }
}
