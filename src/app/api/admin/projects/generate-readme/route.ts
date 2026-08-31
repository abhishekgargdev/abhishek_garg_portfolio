import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  askGemini,
  getConfiguredAIKeyCount,
} from "@/lib/gemini";
import {
  PROJECT_README_PROMPT_TEMPLATE,
  PROJECT_README_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/project-readme";

export const runtime = "nodejs";

function unwrapMarkdown(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  if (getConfiguredAIKeyCount() === 0) {
    return NextResponse.json(
      {
        error:
          "No AI API keys configured. Add GEMINI_API_KEY_1..6 or NVIDIA_API_KEY in .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const project = body?.project;
    if (!project || typeof project !== "object") {
      return NextResponse.json(
        { error: "Project data is required" },
        { status: 400 },
      );
    }

    const { text } = await askGemini({
      purpose: "project-readme",
      prompt: PROJECT_README_PROMPT_TEMPLATE(project),
      systemInstruction: PROJECT_README_SYSTEM_INSTRUCTION,
      temperature: 0.35,
      maxOutputTokens: 4096,
      metadata: { source: "admin-project-readme", title: project.title },
    });

    return NextResponse.json({ readmeMd: unwrapMarkdown(text) });
  } catch (error) {
    console.error("[projects/generate-readme] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate README",
      },
      { status: 502 },
    );
  }
}
