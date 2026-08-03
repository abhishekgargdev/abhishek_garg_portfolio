"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/30">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground/80">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {skill.name}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {skill.proficiency}%
          </p>
        </div>
      </div>
      <SkillProgress value={skill.proficiency} reduceMotion={reduceMotion} />
    </div>
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

  if (!categories.length) {
    return null;
  }

  const defaultValue = categoryValue(
    categories[0].categoryName,
    categories[0].id,
  );

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative scroll-mt-20 bg-muted/50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Toolkit
          </p>
          <h2
            id="skills-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Skills
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Languages, frameworks, and tools I reach for most often.
          </p>
        </div>

        <Tabs defaultValue={defaultValue} className="mt-12 sm:mt-14">
          <TabsList
            variant="line"
            className="mx-auto flex h-auto w-full max-w-4xl flex-wrap justify-center gap-1 bg-transparent p-0"
          >
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={categoryValue(category.categoryName, category.id)}
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm"
              >
                {category.categoryName}
              </TabsTrigger>
            ))}
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
