import { connectDB } from "@/lib/db";
import Experience from "@/models/Experience";

export type ExperienceData = {
  id: string;
  role: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  techStack: string[];
  order: number;
};

export async function getExperienceRecords(): Promise<ExperienceData[]> {
  await connectDB();

  const docs = await Experience.find().sort({ order: 1, startDate: -1 }).lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    role: doc.role,
    company: doc.company,
    description: doc.description ?? "",
    startDate: new Date(doc.startDate).toISOString(),
    endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
    bullets: doc.bullets ?? [],
    techStack: doc.techStack ?? [],
    order: doc.order,
  }));
}
