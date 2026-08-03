import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export type ProjectData = {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  bullets: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  order: number;
};

export async function getProjects(): Promise<ProjectData[]> {
  await connectDB();

  const docs = await Project.find().sort({ order: 1 }).lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    techStack: doc.techStack ?? [],
    description: doc.description,
    bullets: doc.bullets ?? [],
    liveUrl: doc.liveUrl ?? "",
    githubUrl: doc.githubUrl ?? "",
    imageUrl: doc.imageUrl ?? "",
    order: doc.order,
  }));
}
