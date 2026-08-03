import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeTemplate } from "@/components/resume/ResumeTemplate";
import { getResumeData, resumeFilename } from "@/lib/resume-data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getResumeData();
    const buffer = await renderToBuffer(<ResumeTemplate data={data} />);
    const filename = resumeFilename(data.about.name);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[resume/download] Failed:", error);
    return NextResponse.json(
      { error: "Unable to download resume right now." },
      { status: 500 },
    );
  }
}
