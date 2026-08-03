"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AchievementData } from "@/lib/achievements";

type AchievementsProps = {
  items: AchievementData[];
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
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Achievements({ items }: AchievementsProps) {
  const reduceMotion = useReducedMotion();

  if (!items.length) {
    return null;
  }

  return (
    <section
      id="achievements"
      aria-labelledby="achievements-heading"
      className="relative bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Highlights
          </p>
          <h2
            id="achievements-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            Achievements
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:text-lg">
            Milestones and recognition along the way.
          </p>
        </div>

        <motion.div
          className={cn(
            "mt-12 flex gap-3 overflow-x-auto pb-2 sm:mt-14 sm:gap-5",
            "snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3",
            "[scrollbar-width:thin]",
          )}
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={reduceMotion ? undefined : itemVariants}
              className="w-[min(85vw,20rem)] shrink-0 snap-start md:w-auto"
            >
              <Card
                className={cn(
                  "relative h-full overflow-hidden border-0 bg-zinc-50/90 shadow-sm ring-zinc-200/80",
                  "transition-colors hover:ring-zinc-300",
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-amber-100/70 blur-2xl"
                />
                <CardHeader className="relative gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm">
                    <Trophy className="size-5" aria-hidden />
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium tracking-wide text-teal-700 uppercase">
                      {formatDate(item.date)}
                    </p>
                    <CardTitle className="text-lg leading-snug text-zinc-900 sm:text-xl">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-zinc-600">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Achievements;
