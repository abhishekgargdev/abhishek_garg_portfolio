import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import { ProjectDetailView } from "@/components/sections/ProjectDetailView";
import Project from "@/models/Project";
import { connectDB } from "@/lib/db";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Case Study`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Case Study`,
      description: project.description,
      images: project.imageUrl ? [{ url: project.imageUrl }] : [],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Fetch recommended projects (exclude current one)
  await connectDB();
  const recDocs = await Project.find({ _id: { $ne: project.id } })
    .sort({ order: 1 })
    .limit(2)
    .lean();

  const recommended = recDocs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug || "",
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

  return <ProjectDetailView project={project} recommended={recommended} />;
}
