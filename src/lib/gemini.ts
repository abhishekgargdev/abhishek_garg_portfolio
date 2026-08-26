import { GoogleGenAI } from "@google/genai";
import { connectDB } from "@/lib/db";
import AiInteraction from "@/models/AiInteraction";

const KEY_ENV_NAMES = [
  "GEMINI_API_KEY_1",
  "GEMINI_API_KEY_2",
  "GEMINI_API_KEY_3",
  "GEMINI_API_KEY_4",
  "GEMINI_API_KEY_5",
  "GEMINI_API_KEY_6",
] as const;

const DEFAULT_MODEL = "gemini-flash-latest";
const MAX_ATTEMPTS_PER_CALL = 6;
/** Temporary cooldown after rate-limit / quota errors (ms). */
const KEY_COOLDOWN_MS = 60_000;

export type GeminiKeySlot = {
  slot: number;
  envName: (typeof KEY_ENV_NAMES)[number];
  apiKey: string;
};

export type AskGeminiOptions = {
  prompt: string;
  /** Feature tag stored with the interaction, e.g. "suggest-project-bullets". */
  purpose?: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Persist prompt/response to AiInteraction (default true). */
  persist?: boolean;
  metadata?: Record<string, unknown>;
};

export type AskGeminiResult = {
  text: string;
  model: string;
  keySlot: number;
  durationMs: number;
  interactionId?: string;
};

type KeyRuntimeState = {
  cooldownUntil: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __geminiKeyCursor: number | undefined;
  // eslint-disable-next-line no-var
  var __geminiKeyState: Map<number, KeyRuntimeState> | undefined;
}

function getCursor(): number {
  if (typeof globalThis.__geminiKeyCursor !== "number") {
    globalThis.__geminiKeyCursor = 0;
  }
  return globalThis.__geminiKeyCursor;
}

function setCursor(value: number) {
  globalThis.__geminiKeyCursor = value;
}

function getKeyState(): Map<number, KeyRuntimeState> {
  if (!globalThis.__geminiKeyState) {
    globalThis.__geminiKeyState = new Map();
  }
  return globalThis.__geminiKeyState;
}

/** Load configured Gemini keys from env (skips empty slots). */
export function getGeminiKeys(): GeminiKeySlot[] {
  const keys: GeminiKeySlot[] = [];

  for (let i = 0; i < KEY_ENV_NAMES.length; i += 1) {
    const envName = KEY_ENV_NAMES[i];
    const apiKey = process.env[envName]?.trim();
    if (!apiKey) continue;
    keys.push({ slot: i + 1, envName, apiKey });
  }

  return keys;
}

export function getConfiguredGeminiKeyCount(): number {
  return getGeminiKeys().length;
}

export function getDefaultGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function isRetryableKeyError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  const lower = message.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("rate") ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("too many requests") ||
    lower.includes("503") ||
    lower.includes("unavailable")
  );
}

function markKeyCooldown(slot: number) {
  getKeyState().set(slot, { cooldownUntil: Date.now() + KEY_COOLDOWN_MS });
}

function isKeyAvailable(slot: number): boolean {
  const state = getKeyState().get(slot);
  if (!state) return true;
  return Date.now() >= state.cooldownUntil;
}

/** Round-robin pick among non-cooling keys; falls back to any key if all cooling. */
function pickNextKey(keys: GeminiKeySlot[]): GeminiKeySlot {
  const available = keys.filter((k) => isKeyAvailable(k.slot));
  const pool = available.length > 0 ? available : keys;
  const start = getCursor() % pool.length;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const index = (start + offset) % pool.length;
    const key = pool[index];
    setCursor(getCursor() + 1);
    return key;
  }

  return pool[0];
}

