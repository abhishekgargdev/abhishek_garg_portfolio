import { connectDB } from "@/lib/db";
import TimelineEntry from "@/models/TimelineEntry";

export type TimelineEntryData = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  order: number;
};

export async function getTimelineEntries(): Promise<TimelineEntryData[]> {
  await connectDB();

  const docs = await TimelineEntry.find()
    .sort({ order: 1, startDate: 1 })
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    role: doc.role,
    company: doc.company,
    startDate: new Date(doc.startDate).toISOString(),
    endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
    description: doc.description,
    order: doc.order,
  }));
}
