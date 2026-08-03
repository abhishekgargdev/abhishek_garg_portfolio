import { connectDB } from "@/lib/db";
import EducationModel from "@/models/Education";

export type EducationData = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
};

function yearSortKey(year: string): number {
  const matches = year.match(/\d{4}/g);
  if (!matches?.length) return 0;
  return Math.max(...matches.map(Number));
}

export async function getEducationRecords(): Promise<EducationData[]> {
  await connectDB();

  const docs = await EducationModel.find().lean();

  return docs
    .map((doc) => ({
      id: String(doc._id),
      degree: doc.degree,
      institution: doc.institution,
      year: doc.year,
      highlights: doc.highlights ?? [],
    }))
    .sort((a, b) => yearSortKey(b.year) - yearSortKey(a.year));
}
