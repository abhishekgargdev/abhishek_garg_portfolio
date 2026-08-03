import { NextResponse } from "next/server";
import { getCloudinary, getCloudinaryPublicConfig } from "@/lib/cloudinary";
import {
  isUploadSection,
  portfolioFolder,
  type UploadSection,
} from "@/lib/upload-sections";

export const runtime = "nodejs";

type SignUploadBody = {
  section?: string;
  folder?: string;
};

function resolveSection(body: SignUploadBody): UploadSection | null {
  if (body.section && isUploadSection(body.section)) {
    return body.section;
  }

  if (body.folder?.startsWith("portfolio/")) {
    const section = body.folder.slice("portfolio/".length);
    if (isUploadSection(section)) return section;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SignUploadBody;
    const section = resolveSection(body);

    if (!section) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing section. Use one of the allowed portfolio sections.",
        },
        { status: 400 },
      );
    }

    const folder = portfolioFolder(section);
    const timestamp = Math.round(Date.now() / 1000);
    const cloudinary = getCloudinary();
    const { cloudName, apiKey } = getCloudinaryPublicConfig();

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!.trim(),
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    });
  } catch (error) {
    console.error("[upload] Failed to sign Cloudinary upload:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature." },
      { status: 500 },
    );
  }
}
