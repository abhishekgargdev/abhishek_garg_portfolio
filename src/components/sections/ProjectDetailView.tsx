"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Info,
  Layers,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { MarkdownDocument } from "@/components/markdown/MarkdownDocument";
import { ProjectImageSlider } from "@/components/projects/ProjectImageSlider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getSkillIcon } from "@/lib/skill-icons";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/projects";

type ProjectDetailViewProps = {
  project: ProjectData;
  recommended: ProjectData[];
};

export function ProjectDetailView({
  project,
  recommended,
}: ProjectDetailViewProps) {
  const gallery =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : project.imageUrl
        ? [project.imageUrl]
        : [];

  const extraLinks = project.links ?? [];
  const hasReadme = Boolean(project.readmeMd?.trim());

  return (
    <div className="relative min-h-screen bg-background pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.08),_transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/#projects"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            {project.category ? (
              <Badge
                variant="outline"
                className="border-teal-500/30 bg-teal-500/5 text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
              >
                {project.category}
              </Badge>
            ) : null}
            {project.status ? (
              <Badge
                className={cn(
                  "border-none px-2 py-0.5 text-[10px] font-bold uppercase",
                  project.status === "completed"
                    ? "bg-teal-500 text-white"
                    : project.status === "ongoing"
                      ? "bg-amber-500 text-white"
                      : "bg-sky-500 text-white",
                )}
              >
                {project.status === "completed"
                  ? "Completed"
                  : project.status === "ongoing"
                    ? "In Progress"
                    : "Concept"}
              </Badge>
            ) : null}
            {project.projectType === "professional" ? (
              <Badge variant="secondary" className="text-[10px] uppercase">
                Professional
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {project.title}
          </h1>
          {project.projectType === "professional" && project.company ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">
              <Building2 className="size-4" />
              Built at {project.company}
            </p>
          ) : null}
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {project.description}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <ProjectImageSlider images={gallery} title={project.title} />
        </motion.div>

        <div className="mb-10 flex flex-wrap gap-2.5">
          {project.liveUrl ? (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants(),
                "bg-gradient-to-r from-teal-600 to-sky-600 shadow-sm hover:from-teal-500 hover:to-sky-500",
              )}
            >
              <ExternalLink data-icon="inline-start" />
              Live Demo
            </Link>
          ) : null}
          {project.githubUrl ? (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <FaGithub data-icon="inline-start" />
              GitHub
            </Link>
          ) : null}
          {extraLinks.map((link) => (
            <Link
              key={`${link.label}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary" })}
            >
              <ArrowUpRight data-icon="inline-start" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            {hasReadme ? (
              <section className="rounded-3xl border border-border bg-card/70 p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="size-4 text-teal-500" />
                  Project README
                </div>
                <MarkdownDocument content={project.readmeMd} />
              </section>
            ) : (
              <>
                {(project.problem || project.solution) && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {project.problem ? (
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6">
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-amber-500/80" />
                        <h3 className="mb-2 flex items-center gap-2 font-bold">
                          <Info className="size-4 text-amber-500" />
                          The Challenge
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {project.problem}
                        </p>
                      </div>
                    ) : null}
                    {project.solution ? (
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6">
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-teal-500/80" />
                        <h3 className="mb-2 flex items-center gap-2 font-bold">
                          <Sparkles className="size-4 text-teal-500" />
                          The Solution
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {project.solution}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {project.features?.length ? (
                  <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8">
                    <h3 className="mb-4 flex items-center gap-2 font-bold">
                      <Layers className="size-4 text-sky-500" />
                      Key Features
                    </h3>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {project.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {project.directoryStructure?.trim() ? (
                  <div className="rounded-2xl border border-border bg-card/70 p-6">
                    <h3 className="mb-3 font-bold">Directory structure</h3>
                    <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-4 font-mono text-[13px] leading-6 text-zinc-100">
                      {project.directoryStructure}
                    </pre>
                  </div>
                ) : null}
              </>
            )}

            {project.videoUrl ? (
              <div className="rounded-2xl border border-border bg-card/70 p-4">
                <h3 className="mb-3 px-1 font-bold">Project demonstration</h3>
                <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={project.videoUrl}
                    title={`${project.title} demo`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 size-full border-none"
                  />
                </div>
              </div>
            ) : null}

            {project.projectType === "professional" &&
            project.responsibilities?.length ? (
              <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Briefcase className="size-4 text-teal-500" />
                  Key Responsibilities
                </h3>
                <ul className="space-y-3">
                  {project.responsibilities.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Project facts
              </h3>
              <dl className="space-y-3 text-sm">
                {project.role ? (
                  <div className="flex items-start gap-2.5">
                    <User className="mt-0.5 size-4 text-teal-500" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Role</dt>
                      <dd className="font-medium">{project.role}</dd>
                    </div>
                  </div>
                ) : null}
                {project.duration ? (
                  <div className="flex items-start gap-2.5">
                    <Calendar className="mt-0.5 size-4 text-sky-500" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Duration</dt>
                      <dd className="font-medium">{project.duration}</dd>
                    </div>
                  </div>
                ) : null}
                {project.teamSize ? (
                  <div className="flex items-start gap-2.5">
                    <Users className="mt-0.5 size-4 text-indigo-500" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Team</dt>
                      <dd className="font-medium">{project.teamSize}</dd>
                    </div>
                  </div>
                ) : null}
              </dl>
            </div>

            {project.results?.length ? (
              <div className="grid grid-cols-1 gap-3">
                {project.results.map((metric) => (
                  <div
                    key={`${metric.label}-${metric.value}`}
                    className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 p-5"
                  >
                    <p className="font-mono text-3xl font-extrabold text-teal-500">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {project.techStack?.length ? (
              <div className="rounded-2xl border border-border bg-card/70 p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => {
                    const Icon = getSkillIcon(tech);
                    return (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal"
                      >
                        <Icon className="size-3.5 text-muted-foreground" />
                        {tech}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {recommended.length > 0 ? (
          <section className="mt-20 border-t border-border pt-12">
            <h2 className="text-2xl font-bold tracking-tight">
              Explore more projects
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {recommended.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/projects/${rec.slug}`}
                  className="group rounded-2xl border border-border bg-card/70 p-5 transition hover:-translate-y-0.5 hover:border-teal-500/20 hover:shadow-md"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-500">
                    {rec.category || "Case study"}
                  </p>
                  <h3 className="mt-1 text-base font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    {rec.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {rec.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