async function generateWithKey(params: {
  apiKey: string;
  model: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: params.apiKey });

  const response = await ai.models.generateContent({
    model: params.model,
    contents: params.prompt,
    config: {
      ...(params.systemInstruction
        ? { systemInstruction: params.systemInstruction }
        : {}),
      ...(typeof params.temperature === "number"
        ? { temperature: params.temperature }
        : {}),
      ...(typeof params.maxOutputTokens === "number"
        ? { maxOutputTokens: params.maxOutputTokens }
        : {}),
    },
  });

  const text = response.text?.trim() ?? "";
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

async function persistInteraction(input: {
  purpose: string;
  prompt: string;
  systemInstruction?: string;
  response: string;
  model: string;
  keySlot: number;
  status: "success" | "error";
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  durationMs: number;
}): Promise<string | undefined> {
  try {
    await connectDB();
    const { model, ...rest } = input;
    const doc = await AiInteraction.create({
      ...rest,
      modelName: model,
    });
    return String(doc._id);
  } catch (error) {
    console.error("[gemini] Failed to persist AiInteraction:", error);
    return undefined;
  }
}

/**
 * Send a prompt to Gemini using the shared 6-key pool.
 * Rotates keys and retries on rate-limit / quota errors.
 */
export async function askGemini(
  options: AskGeminiOptions,
): Promise<AskGeminiResult> {
  const keys = getGeminiKeys();
  if (!keys.length) {
    throw new Error(
      "No Gemini API keys configured. Set GEMINI_API_KEY_1..6 in .env.local.",
    );
  }

  const model = options.model?.trim() || getDefaultGeminiModel();
  const purpose = options.purpose?.trim() || "general";
  const persist = options.persist !== false;
  const started = Date.now();

  const attemptedSlots = new Set<number>();
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_CALL; attempt += 1) {
    const remaining = keys.filter((k) => !attemptedSlots.has(k.slot));
    if (!remaining.length) break;

    const key = pickNextKey(remaining);
    attemptedSlots.add(key.slot);

    try {
      const text = await generateWithKey({
        apiKey: key.apiKey,
        model,
        prompt: options.prompt,
        systemInstruction: options.systemInstruction,
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
      });

      const durationMs = Date.now() - started;
      let interactionId: string | undefined;

      if (persist) {
        interactionId = await persistInteraction({
          purpose,
          prompt: options.prompt,
          systemInstruction: options.systemInstruction,
          response: text,
          model,
          keySlot: key.slot,
          status: "success",
          metadata: options.metadata,
          durationMs,
        });
      }

      return {
        text,
        model,
        keySlot: key.slot,
        durationMs,
        interactionId,
      };
    } catch (error) {
      lastError = error;
      if (isRetryableKeyError(error)) {
        markKeyCooldown(key.slot);
        console.warn(
          `[gemini] Key slot ${key.slot} failed (retryable). Trying another key…`,
          error instanceof Error ? error.message : error,
        );
        continue;
      }

      const durationMs = Date.now() - started;
      if (persist) {
        await persistInteraction({
          purpose,
          prompt: options.prompt,
          systemInstruction: options.systemInstruction,
          response: "",
          model,
          keySlot: key.slot,
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : String(error),
          metadata: options.metadata,
          durationMs,
        });
      }
      throw error;
    }
  }

  const durationMs = Date.now() - started;
  const message =
    lastError instanceof Error
      ? lastError.message
      : "All Gemini API keys failed or are rate-limited.";

  if (persist) {
    await persistInteraction({
      purpose,
      prompt: options.prompt,
      systemInstruction: options.systemInstruction,
      response: "",
      model,
      keySlot: keys[0]?.slot ?? 1,
      status: "error",
      errorMessage: message,
      metadata: options.metadata,
      durationMs,
    });
  }

  throw new Error(message);
}

/**
 * Ask Gemini and parse a JSON object/array from the response text.
 * Strips optional markdown fences before parsing.
 */
