"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import CountUp from "react-countup";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getSkillIcon } from "@/lib/skill-icons";
import type { SkillCategoryData, SkillData } from "@/lib/skills";
import { SectionHeading } from "@/components/layout/SectionHeading";

type SkillsProps = {
  categories: SkillCategoryData[];
};

function categoryValue(name: string, id: string): string {
  return `${name}-${id}`.toLowerCase().replace(/\s+/g, "-");
}

function SkillProgress({
  value,
  reduceMotion,
}: {
  value: number;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [displayValue, setDisplayValue] = useState(
    reduceMotion ? value : 0,
  );

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }
    if (isInView) {
      setDisplayValue(value);
    }
  }, [isInView, reduceMotion, value]);

  return (
    <div ref={ref} className="w-full">
      <Progress
        value={displayValue}
        className={cn(
          "w-full gap-1.5 [&_[data-slot=progress-track]]:h-1.5",
          "[&_[data-slot=progress-indicator]]:duration-700 [&_[data-slot=progress-indicator]]:ease-out",
          "[&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-teal-500 [&_[data-slot=progress-indicator]]:to-indigo-500"
        )}
      />
    </div>
  );
}

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
      whileHover={reduceMotion ? {} : { y: -5 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground/80 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {skill.name}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground font-medium">
            {reduceMotion ? (
              <span>{skill.proficiency}%</span>
            ) : (
              <CountUp
                end={skill.proficiency}
                duration={1.5}
                suffix="%"
                enableScrollSpy
                scrollSpyOnce
              />
            )}
          </p>
        </div>
      </div>
      <SkillProgress value={skill.proficiency} reduceMotion={reduceMotion} />
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
      <p className="py-8 text-center text-sm text-muted-foreground">
        No skills in this category yet.
      </p>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
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

  const defaultValue = categories.length > 0
    ? categoryValue(categories[0].categoryName, categories[0].id)
    : "";

  const [activeTab, setActiveTab] = useState(defaultValue);

  if (!categories.length) {
    return null;
  }

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-12 sm:mt-14">
          <TabsList
            variant="line"
            className="mx-auto flex h-auto w-full max-w-4xl flex-wrap justify-center gap-1 bg-transparent p-0"
          >
            {categories.map((category) => {
              const value = categoryValue(category.categoryName, category.id);
              const isActive = activeTab === value;
              return (
                <TabsTrigger
                  key={category.id}
                  value={value}
                  className="relative rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors hover:text-foreground/80 data-active:text-teal-600 dark:data-active:text-teal-400 group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
                >
                  {isActive && !reduceMotion && (
                    <motion.span
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-teal-500/10 border border-teal-500/20 dark:bg-teal-500/20 dark:border-teal-500/30 rounded-full z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{category.categoryName}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent
              key={category.id}
              value={categoryValue(category.categoryName, category.id)}
              className="mt-8 outline-none"
            >
              <SkillGrid
                skills={category.skills}
                reduceMotion={reduceMotion}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

export default Skills;
