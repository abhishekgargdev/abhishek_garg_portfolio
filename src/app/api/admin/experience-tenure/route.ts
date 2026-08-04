import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { getExperienceTenure } from "@/lib/experience-tenure";
import ExperienceTenure from "@/models/ExperienceTenure";

export const runtime = "nodejs";

const periodSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  company: z.string().trim().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable().optional(),
  countsTotal: z.boolean().default(true),
  countsRelevant: z.boolean().default(false),
});

const tenureSchema = z
  .object({
    totalLabel: z.string().trim().min(1).default("Total Experience"),
    relevantLabel: z.string().trim().min(1).default("Relevant Experience"),
    periods: z.array(periodSchema).min(1, "Add at least one period"),
  })
  .superRefine((data, ctx) => {
    if (!data.periods.some((period) => period.countsTotal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one period must count toward Total Experience",
        path: ["periods"],
      });
    }
  });

function mapPeriods(
  periods: z.infer<typeof periodSchema>[],
): {
  title: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  countsTotal: boolean;
  countsRelevant: boolean;
}[] {
  return periods.map((period) => {
    const startDate = new Date(period.startDate);
    const endDate =
      period.endDate && period.endDate.trim()
        ? new Date(period.endDate)
        : null;

    if (Number.isNaN(startDate.getTime())) {
      throw new Error(`Invalid start date for "${period.title}"`);
    }
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new Error(`Invalid end date for "${period.title}"`);
    }

    return {
      title: period.title,
      company: period.company,
      startDate,
      endDate,
      countsTotal: period.countsTotal,
      countsRelevant: period.countsRelevant,
    };
  });
}

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const tenure = await getExperienceTenure();
    return NextResponse.json({ item: tenure });
  } catch (error) {
    console.error("[api/admin/experience-tenure] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load experience tenure" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = tenureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const periods = mapPeriods(data.periods);
    const totalStartDate = periods
      .filter((period) => period.countsTotal)
      .map((period) => period.startDate)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    await connectDB();

    const existing = await ExperienceTenure.findOne().sort({ updatedAt: -1 });
    let saved;

    if (existing) {
      existing.totalLabel = data.totalLabel;
      existing.relevantLabel = data.relevantLabel;
      existing.periods = periods;
      existing.totalStartDate = totalStartDate;
      // Clear legacy dual lists so reads use the unified `periods` field.
      existing.totalPeriods = [];
      existing.relevantPeriods = [];
      existing.markModified("totalPeriods");
      existing.markModified("relevantPeriods");
      saved = await existing.save();
    } else {
      saved = await ExperienceTenure.create({
        totalLabel: data.totalLabel,
        relevantLabel: data.relevantLabel,
        periods,
        totalStartDate,
      });
    }

    const tenure = await getExperienceTenure();
    return NextResponse.json({ item: tenure, id: String(saved._id) });
  } catch (error) {
    console.error("[api/admin/experience-tenure] PUT failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save experience tenure",
      },
      { status: 500 },
    );
  }
}
