"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2, Briefcase } from "lucide-react";
import type { ExperienceData } from "@/lib/experience";
import { getSkillIcon } from "@/lib/skill-icons";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type WorkExperienceProps = {
  items: ExperienceData[];
};

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatMonthYear(startDate);
  if (!endDate) return `${start} — Present`;
  return `${start} — ${formatMonthYear(endDate)}`;
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function calculateDuration(startDateStr: string, endDateStr: string | null): string {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(" ") : "1 mo";
}

const bulletContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const bulletVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function WorkExperience({ items }: WorkExperienceProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items.length) {
    return null;
  }

  const activeItem = items[activeIndex] ?? items[0];
  const duration = calculateDuration(activeItem.startDate, activeItem.endDate);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative scroll-mt-20 overflow-hidden bg-muted/30 py-20 sm:py-28"
    >
      {/* Dynamic background glowing accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_right,_rgba(20,184,166,0.03),_transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 size-96 bg-[radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.03),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Work"
          title="Experience"
          description="Roles, impact, and the tools used along the way."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8 sm:mt-16">
          {/* Interactive Navigation Tabs */}
          <div className="flex flex-row gap-1 overflow-x-auto pb-3 scrollbar-none border-b border-border/60 md:col-span-4 md:flex-col md:overflow-x-visible md:pb-0 md:border-b-0 md:border-l md:border-border/60 pl-0.5">
            {items.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "relative flex flex-col items-start px-4 py-3 text-left transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer select-none",
                    "border-b-2 md:border-b-0 md:border-l-2 md:-ml-[2px] outline-none",
                    isActive
                      ? "border-teal-500 text-teal-600 dark:text-teal-400 font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  {/* Floating active tab background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-teal-500/5 dark:bg-teal-500/10 rounded-lg -z-10 hidden md:block"
                      transition={{ type: "spring" as const, stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="text-sm font-bold tracking-tight md:whitespace-normal md:leading-tight">
                    {item.role}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground/80 md:whitespace-normal">
                    {item.company}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Experience Details Deck */}
          <div className="md:col-span-8 min-h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md sm:p-7 md:p-8 dark:bg-card/40",
                  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-teal-500/0 before:transition-all before:duration-300 hover:before:border-teal-500/10",
                )}
              >
                {/* Subtle internal glowing decoration */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-gradient-to-br from-teal-500/5 to-sky-500/5 blur-3xl"
                />

                {/* Role Header */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {activeItem.role}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm font-medium text-muted-foreground">
                    <span className="text-foreground/90 font-semibold flex items-center gap-1.5">
                      <Briefcase className="size-4 text-teal-500" />
                      {activeItem.company}
                    </span>
                    <span className="hidden text-muted-foreground/30 sm:inline">·</span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3.5 text-sky-500" />
                      {formatDateRange(activeItem.startDate, activeItem.endDate)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-teal-500/10 text-[10px] font-bold text-teal-600 hover:bg-teal-500/15 dark:bg-teal-500/5 dark:text-teal-400 select-none border-none py-0.5 px-2"
                    >
                      {duration}
                    </Badge>
                  </div>
                </div>

                {/* Role Description Summary */}
                {activeItem.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90 dark:text-muted-foreground">
                    {activeItem.description}
                  </p>
                ) : null}

                {/* Achievements List */}
                {activeItem.bullets.length > 0 ? (
                  <motion.ul
                    variants={bulletContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-5 space-y-3"
                  >
                    {activeItem.bullets.map((bullet, bIndex) => (
                      <motion.li
                        key={`${activeItem.id}-bullet-${bIndex}`}
                        variants={bulletVariants}
                        className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-teal-500 select-none">
                          <CheckCircle2 className="size-4 opacity-85" />
                        </span>
                        <span>{bullet}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : null}

                {/* Technologies used in the active role */}
                {activeItem.techStack.length > 0 ? (
                  <div className="mt-6 border-t border-border/60 pt-5 dark:border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none">
                      Key Technologies
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {activeItem.techStack.map((tech) => {
                        const Icon = getSkillIcon(tech);
                        return (
                          <motion.div
                            key={tech}
                            whileHover={{ scale: 1.05 }}
                            transition={{
                              type: "spring" as const,
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1 text-xs font-normal border-border/80 bg-background/30 backdrop-blur-sm transition-all duration-300 select-none",
                                "hover:border-teal-500/30 hover:bg-teal-500/5 dark:hover:border-teal-500/20 dark:hover:bg-teal-950/20",
                              )}
                            >
                              <Icon className="size-3.5 text-muted-foreground transition-colors duration-300" />
                              {tech}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkExperience;
