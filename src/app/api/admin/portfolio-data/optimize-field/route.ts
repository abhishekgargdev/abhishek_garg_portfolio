import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  askGeminiJson,
  getConfiguredAIKeyCount,
} from "@/lib/gemini";
import {
  FIELD_COPILOT_PROMPT_TEMPLATE,
  PORTFOLIO_COPILOT_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/portfolio-copilot";

export const runtime = "nodejs";

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
    const { fieldName, currentValue, instruction } = await request.json();

    if (!fieldName) {
      return NextResponse.json(
        { error: "FieldName is required" },
        { status: 400 },
      );
    }

    const compiledPrompt = FIELD_COPILOT_PROMPT_TEMPLATE(
      fieldName,
      currentValue,
      instruction,
    );

    const { data } = await askGeminiJson<{ suggestedValue: string | string[] }>({
      purpose: "portfolio-field-copilot",
      prompt: compiledPrompt,
      systemInstruction: PORTFOLIO_COPILOT_SYSTEM_INSTRUCTION,
      temperature: 0.4,
      metadata: { source: "admin-field-copilot", fieldName },
    });

    return NextResponse.json({ suggestedValue: data.suggestedValue });
  } catch (error) {
    console.error("[portfolio-data/optimize-field] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to optimize field",
      },
      { status: 502 },
    );
  }
}
