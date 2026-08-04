import { connectDB } from "@/lib/db";
import {
  mergeLegacyIntoPeriods,
  type ExperienceTenureData,
} from "@/lib/experience-tenure-utils";
import ExperienceTenure from "@/models/ExperienceTenure";

export type {
  DurationParts,
  ExperienceTenureData,
  RelevantPeriodData,
  TenurePeriodData,
} from "@/lib/experience-tenure-utils";

export {
  diffDurationParts,
  earliestPeriodStart,
  emptyDurationParts,
  findMatchingPeriodIndex,
  formatDurationShort,
  formatPeriodRange,
  mergeLegacyIntoPeriods,
  msToDurationParts,
  periodIdentity,
  periodsForRelevant,
  periodsForTotal,
  periodsMatch,
  sumPeriodDurations,
} from "@/lib/experience-tenure-utils";

export async function getExperienceTenure(): Promise<ExperienceTenureData | null> {
  await connectDB();

  const doc = await ExperienceTenure.findOne().sort({ updatedAt: -1 }).lean();
  if (!doc) return null;

  const periods = mergeLegacyIntoPeriods({
    periods: doc.periods?.map((period) => ({
      id: String(period._id ?? ""),
      title: period.title,
      company: period.company,
      startDate: period.startDate,
      endDate: period.endDate,
      countsTotal: period.countsTotal,
      countsRelevant: period.countsRelevant,
    })),
    totalPeriods: doc.totalPeriods?.map((period) => ({
      id: String(period._id ?? ""),
      title: period.title,
      company: period.company,
      startDate: period.startDate,
      endDate: period.endDate,
    })),
    relevantPeriods: doc.relevantPeriods?.map((period) => ({
      id: String(period._id ?? ""),
      title: period.title,
      company: period.company,
      startDate: period.startDate,
      endDate: period.endDate,
    })),
    totalStartDate: doc.totalStartDate,
  });

  if (!periods.length) return null;

  return {
    id: String(doc._id),
    totalLabel: doc.totalLabel,
    relevantLabel: doc.relevantLabel,
    periods,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  };
}
