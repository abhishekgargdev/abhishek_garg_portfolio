import { connectDB } from "@/lib/db";
import {
  normalizeTimelineCategory,
  type TimelineEntryData,
} from "@/lib/timeline-types";
import TimelineEntry from "@/models/TimelineEntry";

export type {
  TimelineCategory,
  TimelineEntryData,
} from "@/lib/timeline-types";
export {
  TIMELINE_CATEGORIES,
  TIMELINE_CATEGORY_LABELS,
  TIMELINE_CATEGORY_OPTIONS,
  isTimelineCategory,
  normalizeTimelineCategory,
} from "@/lib/timeline-types";

export async function getTimelineEntries(): Promise<TimelineEntryData[]> {
  await connectDB();

  const docs = await TimelineEntry.find()
    .sort({ order: 1, startDate: -1 })
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    category: normalizeTimelineCategory(doc.category),
    role: doc.role,
    company: doc.company ?? "",
    startDate: new Date(doc.startDate).toISOString(),
    endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
    description: doc.description,
    link: doc.link ?? "",
    order: doc.order,
  }));
}
