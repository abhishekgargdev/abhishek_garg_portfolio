import { NextResponse } from "next/server";
import { getAboutMe } from "@/lib/about";

export const runtime = "nodejs";

export async function GET() {
  try {
    const about = await getAboutMe();

    if (!about?.resumeFileUrl) {
      return NextResponse.json(
        { error: "Resume is not available yet." },
        { status: 404 },
      );
    }

    // Redirect to the stored Cloudinary (or other) URL for download/view.
    return NextResponse.redirect(about.resumeFileUrl, 302);
  } catch (error) {
    console.error("[resume/download] Failed:", error);
    return NextResponse.json(
      { error: "Unable to download resume right now." },
      { status: 500 },
    );
  }
}
