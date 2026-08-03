"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EducationData } from "@/lib/education";

type EducationProps = {
  items: EducationData[];
};

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
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Learning
          </p>
          <h2
            id="education-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Education
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Degrees and highlights that shaped the foundation of my work.
          </p>
        </div>

        <motion.div
          className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={reduceMotion ? undefined : itemVariants}
            >
              <Card
                className={cn(
                  "h-full border-0 bg-muted/50 shadow-sm ring-border",
                  "transition-colors hover:ring-border",
                )}
              >
                <CardHeader className="flex flex-row items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground/80">
                    <GraduationCap className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <CardDescription className="text-xs font-medium tracking-wide text-teal-700 uppercase">
                      {item.year}
                    </CardDescription>
                    <CardTitle className="text-lg leading-snug text-foreground sm:text-xl">
                      {item.degree}
                    </CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.institution}
                    </p>
                  </div>
                </CardHeader>

                {item.highlights.length > 0 ? (
                  <CardContent>
                    <ul className="space-y-2 border-t border-border pt-4">
                      {item.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
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
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Education;
