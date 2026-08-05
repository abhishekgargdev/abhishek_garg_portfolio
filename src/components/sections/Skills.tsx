"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getSkillIcon } from "@/lib/skill-icons";
import type { SkillCategoryData, SkillData } from "@/lib/skills";
import { SectionHeading } from "@/components/layout/SectionHeading";

type SkillsProps = {
  categories: SkillCategoryData[];
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

function SkillCard({
  skill,
  reduceMotion,
}: {
  skill: SkillData;
  reduceMotion: boolean | null;
}) {
  const Icon = getSkillIcon(skill.iconKey);

  return (
    <motion.div
      variants={reduceMotion ? undefined : itemVariants}
      whileHover={reduceMotion ? {} : { y: -4, scale: 1.03 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group flex flex-col items-center justify-center text-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 select-none aspect-square min-h-[115px]",
        "hover:border-teal-500/25 hover:shadow-md hover:shadow-teal-500/[0.03] dark:hover:border-teal-500/20",
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-foreground/80 transition-transform duration-700 ease-in-out group-hover:rotate-[360deg] group-hover:bg-teal-500/5 group-hover:border-teal-500/20">
        <Icon
          className="size-5.5 transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400"
          aria-hidden
        />
      </span>
      <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight break-words max-w-full px-1">
        {skill.name}
      </p>
    </motion.div>
  );
}

function SkillGrid({
  skills,
  reduceMotion,
}: {
  skills: SkillData[];
  reduceMotion: boolean | null;
}) {
  if (!skills.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground select-none">
        No skills in this category yet.
      </div>
    );
  }

  return (
    <motion.div
      variants={reduceMotion ? undefined : containerVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5"
    >
      {skills.map((skill) => (
        <SkillCard
          key={`${skill.name}-${skill.iconKey}`}
          skill={skill}
          reduceMotion={reduceMotion}
        />
      ))}
    </motion.div>
  );
}

export function Skills({ categories }: SkillsProps) {
  const reduceMotion = useReducedMotion();
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories.length > 0 ? categories[0].id : "",
  );

  if (!categories.length) {
    return null;
  }

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0];

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative scroll-mt-20 bg-background py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Toolkit"
          title="Skills"
          description="Languages, frameworks, and tools I reach for most often."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] sm:mt-14 items-start">
          {/* Sidebar / Top navigation */}
          <div className="flex overflow-x-auto lg:overflow-x-visible pb-3.5 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r border-border/80 lg:pr-6 flex-row lg:flex-col gap-1.5 justify-start shrink-0 select-none">
            {categories.map((category) => {
              const isActive = activeCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={cn(
                    "relative flex items-center justify-between rounded-full lg:rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 outline-none cursor-pointer",
                    isActive
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  )}
                >
                  {isActive && !reduceMotion && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-teal-500/10 border border-teal-500/20 dark:bg-teal-500/20 dark:border-teal-500/30 rounded-full lg:rounded-xl z-0"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                      }}
                    />
                  )}

                  <span className="relative z-10">{category.categoryName}</span>

                  {category.skills?.length > 0 && (
                    <span
                      className={cn(
                        "relative z-10 ml-2 hidden lg:inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold border transition-colors",
                        isActive
                          ? "bg-teal-500 text-white border-transparent"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {category.skills.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid Panel area */}
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryId}
                initial={reduceMotion ? {} : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? {} : { opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="outline-none"
              >
                <SkillGrid
                  skills={activeCategory.skills}
                  reduceMotion={reduceMotion}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Skills;
