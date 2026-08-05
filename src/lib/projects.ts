import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export type ProjectResultData = {
  label: string;
  value: string;
};

export type ProjectData = {
  id: string;
  title: string;
  slug: string;
  techStack: string[];
  description: string;
  bullets: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  images: string[];
  category: string;
  status: "completed" | "ongoing" | "concept";
  featured: boolean;
  role: string;
  duration: string;
  problem: string;
  solution: string;
  features: string[];
  results: ProjectResultData[];
  projectType: "personal" | "professional";
  company: string;
  teamSize: string;
  responsibilities: string[];
  videoUrl: string;
  order: number;
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function getProjects(): Promise<ProjectData[]> {
  await connectDB();

  const docs = await Project.find().sort({ order: 1 });

  // Self-healing migration for existing projects with empty slugs
  for (const doc of docs) {
    if (!doc.slug) {
      doc.slug = slugify(doc.title);
      await doc.save();
    }
  }

  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug || slugify(doc.title),
    techStack: doc.techStack ?? [],
    description: doc.description,
    bullets: doc.bullets ?? [],
    liveUrl: doc.liveUrl ?? "",
    githubUrl: doc.githubUrl ?? "",
    imageUrl: doc.imageUrl ?? "",
    images: doc.images ?? [],
    category: doc.category ?? "",
    status: doc.status ?? "completed",
    featured: doc.featured ?? false,
    role: doc.role ?? "",
    duration: doc.duration ?? "",
    problem: doc.problem ?? "",
    solution: doc.solution ?? "",
    features: doc.features ?? [],
    results: (doc.results ?? []).map((r: any) => ({
      label: r.label,
      value: r.value,
    })),
    projectType: doc.projectType ?? "personal",
    company: doc.company ?? "",
    teamSize: doc.teamSize ?? "",
    responsibilities: doc.responsibilities ?? [],
    videoUrl: doc.videoUrl ?? "",
    order: doc.order,
  }));
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectData | null> {
  await connectDB();

  let doc = await Project.findOne({ slug }).lean();

  if (!doc) {
    // Try finding by slugified title as a fallback if migration hasn't persisted yet
    const all = await Project.find();
    const match = all.find((d) => slugify(d.title) === slug);
    if (match) {
      if (!match.slug) {
        match.slug = slug;
        await match.save();
      }
      doc = match.toObject();
    }
  }

  if (!doc) return null;

  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug || slugify(doc.title),
    techStack: doc.techStack ?? [],
    description: doc.description,
    bullets: doc.bullets ?? [],
    liveUrl: doc.liveUrl ?? "",
    githubUrl: doc.githubUrl ?? "",
    imageUrl: doc.imageUrl ?? "",
    images: doc.images ?? [],
    category: doc.category ?? "",
    status: doc.status ?? "completed",
    featured: doc.featured ?? false,
    role: doc.role ?? "",
    duration: doc.duration ?? "",
    problem: doc.problem ?? "",
    solution: doc.solution ?? "",
    features: doc.features ?? [],
    results: (doc.results ?? []).map((r: any) => ({
      label: r.label,
      value: r.value,
    })),
    projectType: doc.projectType ?? "personal",
    company: doc.company ?? "",
    teamSize: doc.teamSize ?? "",
    responsibilities: doc.responsibilities ?? [],
    videoUrl: doc.videoUrl ?? "",
    order: doc.order,
  };
}
