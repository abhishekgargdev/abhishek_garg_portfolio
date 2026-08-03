import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();
    const count = await Admin.countDocuments();

    return NextResponse.json({ configured: count > 0 });
  } catch (error) {
    console.error("[auth/setup/status] Failed to check admin status:", error);
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 },
    );
  }
}
