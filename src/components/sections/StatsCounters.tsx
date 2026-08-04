"use client";

import type { ComponentType } from "react";
import CountUp from "react-countup";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Briefcase,
  CalendarClock,
  FolderGit2,
  type LucideProps,
  Users,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatData } from "@/lib/stats";

type StatsCountersProps = {
  stats: StatData[];
};

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  calendar: CalendarClock,
  folders: FolderGit2,
  activity: Activity,
  users: Users,
  briefcase: Briefcase,
};

const CARD_THEMES = [
  {
    // Experience
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
    glow: "bg-blue-500/10",
  },
  {
    // Projects
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  {
    // Uptime
    badge: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-400",
    glow: "bg-violet-500/10",
  },
  {
    // Mentoring
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
    glow: "bg-amber-500/10",
  },
];

const defaultTheme = {
  badge: "border-border bg-muted/50 text-foreground/80",
  glow: "bg-foreground/5",
};

function resolveIcon(iconKey: string): ComponentType<LucideProps> {
  return ICON_MAP[iconKey.toLowerCase()] ?? Briefcase;
}

function decimalsFor(value: number): number {
  if (Number.isInteger(value)) return 0;
  const parts = String(value).split(".");
  return Math.min(parts[1]?.length ?? 0, 2);
}

function StatCard({
  stat,
  index,
  reduceMotion,
}: {
  stat: StatData;
  index: number;
  reduceMotion: boolean | null;
}) {
  const Icon = resolveIcon(stat.iconKey);
  const decimals = decimalsFor(stat.value);
  const theme = CARD_THEMES[index] ?? defaultTheme;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card
        size="sm"
        className={cn(
          "h-full border border-border bg-card/80 shadow-sm backdrop-blur-sm relative overflow-hidden",
          "transition-all duration-300 hover:shadow-md hover:border-foreground/20 hover:-translate-y-1",
        )}
      >
        <div className={cn("absolute -right-6 -top-6 size-16 rounded-full blur-xl pointer-events-none opacity-40", theme.glow)} />
        <CardHeader className="flex flex-row items-start justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <CardDescription className="line-clamp-2 text-[0.65rem] tracking-wide text-muted-foreground uppercase sm:text-xs">
              {stat.label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl lg:text-4xl">
              {reduceMotion ? (
                <span>
                  {stat.value}
                  {stat.suffix}
                </span>
              ) : (
                <CountUp
                  end={stat.value}
                  decimals={decimals}
                  duration={1.6}
                  suffix={stat.suffix}
                  enableScrollSpy
                  scrollSpyOnce
                  scrollSpyDelay={100}
                />
              )}
            </CardTitle>
          </div>
          <span className={cn("flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-300", theme.badge)}>
            <Icon className="size-4 sm:size-4.5" aria-hidden />
          </span>
        </CardHeader>
      </Card>
    </motion.div>
  );
}

export function StatsCounters({ stats }: StatsCountersProps) {
  const reduceMotion = useReducedMotion();

  if (!stats.length) {
    return null;
  }

  return (
    <section
      id="stats"
      aria-labelledby="stats-heading"
      className="relative scroll-mt-20 bg-muted/40 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <h2 id="stats-heading" className="sr-only">
          Portfolio stats
        </h2>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsCounters;
