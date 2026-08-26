import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/linkedin";
import { requireAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[api/admin/linkedin/connect] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to initiate LinkedIn OAuth." },
      { status: 500 },
    );
  }
}
