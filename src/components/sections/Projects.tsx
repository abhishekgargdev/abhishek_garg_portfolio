"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
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
        gradient,
      )}
    >
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
                idx === 3 && "-translate-y-2 -translate-x-4",
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

  const handleExternalLink = (
    e: React.MouseEvent<HTMLButtonElement>,
    url: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full select-none outline-none"
    >
      <Card
        className={cn(
          "h-full overflow-hidden border border-border bg-card shadow-sm transition-all duration-300",
          "hover:-translate-y-1.5 hover:shadow-lg hover:border-teal-500/20 dark:hover:border-teal-500/15",
          "pt-0 flex flex-col justify-between relative",
        )}
      >
        {/* Status indicator badge */}
        {project.status && project.status !== "completed" && (
          <div className="absolute left-3 top-3 z-20">
            <Badge
              className={cn(
                "text-[10px] font-bold border-none uppercase py-0.5 px-2 select-none",
                project.status === "ongoing"
                  ? "bg-amber-500/95 text-white dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-blue-500/95 text-white dark:bg-blue-500/10 dark:text-blue-400",
              )}
            >
              {project.status === "ongoing" ? "In Progress" : "Concept"}
            </Badge>
          </div>
        )}

        {/* Featured project badge */}
        {project.featured && (
          <div className="absolute right-3 top-3 z-20">
            <Badge className="bg-teal-500 hover:bg-teal-500 text-white text-[10px] font-bold border-none uppercase py-0.5 px-2 select-none shadow">
              ★ Featured
            </Badge>
          </div>
        )}

        <div>
          {/* Card Image Area */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            <ProjectImage
              title={project.title}
              imageUrl={project.imageUrl}
              techStack={project.techStack}
              reduceMotion={reduceMotion}
            />

            {/* Translucent overlay appearing on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-black shadow-md backdrop-blur translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                View Case Study
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </div>

          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg text-foreground sm:text-xl transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                {project.title}
              </CardTitle>
            </div>
            {(project.category ||
              (project.projectType === "professional" && project.company)) && (
              <div className="flex items-center flex-wrap gap-1.5 -mt-1 select-none">
                {project.category && (
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                    {project.category}
                  </p>
                )}
                {project.projectType === "professional" && project.company && (
                  <>
                    <span className="text-muted-foreground/40 text-xs font-light">
                      •
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400">
                      at {project.company}
                    </span>
                  </>
                )}
              </div>
            )}
            <CardDescription className="text-sm leading-relaxed text-muted-foreground mt-1.5">
              {project.description}
            </CardDescription>

            {project.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.techStack.slice(0, 5).map((tech) => {
                  const Icon = getSkillIcon(tech);
                  return (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-2 py-0.5 text-[0.7rem] transition-colors group-hover:bg-muted/70"
                    >
                      <Icon className="size-3" />
                      {tech}
                    </Badge>
                  );
                })}
                {project.techStack.length > 5 && (
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-[0.7rem]"
                  >
                    +{project.techStack.length - 5} more
                  </Badge>
                )}
              </div>
            ) : null}
          </CardHeader>
        </div>

        {/* Action Links */}
        {(project.liveUrl || project.githubUrl) && (
          <CardFooter className="flex flex-col gap-2 border-t border-border/50 bg-muted/10 sm:flex-row sm:flex-wrap pt-4">
            {project.liveUrl ? (
              <button
                onClick={(e) => handleExternalLink(e, project.liveUrl)}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full justify-center sm:w-auto sm:min-w-28 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 transition-all duration-300 shadow-sm hover:scale-[1.02] cursor-pointer",
                )}
              >
                <ExternalLink data-icon="inline-start" />
                Live Demo
              </button>
            ) : null}
            {project.githubUrl ? (
              <button
                onClick={(e) => handleExternalLink(e, project.githubUrl)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full justify-center sm:w-auto sm:min-w-28 transition-all duration-300 hover:scale-[1.02] hover:bg-muted/50 cursor-pointer",
                )}
              >
                <FaGithub data-icon="inline-start" />
                GitHub
              </button>
            ) : null}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"personal" | "professional">(
    "personal",
  );

  if (!projects.length) {
    return null;
  }

  // Filter projects by active category tab
  const filteredProjects = projects.filter(
    (p) => (p.projectType || "personal") === activeTab,
  );

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
          description="A few builds I'm proud of — from personal side projects to live professional software."
        />

        {/* Dynamic Capsule Tabs Switcher */}
        <div className="mt-8 flex justify-center gap-2.5 sm:mt-10 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={cn(
              "px-5 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all relative overflow-hidden cursor-pointer",
              activeTab === "personal"
                ? "border-teal-500/30 text-teal-600 bg-teal-500/5 dark:text-teal-400 dark:bg-teal-500/5"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/20",
            )}
          >
            Personal Builds
            {activeTab === "personal" && !reduceMotion && (
              <motion.span
                layoutId="projects-tab-pill"
                className="absolute inset-0 border border-teal-500 rounded-full pointer-events-none"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("professional")}
            className={cn(
              "px-5 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all relative overflow-hidden cursor-pointer",
              activeTab === "professional"
                ? "border-teal-500/30 text-teal-600 bg-teal-500/5 dark:text-teal-400 dark:bg-teal-500/5"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/20",
            )}
          >
            Professional Work
            {activeTab === "professional" && !reduceMotion && (
              <motion.span
                layoutId="projects-tab-pill"
                className="absolute inset-0 border border-teal-500 rounded-full pointer-events-none"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
          </button>
        </div>

        {/* Projects Grid Container with transitions */}
        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  variants={reduceMotion ? undefined : itemVariants}
                  initial={reduceMotion ? false : "hidden"}
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "h-full",
                    project.featured && "md:col-span-2 lg:col-span-2",
                  )}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))
            ) : (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-12 text-center text-sm text-muted-foreground"
              >
                No projects found in this category yet.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

export default Projects;
