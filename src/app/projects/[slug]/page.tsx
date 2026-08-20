import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { ProjectDetailView } from "@/components/sections/ProjectDetailView";

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

  const recommended = (await getProjects())
    .filter((item) => item.id !== project.id)
    .slice(0, 2);

  return <ProjectDetailView project={project} recommended={recommended} />;
}
