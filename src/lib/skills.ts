import { connectDB } from "@/lib/db";
import SkillCategory from "@/models/SkillCategory";

export type SkillData = {
  name: string;
  iconKey: string;
  proficiency: number;
};

export type SkillCategoryData = {
  id: string;
  categoryName: string;
  skills: SkillData[];
  order: number;
};

export async function getSkillCategories(): Promise<SkillCategoryData[]> {
  await connectDB();

  const docs = await SkillCategory.find().sort({ order: 1 }).lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    categoryName: doc.categoryName,
    skills: (doc.skills ?? []).map((skill) => ({
      name: skill.name,
      iconKey: skill.iconKey,
      proficiency: Math.min(100, Math.max(0, skill.proficiency)),
    })),
    order: doc.order,
  }));
}
