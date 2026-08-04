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
import { getSkillIcon } from "@/lib/skill-icons";
import { SectionHeading } from "@/components/layout/SectionHeading";

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
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const GRADIENTS = [
  "from-indigo-600/90 to-purple-600/90 dark:from-indigo-950/70 dark:to-purple-950/70",
  "from-teal-600/90 to-emerald-600/90 dark:from-teal-950/70 dark:to-emerald-950/70",
  "from-pink-600/90 to-rose-600/90 dark:from-pink-950/70 dark:to-rose-950/70",
  "from-sky-600/90 to-blue-600/90 dark:from-sky-950/70 dark:to-blue-950/70",
  "from-amber-600/90 to-orange-600/90 dark:from-amber-950/70 dark:to-orange-950/70",
];

function getProjectGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

function ProjectImage({
  title,
  imageUrl,
  techStack,
  reduceMotion,
}: {
  title: string;
  imageUrl: string;
  techStack: string[];
  reduceMotion: boolean | null;
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

  const gradient = getProjectGradient(title);

  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br transition-all duration-500 ease-out group-hover:scale-105 px-4 text-center",
        gradient
      )}
    >
      {/* Translucent background tech icons */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] overflow-hidden flex justify-around items-center z-0 pointer-events-none">
        {techStack.slice(0, 4).map((tech, idx) => {
          const Icon = getSkillIcon(tech);
          return (
            <Icon
              key={tech}
              className={cn(
                "size-12 shrink-0 transition-all duration-700",
                !reduceMotion && "animate-pulse",
                idx === 0 && "translate-y-4 -translate-x-2",
                idx === 1 && "-translate-y-6 translate-x-4",
                idx === 2 && "translate-y-2 translate-x-6",
                idx === 3 && "-translate-y-2 -translate-x-4"
              )}
            />
          );
        })}
      </div>

      <span className="relative z-10 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-white backdrop-blur-md shadow-md uppercase">
        {title}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  const reduceMotion = useReducedMotion();
  const hasLongBullets = project.bullets.length > PREVIEW_BULLET_COUNT;
  const [expanded, setExpanded] = useState(false);

  const visibleBullets = expanded
    ? project.bullets
    : project.bullets.slice(0, PREVIEW_BULLET_COUNT);

  return (
    <Card
      className={cn(
        "group h-full overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-foreground/20",
        "pt-0 flex flex-col justify-between",
      )}
    >
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <ProjectImage
            title={project.title}
            imageUrl={project.imageUrl}
            techStack={project.techStack}
            reduceMotion={reduceMotion}
          />
        </div>

        <CardHeader>
          <CardTitle className="text-lg text-foreground sm:text-xl transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
            {project.title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </CardDescription>

          {project.techStack.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.techStack.map((tech) => {
                const Icon = getSkillIcon(tech);
                return (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-0.5 text-[0.7rem] transition-colors group-hover:bg-muted/70"
                  >
                    <Icon className="size-3" />
                    {tech}
                  </Badge>
                );
              })}
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
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
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
                    className="mt-2 h-auto px-0 text-teal-600 dark:text-teal-400 hover:text-teal-700"
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
      </div>

      {(project.liveUrl || project.githubUrl) && (
        <CardFooter className="flex flex-col gap-2.5 border-t border-border/50 bg-muted/10 sm:flex-row sm:flex-wrap">
          {project.liveUrl ? (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full justify-center sm:w-auto sm:min-w-28 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 transition-all duration-300 shadow-sm hover:scale-[1.02]",
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
                "w-full justify-center sm:w-auto sm:min-w-28 transition-all duration-300 hover:scale-[1.02] hover:bg-muted/50",
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
      className="relative scroll-mt-20 bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Selected work"
          title="Projects"
          description="A few builds I'm proud of — from idea to shipped experience."
        />

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