export async function askGeminiJson<T = unknown>(
  options: AskGeminiOptions,
): Promise<{ data: T } & AskGeminiResult> {
  const result = await askGemini({
    ...options,
    systemInstruction: [
      options.systemInstruction?.trim(),
      "Respond with valid JSON only. Do not wrap the JSON in markdown fences.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });

  const cleaned = result.text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const data = JSON.parse(cleaned) as T;
    return { ...result, data };
  } catch {
    throw new Error(
      `Gemini returned non-JSON content for purpose "${options.purpose ?? "general"}".`,
    );
  }
}

/** Recent stored interactions for admin/debug use. */
export async function listAiInteractions(params?: {
  purpose?: string;
  limit?: number;
}) {
  await connectDB();
  const limit = Math.min(Math.max(params?.limit ?? 20, 1), 100);
  const filter = params?.purpose ? { purpose: params.purpose } : {};

  const docs = await AiInteraction.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    purpose: doc.purpose,
    prompt: doc.prompt,
    response: doc.response,
    model: doc.modelName,
    keySlot: doc.keySlot,
    status: doc.status,
    errorMessage: doc.errorMessage ?? "",
    metadata: doc.metadata,
    durationMs: doc.durationMs,
    createdAt: doc.createdAt,
  }));
}

export type AskGeminiChainedOptions = AskGeminiOptions & {
  chainSteps?: number;
  json?: boolean;
};

/**
 * Executes a sequential chain of Gemini calls across rotated API keys.
 * Passes the cumulative previous response as context to the next key.
 */
export async function askGeminiChained(
  options: AskGeminiChainedOptions,
): Promise<AskGeminiResult> {
  const keys = getGeminiKeys();
  const steps = options.chainSteps ?? Math.min(keys.length, 6);
  
  if (steps <= 1 || keys.length <= 1) {
    return askGemini(options);
  }

  let currentResponse = "";
  let lastResult: AskGeminiResult | null = null;
  const originalPrompt = options.prompt;
  const started = Date.now();

  for (let step = 1; step <= steps; step += 1) {
    let stepPrompt = "";
    if (step === 1) {
      stepPrompt = originalPrompt;
    } else {
      stepPrompt = `You are participating in a multi-step generation pipeline (Step ${step} of ${steps}) using API key rotation.
Original User Prompt:
"${originalPrompt}"

Here is the cumulative output generated by previous keys:
---
${currentResponse}
---

Your task is to refine, complete, and build upon this previous response. Make sure it is thorough, proper, and accurate. 
${
  options.json
    ? "Return ONLY a valid JSON object. Expand, correct, or fill in any remaining fields if needed, maintaining the exact schema."
    : "Output the complete, updated version of the text, continuing where it left off if necessary."
}`;
    }

    try {
      const result = await askGemini({
        ...options,
        prompt: stepPrompt,
        purpose: `${options.purpose || "general"}-chain-step-${step}`,
        // Keep intermediate steps from persisting unless specified, but let's persist to track
        persist: options.persist,
      });

      currentResponse = result.text;
      lastResult = result;
    } catch (error) {
      console.error(`[gemini-chain] Step ${step} failed:`, error);
      if (step === 1) {
        throw error; // If first step fails, propagate
      }
      // If later steps fail, fallback to previous successful response
      break;
    }
  }

  if (!lastResult) {
    throw new Error("Chained generation failed to execute any steps.");
  }

  return {
    ...lastResult,
    text: currentResponse,
    durationMs: Date.now() - started,
  };
}

/**
 * Chained version of JSON-parsed Gemini responses.
 */
export async function askGeminiJsonChained<T = unknown>(
  options: AskGeminiChainedOptions,
): Promise<{ data: T } & AskGeminiResult> {
  const result = await askGeminiChained({
    ...options,
    json: true,
    systemInstruction: [
      options.systemInstruction?.trim(),
      "Respond with valid JSON only. Do not wrap the JSON in markdown fences.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });

  const cleaned = result.text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const data = JSON.parse(cleaned) as T;
    return { ...result, data };
  } catch (error) {
    console.error("[gemini-chain] Failed to parse JSON response:", cleaned, error);
    throw new Error(
      `Gemini returned non-JSON content for chained purpose "${options.purpose ?? "general"}".`,
    );
  }
}

