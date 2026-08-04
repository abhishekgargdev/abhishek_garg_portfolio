"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EducationData } from "@/lib/education";
import { SectionHeading } from "@/components/layout/SectionHeading";

type EducationProps = {
  items: EducationData[];
};

const EDUCATION_THEMES = {
  math: {
    icon: Calculator,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  default: {
    icon: GraduationCap,
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
  },
};

function getEducationTheme(degree: string) {
  const deg = degree.toLowerCase();
  if (deg.includes("mathematics") || deg.includes("math")) {
    return EDUCATION_THEMES.math;
  }
  return EDUCATION_THEMES.default;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
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

export function Education({ items }: EducationProps) {
  const reduceMotion = useReducedMotion();

  if (!items.length) {
    return null;
  }

  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="relative scroll-mt-20 bg-background py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Learning"
          title="Education"
          description="Degrees and highlights that shaped the foundation of my work."
        />

        <motion.div
          className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => {
            const theme = getEducationTheme(item.degree);
            const Icon = theme.icon;

            return (
              <motion.div
                key={item.id}
                variants={reduceMotion ? undefined : itemVariants}
              >
                <Card
                  className={cn(
                    "h-full border border-border bg-card/80 shadow-sm backdrop-blur-sm",
                    "transition-all duration-300 hover:shadow-md hover:border-foreground/20 hover:-translate-y-1 group",
                  )}
                >
                  <CardHeader className="flex flex-row items-start gap-4">
                    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-105", theme.badge)}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <CardDescription className="text-xs font-semibold tracking-wide text-teal-600 uppercase">
                        {item.year}
                      </CardDescription>
                      <CardTitle className="text-lg leading-snug text-foreground sm:text-xl transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {item.degree}
                      </CardTitle>
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.institution}
                      </p>
                    </div>
                  </CardHeader>

                  {item.highlights.length > 0 ? (
                    <CardContent>
                      <ul className="space-y-2 border-t border-border/50 pt-4">
                        {item.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                          >
                            <span
                              aria-hidden
                              className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                            />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  ) : null}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Education;
