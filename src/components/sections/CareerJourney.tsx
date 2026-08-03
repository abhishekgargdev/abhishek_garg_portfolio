"use client";

import type { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Briefcase, Rocket, Star, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineEntryData } from "@/lib/timeline";

type CareerJourneyProps = {
  entries: TimelineEntryData[];
};

type MilestoneKind = "start" | "promotion" | "role";

const PROMOTION_PATTERN =
  /\b(promot(ed|ion)|senior|lead|principal|staff|manager|director|head|architect)\b/i;

function getMilestoneKind(
  entry: TimelineEntryData,
  index: number,
  total: number,
): MilestoneKind {
  if (index === 0) return "start";
  if (PROMOTION_PATTERN.test(entry.role)) return "promotion";
  if (index === total - 1 && !entry.endDate) return "promotion";
  return "role";
}

const MILESTONE_ICON: Record<MilestoneKind, ComponentType<LucideProps>> = {
  start: Rocket,
  promotion: Star,
  role: Briefcase,
};

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatMonthYear(startDate);
  if (!endDate) return `${start} — Present`;
  return `${start} — ${formatMonthYear(endDate)}`;
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function EntryCard({ entry }: { entry: TimelineEntryData }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:max-w-md">
      <p className="text-xs font-medium tracking-wide text-teal-700 uppercase">
        {formatDateRange(entry.startDate, entry.endDate)}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {entry.role}
      </h3>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{entry.company}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {entry.description}
      </p>
    </div>
  );
}

function MilestoneDot({
  kind,
  Icon,
  reduceMotion,
}: {
  kind: MilestoneKind;
  Icon: ComponentType<LucideProps>;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.span
      className="relative z-10 flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground/80 shadow-sm lg:size-11"
      initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon className="size-4" aria-hidden />
      <span className="sr-only">
        {kind === "start"
          ? "Career start"
          : kind === "promotion"
            ? "Milestone"
            : "Role"}
      </span>
    </motion.span>
  );
}

function TimelineItem({
  entry,
  index,
  total,
  reduceMotion,
}: {
  entry: TimelineEntryData;
  index: number;
  total: number;
  reduceMotion: boolean | null;
}) {
  const isLeft = index % 2 === 0;
  const kind = getMilestoneKind(entry, index, total);
  const Icon = MILESTONE_ICON[kind];

  return (
    <motion.li
      className="relative grid grid-cols-[2.5rem_1fr] gap-4 md:gap-6 lg:grid-cols-[1fr_3.5rem_1fr] lg:gap-8"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Mobile icon rail */}
      <div className="relative flex justify-center pt-1 lg:hidden">
        <MilestoneDot kind={kind} Icon={Icon} reduceMotion={reduceMotion} />
      </div>

      {/* Desktop left */}
      <div
        className={cn(
          "hidden lg:flex",
          isLeft ? "justify-end" : "justify-end opacity-0",
        )}
        aria-hidden={!isLeft}
      >
        {isLeft ? <EntryCard entry={entry} /> : null}
      </div>

      {/* Desktop center spine icon */}
      <div className="relative hidden justify-center pt-1 lg:flex">
        <MilestoneDot kind={kind} Icon={Icon} reduceMotion={reduceMotion} />
      </div>

      {/* Desktop right */}
      <div
        className={cn("hidden lg:flex", !isLeft ? "justify-start" : "opacity-0")}
        aria-hidden={isLeft}
      >
        {!isLeft ? <EntryCard entry={entry} /> : null}
      </div>

      {/* Mobile / tablet card */}
      <div className="lg:hidden">
        <EntryCard entry={entry} />
      </div>
    </motion.li>
  );
}

export function CareerJourney({ entries }: CareerJourneyProps) {
  const reduceMotion = useReducedMotion();

  if (!entries.length) {
    return null;
  }

  return (
    <section
      id="journey"
      aria-labelledby="career-journey-heading"
      className="relative scroll-mt-20 overflow-hidden bg-muted/50 py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Path
          </p>
          <h2
            id="career-journey-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Career journey
          </h2>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Roles, milestones, and the steps that shaped how I build.
          </p>
        </div>

        <div className="relative mt-14 sm:mt-16">
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-5 w-px bg-gradient-to-b from-border via-border to-border/80 lg:left-1/2 lg:-translate-x-px"
          />

          <ol className="relative flex flex-col gap-10 sm:gap-12">
            {entries.map((entry, index) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                index={index}
                total={entries.length}
                reduceMotion={reduceMotion}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default CareerJourney;
