"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, Timer } from "lucide-react";
import {
  earliestPeriodStart,
  emptyDurationParts,
  periodsForRelevant,
  periodsForTotal,
  sumPeriodDurations,
  type DurationParts,
  type ExperienceTenureData,
} from "@/lib/experience-tenure-utils";
import { cn } from "@/lib/utils";

type ExperienceWatchesProps = {
  tenure: ExperienceTenureData | null;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function UnitCell({
  label,
  value,
  accent,
  isPlaceholder = false,
}: {
  label: string;
  value?: number;
  accent: string;
  isPlaceholder?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "relative flex min-w-[2.35rem] min-[375px]:min-w-[2.75rem] items-center justify-center rounded-xl border px-1 py-1.5 min-[375px]:px-2 min-[375px]:py-2 font-mono text-sm min-[375px]:text-lg font-semibold tabular-nums sm:min-w-[3.25rem] sm:text-xl md:text-2xl",
          "bg-background/80 shadow-sm backdrop-blur-sm",
          accent,
          isPlaceholder && "animate-pulse bg-muted/50 border-dashed text-transparent select-none",
        )}
      >
        {isPlaceholder ? "00" : pad(value ?? 0)}
      </div>
      <span className="text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

function AnalogRing({
  progress,
  colorClass,
  reduceMotion,
}: {
  progress: number;
  colorClass: string;
  reduceMotion: boolean | null;
}) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - clamped);

  return (
    <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        className="stroke-border/70"
        strokeWidth="4"
      />
      <motion.circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        className={colorClass}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={false}
        animate={{ strokeDashoffset: offset }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 60, damping: 18 }
        }
      />
    </svg>
  );
}

function WatchCard({
  label,
  subtitle,
  parts,
  variant,
  reduceMotion,
  isPlaceholder = false,
}: {
  label: string;
  subtitle: string;
  parts: DurationParts | null;
  variant: "total" | "relevant";
  reduceMotion: boolean | null;
  isPlaceholder?: boolean;
}) {
  const isTotal = variant === "total";
  const yearProgress = isPlaceholder || !parts ? 0.08 : Math.min(parts.months / 12, 1);
  const Icon = isTotal ? Timer : BriefcaseBusiness;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur-md sm:p-7",
        "ring-1 ring-black/5 dark:ring-white/10",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-3xl",
          isTotal ? "bg-teal-500/15" : "bg-sky-500/15",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-12 -left-8 size-36 rounded-full blur-3xl",
          isTotal ? "bg-emerald-500/10" : "bg-indigo-500/10",
        )}
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Live tenure
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {label}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full border shadow-sm",
              isTotal
                ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-400"
                : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-400",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
        </div>

        <div className="mx-auto grid size-40 place-items-center sm:size-44">
          <div className="relative size-full">
            <AnalogRing
              progress={yearProgress}
              colorClass={isTotal ? "stroke-teal-500" : "stroke-sky-500"}
              reduceMotion={reduceMotion}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p
                className={cn(
                  "font-mono text-4xl font-semibold tracking-tight text-foreground tabular-nums sm:text-5xl",
                  isPlaceholder && "animate-pulse bg-muted/50 rounded text-transparent px-2 select-none",
                )}
              >
                {isPlaceholder || !parts ? "0" : parts.years}
              </p>
              <p className="mt-0.5 text-[0.65rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Years
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 min-[375px]:gap-2 sm:gap-3">
          <UnitCell
            label="Mo"
            value={parts?.months}
            isPlaceholder={isPlaceholder}
            accent={
              isTotal
                ? "border-teal-200/80 dark:border-teal-900/40"
                : "border-sky-200/80 dark:border-sky-900/40"
            }
          />
          <UnitCell
            label="Days"
            value={parts?.days}
            isPlaceholder={isPlaceholder}
            accent="border-border"
          />
          <UnitCell
            label="Hrs"
            value={parts?.hours}
            isPlaceholder={isPlaceholder}
            accent="border-border"
          />
          <UnitCell
            label="Min"
            value={parts?.minutes}
            isPlaceholder={isPlaceholder}
            accent="border-border"
          />
          <UnitCell
            label="Sec"
            value={parts?.seconds}
            isPlaceholder={isPlaceholder}
            accent={
              isTotal
                ? "border-teal-300/80 text-teal-700 dark:border-teal-800 dark:text-teal-300"
                : "border-sky-300/80 text-sky-700 dark:border-sky-800 dark:text-sky-300"
            }
          />
        </div>
      </div>
    </motion.article>
  );
}

export function ExperienceWatches({ tenure }: ExperienceWatchesProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    if (!tenure || reduceMotion) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [tenure, reduceMotion]);

  const totalPeriods = useMemo(
    () => (tenure ? periodsForTotal(tenure.periods) : []),
    [tenure],
  );
  const relevantPeriods = useMemo(
    () => (tenure ? periodsForRelevant(tenure.periods) : []),
    [tenure],
  );

  const totalParts = useMemo(() => {
    if (!tenure || !now) return null;
    if (!totalPeriods.length) return emptyDurationParts();
    return sumPeriodDurations(totalPeriods, now);
  }, [tenure, totalPeriods, now]);

  const relevantParts = useMemo(() => {
    if (!tenure || !now) return null;
    if (!relevantPeriods.length) return emptyDurationParts();
    return sumPeriodDurations(relevantPeriods, now);
  }, [tenure, relevantPeriods, now]);

  if (!tenure) {
    return null;
  }

  if (!tenure.periods.length) {
    return null;
  }

  const earliestTotal = earliestPeriodStart(totalPeriods);
  const totalStartLabel = earliestTotal
    ? earliestTotal.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const totalCount = totalPeriods.length;
  const relevantCount = relevantPeriods.length;

  return (
    <section
      id="experience-clock"
      aria-labelledby="experience-clock-heading"
      className="relative scroll-mt-20 overflow-hidden bg-background py-16 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(14,165,233,0.08),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Career clock
          </p>
          <h2
            id="experience-clock-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Experience in motion
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Live tenure counters tracking total career time and role-relevant
            experience — updating every second.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6 lg:mt-14">
          <WatchCard
            label={tenure.totalLabel}
            subtitle={
              totalCount
                ? totalStartLabel
                  ? `Across ${totalCount} ${totalCount === 1 ? "period" : "periods"} · since ${totalStartLabel}`
                  : `Across ${totalCount} ${totalCount === 1 ? "period" : "periods"}`
                : "Add total periods in admin"
            }
            parts={totalParts}
            variant="total"
            reduceMotion={reduceMotion}
            isPlaceholder={!mounted || !now}
          />
          <WatchCard
            label={tenure.relevantLabel}
            subtitle={
              relevantCount
                ? `Across ${relevantCount} relevant ${relevantCount === 1 ? "role" : "roles"}`
                : "Add relevant periods in admin"
            }
            parts={relevantParts}
            variant="relevant"
            reduceMotion={reduceMotion}
            isPlaceholder={!mounted || !now}
          />
        </div>
      </div>
    </section>
  );
}

export default ExperienceWatches;
