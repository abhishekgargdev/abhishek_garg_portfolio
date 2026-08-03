import { connectDB } from "@/lib/db";
import Stat from "@/models/Stat";

export type StatData = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  iconKey: string;
  order: number;
};

/** Defaults shown until admin configures stats (editable via About/Stats later). */
export const DEFAULT_STATS: Omit<StatData, "id">[] = [
  {
    label: "Years of Experience",
    value: 3,
    suffix: "+",
    iconKey: "calendar",
    order: 0,
  },
  {
    label: "Projects Delivered",
    value: 20,
    suffix: "+",
    iconKey: "folders",
    order: 1,
  },
  {
    label: "Uptime",
    value: 99.9,
    suffix: "%",
    iconKey: "activity",
    order: 2,
  },
  {
    label: "Developers Mentored",
    value: 10,
    suffix: "+",
    iconKey: "users",
    order: 3,
  },
];

export async function getStats(): Promise<StatData[]> {
  await connectDB();

  const docs = await Stat.find().sort({ order: 1 }).lean();

  if (!docs.length) {
    return DEFAULT_STATS.map((stat, index) => ({
      ...stat,
      id: `default-${index}`,
    }));
  }

  return docs.map((doc) => ({
    id: String(doc._id),
    label: doc.label,
    value: doc.value,
    suffix: doc.suffix ?? "",
    iconKey: doc.iconKey || "briefcase",
    order: doc.order,
  }));
}
