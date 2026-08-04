import { NextResponse } from "next/server";
import { z } from "zod";
import { getAboutMe } from "@/lib/about";
import { getAchievements } from "@/lib/achievements";
import { getCertifications } from "@/lib/certifications";
import { getEducationRecords } from "@/lib/education";
import { getExperienceRecords } from "@/lib/experience";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  askGeminiJson,
  getConfiguredGeminiKeyCount,
} from "@/lib/gemini";
import { getProjects } from "@/lib/projects";
import { getSkillCategories } from "@/lib/skills";
import { getTimelineEntries } from "@/lib/timeline";

export const runtime = "nodejs";

const draftSchema = z.object({
  name: z.string(),
  title: z.string(),
  tagline: z.string().optional(),
  taglines: z.array(z.string()).optional(),
  bio: z.string(),
  location: z.string(),
  phone: z.string(),
  email: z.string(),
  profileImageUrl: z.string().optional(),
  resumeFileUrl: z.string().optional(),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string() }))
    .optional(),
});

const suggestionSchema = z.object({
  overview: z.string(),
  fields: z.array(
    z.object({
      field: z.enum([
        "name",
        "title",
        "taglines",
        "bio",
        "location",
        "phone",
        "email",
      ]),
      suggestedValue: z.string(),
      reason: z.string(),
    }),
  ),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      recommended: z.boolean(),
      reason: z.string(),
      suggestedUrl: z.string().optional(),
    }),
  ),
  gaps: z.array(z.string()),
});

export type AboutAiSuggestions = z.infer<typeof suggestionSchema>;

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  if (getConfiguredGeminiKeyCount() === 0) {
    return NextResponse.json(
      {
        error:
          "No Gemini API keys configured. Add GEMINI_API_KEY_1..6 in .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const draft = draftSchema.parse(body.draft ?? body);

    const [
      savedAbout,
      timeline,
      experience,
      education,
      projects,
      skills,
      achievements,
      certifications,
    ] = await Promise.all([
      getAboutMe(),
      getTimelineEntries(),
      getExperienceRecords(),
      getEducationRecords(),
      getProjects(),
      getSkillCategories(),
      getAchievements(),
      getCertifications(),
    ]);

    const portfolioContext = {
      savedAbout,
      timeline,
      experience,
      education,
      projects,
      skills,
      achievements,
      certifications,
    };

    const prompt = `You are a senior technical recruiter and portfolio copywriter.

Review the current About draft and the full portfolio dataset below. Suggest improved content for each About field and explain which portfolio facts belong in which section.

Current About draft:
${JSON.stringify(draft, null, 2)}

Full portfolio data:
${JSON.stringify(portfolioContext, null, 2)}

Rules:
- Keep suggestions professional, concise, and ATS-friendly.
- Title should be a strong headline (pipe-separated skills are OK).
- Taglines should be 3-5 short rotating hero lines (typewriter effect), each one sentence.
- Bio should be 3-5 sentences summarizing impact, stack, and leadership.
- Do not invent employers, dates, or metrics not supported by the portfolio data.
- For social links, recommend which platforms matter for this profile and whether to add/fix URLs.
- List any important portfolio facts that are missing from the About section in gaps.

Return JSON with this shape:
{
  "overview": "short summary of overall recommendations",
  "fields": [
    { "field": "name|title|taglines|bio|location|phone|email", "suggestedValue": "...", "reason": "..." }
  ],
  "socialLinks": [
    { "platform": "LinkedIn", "recommended": true, "reason": "...", "suggestedUrl": "optional" }
  ],
  "gaps": ["..."]
}`;

    const { data } = await askGeminiJson<AboutAiSuggestions>({
      purpose: "about-suggest",
      prompt,
      systemInstruction:
        "You optimize developer portfolio About sections. Respond with valid JSON only.",
      temperature: 0.4,
      metadata: { source: "admin-about" },
    });

    const parsed = suggestionSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "AI returned an invalid suggestion format." },
        { status: 502 },
      );
    }

    return NextResponse.json({ suggestions: parsed.data });
  } catch (error) {
    console.error("[api/ai/about-suggest] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate suggestions",
      },
      { status: 502 },
    );
  }
}
