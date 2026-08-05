"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
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
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const gallery =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : project.imageUrl
        ? [project.imageUrl]
        : [];

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIdx((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, gallery.length]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-full bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.06),_rgba(14,165,233,0.04),_transparent_70%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 pt-8 sm:px-6 md:px-10">
        {/* Back Link */}
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-8 select-none"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12"
        >
          {/* Cover / Main Image */}
          <div className="md:col-span-7 relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm group cursor-pointer"
               onClick={() => gallery.length > 0 && setLightboxOpen(true)}>
            {gallery.length > 0 ? (
              <Image
                src={gallery[activeImageIdx]}
                alt={project.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-500 group-hover:scale-102"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-500/20 to-sky-500/20 text-muted-foreground font-mono text-sm uppercase">
                {project.title}
              </div>
            )}
            
            {gallery.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white font-mono select-none">
                {activeImageIdx + 1} / {gallery.length}
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="md:col-span-5 flex flex-col justify-between h-full gap-5">
            <div>
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {project.category && (
                  <Badge variant="outline" className="border-teal-500/30 bg-teal-500/5 text-teal-600 dark:text-teal-400 font-semibold text-[10px] uppercase select-none">
                    {project.category}
                  </Badge>
                )}
                {project.status && (
                  <Badge
                    className={cn(
                      "text-[10px] font-bold border-none uppercase py-0.5 px-2 select-none",
                      project.status === "completed"
                        ? "bg-teal-500 text-white"
                        : project.status === "ongoing"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-500 text-white"
                    )}
                  >
                    {project.status === "completed" ? "Completed" : project.status === "ongoing" ? "In Progress" : "Concept"}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {project.title}
              </h1>
              {project.projectType === "professional" && project.company && (
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1 select-none flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  Built at {project.company}
                </p>
              )}

              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              {/* Meta Roles */}
              <div className="mt-6 space-y-2.5 text-sm font-medium border-y border-border/60 py-4 dark:border-white/5">
                {project.role && (
                  <div className="flex items-center gap-2 text-foreground/90">
                    <User className="size-4.5 text-teal-500 shrink-0" />
                    <span className="text-muted-foreground mr-1.5">My Role:</span>
                    {project.role}
                  </div>
                )}
                {project.projectType === "professional" && project.teamSize && (
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Users className="size-4.5 text-indigo-500 shrink-0" />
                    <span className="text-muted-foreground mr-1.5">Team Size:</span>
                    {project.teamSize}
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center gap-2 text-foreground/90">
                    <Calendar className="size-4.5 text-sky-500 shrink-0" />
                    <span className="text-muted-foreground mr-1.5">Duration:</span>
                    {project.duration}
                  </div>
                )}
              </div>
            </div>

            {/* Links buttons */}
            <div className="flex flex-wrap gap-3 mt-2">
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "flex-1 min-w-[130px] justify-center bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 transition-all duration-300 shadow-sm"
                  )}
                >
                  <ExternalLink data-icon="inline-start" />
                  Live Demo
                </Link>
              )}
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "flex-1 min-w-[130px] justify-center hover:bg-muted/50 transition-all duration-300"
                  )}
                >
                  <FaGithub data-icon="inline-start" />
                  GitHub Repository
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Thumbnail slider (if multi-images exist) */}
        {gallery.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-12 scrollbar-none"
          >
            {gallery.map((url, index) => (
              <button
                key={url}
                onClick={() => setActiveImageIdx(index)}
                className={cn(
                  "relative aspect-video w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all duration-300 outline-none cursor-pointer",
                  activeImageIdx === index
                    ? "border-teal-500 scale-95 shadow-sm"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </motion.div>
        )}

        {/* Story details layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Case study panels (Problem, Solution, Video) */}
          <div className="md:col-span-8 space-y-8">
            {/* Problem & Solution side-by-side or stacked card */}
            {(project.problem || project.solution) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {project.problem && (
                  <div className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/80" />
                    <h3 className="text-lg font-bold text-foreground mb-2.5 flex items-center gap-2 select-none">
                      <Info className="size-4.5 text-amber-500" />
                      The Challenge
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {project.problem}
                    </p>
                  </div>
                )}
                {project.solution && (
                  <div className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500/80" />
                    <h3 className="text-lg font-bold text-foreground mb-2.5 flex items-center gap-2 select-none">
                      <Sparkles className="size-4.5 text-teal-500" />
                      The Solution
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {project.solution}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Video Demonstration Iframe */}
            {project.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/80 bg-card/40 p-4 shadow-sm backdrop-blur-sm"
              >
                <h3 className="text-lg font-bold text-foreground mb-3 px-1 select-none">
                  Project Demonstration
                </h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner">
                  <iframe
                    src={project.videoUrl}
                    title="Project Demo Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 size-full border-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Key Features checklist */}
            {project.features && project.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-8"
              >
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 select-none">
                  <Layers className="size-4.5 text-sky-500" />
                  Key Features
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {project.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-0.5 text-teal-500 shrink-0 select-none">
                        <CheckCircle2 className="size-4 opacity-80" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Responsibilities list */}
            {project.projectType === "professional" && project.responsibilities && project.responsibilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm backdrop-blur-sm sm:p-8"
              >
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 select-none">
                  <Briefcase className="size-4.5 text-teal-500" />
                  Key Responsibilities
                </h3>
                <ul className="grid grid-cols-1 gap-3">
                  {project.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 text-teal-500 shrink-0 select-none">
                        <span className="block size-1.5 rounded-full bg-teal-500/80" />
                      </span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Sidebar (Results KPI, Tech Stack) */}
          <div className="md:col-span-4 space-y-6">
            {/* Impact Metric statistics counters */}
            {project.results && project.results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {project.results.map((metric, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-2xl border border-border/80 bg-gradient-to-br from-card to-muted/10 p-5 shadow-sm hover:border-teal-500/10 transition-all duration-300"
                  >
                    <p className="font-mono text-3xl font-extrabold tracking-tight text-teal-500 sm:text-4xl">
                      {metric.value}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mt-1 select-none">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Core Technologies Used */}
            {project.techStack && project.techStack.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border/80 bg-card/40 p-6 shadow-sm backdrop-blur-sm"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground select-none mb-3">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => {
                    const Icon = getSkillIcon(tech);
                    return (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-normal border-border/80 bg-background/30 backdrop-blur-sm select-none"
                      >
                        <Icon className="size-3.5 text-muted-foreground" />
                        {tech}
                      </Badge>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Recommended More Projects */}
        {recommended.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 border-t border-border pt-12 dark:border-white/5"
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground select-none">
              Explore More Projects
            </h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              {recommended.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/projects/${rec.slug}`}
                  className="group block rounded-xl border border-border bg-card/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-teal-500/10 dark:bg-card/30"
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider text-teal-500 select-none">
                    {rec.category || "Case Study"}
                  </p>
                  <h3 className="text-base font-bold text-foreground mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed truncate">
                    {rec.description}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox Overlays Portal */}
      <AnimatePresence>
        {lightboxOpen && gallery.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-sm cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 outline-none cursor-pointer"
            >
              <X className="size-6" />
            </button>

            {/* Slider container */}
            <div className="relative flex w-full max-w-4xl flex-1 items-center justify-center">
              {gallery.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 z-10 rounded-full bg-black/60 p-2.5 text-white/80 hover:text-white hover:bg-black/90 outline-none cursor-pointer"
                  title="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </button>
              )}

              <div className="relative h-[70vh] w-full">
                <Image
                  src={gallery[activeImageIdx]}
                  alt={`Full size active image`}
                  fill
                  sizes="100vw"
                  className="object-contain select-none"
                />
              </div>

              {gallery.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 z-10 rounded-full bg-black/60 p-2.5 text-white/80 hover:text-white hover:bg-black/90 outline-none cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight className="size-6" />
                </button>
              )}
            </div>

            {/* Status Info Footer */}
            <div className="mt-4 text-sm text-white/60 font-mono select-none">
              {activeImageIdx + 1} of {gallery.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
