import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export type ProjectResultData = {
  label: string;
  value: string;
};

export type ProjectLinkData = {
  label: string;
  url: string;
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
  links: ProjectLinkData[];
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
  directoryStructure: string;
  readmeMd: string;
  order: number;
};

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function toProjectData(doc: {
  _id: unknown;
  title: string;
  slug?: string;
  techStack?: string[];
  description: string;
  bullets?: string[];
  liveUrl?: string;
  githubUrl?: string;
  links?: { label: string; url: string }[];
  imageUrl?: string;
  images?: string[];
  category?: string;
  status?: "completed" | "ongoing" | "concept";
  featured?: boolean;
  role?: string;
  duration?: string;
  problem?: string;
  solution?: string;
  features?: string[];
  results?: { label: string; value: string }[];
  projectType?: "personal" | "professional";
  company?: string;
  teamSize?: string;
  responsibilities?: string[];
  videoUrl?: string;
  directoryStructure?: string;
  readmeMd?: string;
  order: number;
}): ProjectData {
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug || slugify(doc.title),
    techStack: doc.techStack ?? [],
    description: doc.description,
    bullets: doc.bullets ?? [],
    liveUrl: doc.liveUrl ?? "",
    githubUrl: doc.githubUrl ?? "",
    links: (doc.links ?? [])
      .filter((link) => link.label?.trim() && link.url?.trim())
      .map((link) => ({ label: link.label, url: link.url })),
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
    results: (doc.results ?? []).map((r) => ({
      label: r.label,
      value: r.value,
    })),
    projectType: doc.projectType ?? "personal",
    company: doc.company ?? "",
    teamSize: doc.teamSize ?? "",
    responsibilities: doc.responsibilities ?? [],
    videoUrl: doc.videoUrl ?? "",
    directoryStructure: doc.directoryStructure ?? "",
    readmeMd: doc.readmeMd ?? "",
    order: doc.order,
  };
}

export async function getProjects(): Promise<ProjectData[]> {
  await connectDB();

  const docs = await Project.find().sort({ order: 1 });

  for (const doc of docs) {
    if (!doc.slug) {
      doc.slug = slugify(doc.title);
      await doc.save();
    }
  }

  return docs.map((doc) => toProjectData(doc));
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectData | null> {
  await connectDB();

  let doc = await Project.findOne({ slug }).lean();

  if (!doc) {
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

  return toProjectData(doc);
}
