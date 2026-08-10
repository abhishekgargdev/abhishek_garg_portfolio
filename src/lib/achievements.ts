import { connectDB } from "@/lib/db";
import Achievement from "@/models/Achievement";

export type AchievementData = {
  id: string;
  title: string;
  description: string;
  date: string;
  order: number;
  imageUrl?: string;
};

export async function getAchievements(): Promise<AchievementData[]> {
  await connectDB();

  const docs = await Achievement.find().sort({ order: 1, date: -1 }).lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    date: new Date(doc.date).toISOString(),
    order: doc.order,
    imageUrl: doc.imageUrl || "",
  }));
}
