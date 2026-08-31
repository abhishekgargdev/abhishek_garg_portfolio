import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  askGemini,
  askGeminiChained,
  getConfiguredGeminiKeyCount,
  getConfiguredAIKeyCount,
  getDefaultGeminiModel,
  getDefaultNvidiaModel,
  listAiInteractions,
} from "@/lib/gemini";

export const runtime = "nodejs";

const generateSchema = z.object({
  prompt: z.string().trim().min(1).max(20_000),
  purpose: z.string().trim().min(1).max(100).optional(),
  systemInstruction: z.string().trim().max(10_000).optional(),
  model: z.string().trim().min(1).max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().min(16).max(8192).optional(),
  persist: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  useChain: z.boolean().optional(),
  chainSteps: z.number().int().min(1).max(6).optional(),
  provider: z.enum(["gemini", "nvidia"]).optional(),
});

/** POST — send a prompt through the shared Gemini key pool. */
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
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { useChain, chainSteps, ...geminiOptions } = parsed.data;
    const result = useChain
      ? await askGeminiChained({ ...geminiOptions, chainSteps })
      : await askGemini(geminiOptions);

    return NextResponse.json({
      ...result,
      defaultModel: getDefaultGeminiModel(),
      defaultNvidiaModel: getDefaultNvidiaModel(),
      configuredKeys: getConfiguredAIKeyCount(),
    });
  } catch (error) {
    console.error("[api/ai/generate] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gemini request failed",
      },
      { status: 502 },
    );
  }
}

/** GET — recent AI interactions stored in MongoDB. */
export async function GET(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get("purpose") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? "20");

    const items = await listAiInteractions({
      purpose: purpose || undefined,
      limit: Number.isFinite(limit) ? limit : 20,
    });

    return NextResponse.json({
      items,
      configuredKeys: getConfiguredAIKeyCount(),
      defaultModel: getDefaultGeminiModel(),
      defaultNvidiaModel: getDefaultNvidiaModel(),
    });
  } catch (error) {
    console.error("[api/ai/generate] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load AI interactions" },
      { status: 500 },
    );
  }
}
