"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/projects";
import { FaGithub } from "react-icons/fa";

type ProjectsProps = {
  projects: ProjectData[];
};

const PREVIEW_BULLET_COUNT = 2;

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function projectInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ProjectImage({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-200 via-teal-100 to-sky-100 transition-transform duration-500 ease-out group-hover:scale-105"
    >
      <span className="rounded-full border border-white/60 bg-white/50 px-4 py-3 text-lg font-semibold tracking-wide text-zinc-700 backdrop-blur-sm">
        {projectInitials(title) || "P"}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  const hasLongBullets = project.bullets.length > PREVIEW_BULLET_COUNT;
  const [expanded, setExpanded] = useState(false);

  const visibleBullets = expanded
    ? project.bullets
    : project.bullets.slice(0, PREVIEW_BULLET_COUNT);

  return (
    <Card
      className={cn(
        "group h-full overflow-hidden border-0 bg-white shadow-sm ring-zinc-200/80",
        "transition-colors hover:ring-zinc-300",
        "pt-0",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        <ProjectImage title={project.title} imageUrl={project.imageUrl} />
      </div>

      <CardHeader>
        <CardTitle className="text-lg text-zinc-900 sm:text-xl">
          {project.title}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed text-zinc-600">
          {project.description}
        </CardDescription>

        {project.techStack.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>

      {(project.bullets.length > 0 ||
        project.liveUrl ||
        project.githubUrl) && (
        <CardContent className="space-y-4">
          {project.bullets.length > 0 ? (
            <div>
              <ul className="space-y-2">
                {visibleBullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-2 text-sm leading-relaxed text-zinc-600"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-400"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {hasLongBullets ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-2 h-auto px-0"
                  onClick={() => setExpanded((prev) => !prev)}
                  aria-expanded={expanded}
                >
                  {expanded ? "Show less" : "Read more"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      )}

      {(project.liveUrl || project.githubUrl) && (
        <CardFooter className="flex flex-col gap-2 border-t-0 bg-transparent sm:flex-row sm:flex-wrap">
          {project.liveUrl ? (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full justify-center sm:w-auto sm:min-w-28",
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
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full justify-center sm:w-auto sm:min-w-28",
              )}
            >
              <FaGithub data-icon="inline-start" />
              GitHub
            </Link>
          ) : null}
        </CardFooter>
      )}
    </Card>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const reduceMotion = useReducedMotion();

  if (!projects.length) {
    return null;
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Selected work
          </p>
          <h2
            id="projects-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            Projects
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:text-lg">
            A few builds I&apos;m proud of — from idea to shipped experience.
          </p>
        </div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={reduceMotion ? undefined : itemVariants}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Projects;
