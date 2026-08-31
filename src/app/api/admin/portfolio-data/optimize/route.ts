import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  askGeminiJson,
  askGeminiJsonChained,
  getConfiguredAIKeyCount,
} from "@/lib/gemini";
import {
  PORTFOLIO_COPILOT_PROMPT_TEMPLATE,
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
    const { prompt: userPrompt, currentData, useChain, chainSteps } = await request.json();

    if (!userPrompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const compiledPrompt = PORTFOLIO_COPILOT_PROMPT_TEMPLATE(userPrompt, currentData);

    const { data } = useChain
      ? await askGeminiJsonChained<any>({
          purpose: "portfolio-copilot",
          prompt: compiledPrompt,
          systemInstruction: PORTFOLIO_COPILOT_SYSTEM_INSTRUCTION,
          temperature: 0.4,
          chainSteps,
          metadata: { source: "admin-copilot" },
        })
      : await askGeminiJson<any>({
          purpose: "portfolio-copilot",
          prompt: compiledPrompt,
          systemInstruction: PORTFOLIO_COPILOT_SYSTEM_INSTRUCTION,
          temperature: 0.4,
          metadata: { source: "admin-copilot" },
        });

    return NextResponse.json({ suggestions: data });

  } catch (error) {
    console.error("[portfolio-data/optimize] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate suggestions",
      },
      { status: 502 },
    );
  }
}
