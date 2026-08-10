"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Trophy,
  Award,
  Users,
  Star,
  Mic,
  Zap,
  Sparkles,
  Maximize2,
  X as XIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AchievementData } from "@/lib/achievements";
import { SectionHeading } from "@/components/layout/SectionHeading";

type AchievementsProps = {
  items: AchievementData[];
};

interface BadgeTheme {
  icon: LucideIcon;
  badgeClass: string;
  glowClass: string;
}

function getAchievementTheme(title: string): BadgeTheme {
  const lowercaseTitle = title.toLowerCase();

  if (lowercaseTitle.includes("speaker") || lowercaseTitle.includes("guest") || lowercaseTitle.includes("distinguished")) {
    return {
      icon: Mic,
      badgeClass: "border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 dark:border-sky-900/50 dark:from-sky-950/30 dark:to-sky-950/60 dark:text-sky-400",
      glowClass: "bg-sky-500/10",
    };
  }
  if (lowercaseTitle.includes("spirit") || lowercaseTitle.includes("team")) {
    return {
      icon: Users,
      badgeClass: "border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 dark:border-teal-900/50 dark:from-teal-950/30 dark:to-teal-950/60 dark:text-teal-400",
      glowClass: "bg-teal-500/10",
    };
  }
  if (lowercaseTitle.includes("rank") || lowercaseTitle.includes("math")) {
    return {
      icon: Star,
      badgeClass: "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-amber-950/60 dark:text-amber-400",
      glowClass: "bg-amber-500/10",
    };
  }
  if (lowercaseTitle.includes("beginner") || lowercaseTitle.includes("bright")) {
    return {
      icon: Zap,
      badgeClass: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 dark:border-purple-900/50 dark:from-purple-950/30 dark:to-purple-950/60 dark:text-purple-400",
      glowClass: "bg-purple-500/10",
    };
  }
  if (lowercaseTitle.includes("valuable") || lowercaseTitle.includes("contributor")) {
    return {
      icon: Sparkles,
      badgeClass: "border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 dark:border-pink-900/50 dark:from-pink-950/30 dark:to-pink-950/60 dark:text-pink-400",
      glowClass: "bg-pink-500/10",
    };
  }
  return {
    icon: Award,
    badgeClass: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-indigo-950/60 dark:text-indigo-400",
    glowClass: "bg-indigo-500/10",
  };
}

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Achievements({ items }: AchievementsProps) {
  const reduceMotion = useReducedMotion();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!items.length) {
    return null;
  }

  return (
    <section
      id="achievements"
      aria-labelledby="achievements-heading"
      className="relative scroll-mt-20 bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Highlights"
          title="Achievements"
          description="Milestones and recognition along the way."
        />

        <motion.div
          className={cn(
            "mt-12 flex gap-4 overflow-x-auto pb-4 sm:mt-14 sm:gap-5",
            "snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3",
            "[scrollbar-width:thin]",
          )}
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => {
            const theme = getAchievementTheme(item.title);
            const Icon = theme.icon;

            return (
              <motion.div
                key={item.id}
                variants={reduceMotion ? undefined : itemVariants}
                className="w-[min(85vw,20rem)] shrink-0 snap-start md:w-auto"
              >
                <Card
                  className={cn(
                    "relative h-full overflow-hidden border border-border bg-card/85 shadow-sm backdrop-blur-sm flex flex-col",
                    "transition-all duration-300 hover:shadow-md hover:border-foreground/20 hover:-translate-y-1.5 group",
                  )}
                >
                  {/* Subtle CSS shine sweep line */}
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {item.imageUrl && (
                    <div
                      className="relative aspect-[16/10] w-full overflow-hidden bg-muted border-b border-border/50 cursor-pointer"
                      onClick={() => setSelectedImage(item.imageUrl!)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-black shadow-md backdrop-blur translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                          View Certificate
                          <Maximize2 className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    aria-hidden
                    className={cn("pointer-events-none absolute -right-6 -top-6 size-24 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-60", theme.glowClass)}
                  />

                  <CardHeader className="relative gap-3 relative z-10 flex-1">
                    <span className={cn("flex size-11 items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-105", theme.badgeClass)}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold tracking-wide text-teal-600 uppercase">
                        {formatDate(item.date)}
                      </p>
                      <CardTitle className="text-lg leading-snug text-foreground sm:text-xl transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <DialogPrimitive.Root open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md duration-300 data-[open]:animate-in data-[open]:fade-in-0 data-[closed]:animate-out data-[closed]:fade-out-0" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl p-4 outline-none focus:outline-none flex flex-col items-center justify-center data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 duration-200">
            {selectedImage && (
              <div className="relative max-h-[85vh] w-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Certificate Preview"
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg border border-white/10 shadow-2xl"
                />
                <DialogPrimitive.Close className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-full outline-none focus:outline-none">
                  <XIcon className="size-5" />
                </DialogPrimitive.Close>
              </div>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}

export default Achievements;
