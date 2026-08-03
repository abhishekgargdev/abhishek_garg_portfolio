"use client";

import type { ComponentType } from "react";
import CountUp from "react-countup";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Briefcase,
  Calendar,
  Folders,
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
  calendar: Calendar,
  folders: Folders,
  activity: Activity,
  users: Users,
  briefcase: Briefcase,
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

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.45,
        delay: reduceMotion ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card
        size="sm"
        className={cn(
          "h-full border-0 bg-white/80 shadow-sm ring-zinc-200/80 backdrop-blur-sm",
          "transition-colors hover:ring-zinc-300",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardDescription className="line-clamp-2 text-[0.65rem] tracking-wide text-zinc-500 uppercase sm:text-xs">
              {stat.label}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums sm:text-3xl lg:text-4xl">
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
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 sm:size-10">
            <Icon className="size-3.5 sm:size-4" aria-hidden />
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
      className="relative bg-zinc-100/70 py-16 sm:py-20"
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
