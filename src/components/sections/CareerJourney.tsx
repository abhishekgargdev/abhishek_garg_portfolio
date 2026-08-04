"use client";

import { type ComponentType, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useInView } from "framer-motion";
import { Briefcase, Rocket, Star, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineEntryData } from "@/lib/timeline";
import { SectionHeading } from "@/components/layout/SectionHeading";

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

function EntryCard({
  entry,
  isLeft,
  reduceMotion,
}: {
  entry: TimelineEntryData;
  isLeft: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card/85 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:max-w-md hover:shadow-md hover:border-foreground/20 hover:-translate-y-1 transition-all duration-300 group"
    >
      <p className="text-xs font-semibold tracking-wide text-teal-600 uppercase">
        {formatDateRange(entry.startDate, entry.endDate)}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
        {entry.role}
      </h3>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{entry.company}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {entry.description}
      </p>
    </motion.div>
  );
}

function MilestoneDot({
  kind,
  Icon,
  reduceMotion,
  isInView,
}: {
  kind: MilestoneKind;
  Icon: ComponentType<LucideProps>;
  reduceMotion: boolean | null;
  isInView: boolean;
}) {
  return (
    <motion.span
      className={cn(
        "relative z-10 flex size-10 items-center justify-center rounded-full border bg-card text-foreground/80 shadow-sm lg:size-11 transition-all duration-500",
        isInView ? "border-teal-500 text-teal-600 ring-4 ring-teal-500/10" : "border-border text-foreground/70"
      )}
      initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {isInView && !reduceMotion && (
        <span className="absolute inset-0 rounded-full animate-ping bg-teal-500/10 opacity-75" />
      )}
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

  const itemRef = useRef<HTMLLIElement>(null);
  const isInView = useInView(itemRef, { once: false, amount: 0.3 });

  return (
    <motion.li
      ref={itemRef}
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
        <MilestoneDot kind={kind} Icon={Icon} reduceMotion={reduceMotion} isInView={isInView} />
      </div>

      {/* Desktop left */}
      <div
        className={cn(
          "hidden lg:flex",
          isLeft ? "justify-end" : "justify-end opacity-0",
        )}
        aria-hidden={!isLeft}
      >
        {isLeft ? <EntryCard entry={entry} isLeft={true} reduceMotion={reduceMotion} /> : null}
      </div>

      {/* Desktop center spine icon */}
      <div className="relative hidden justify-center pt-1 lg:flex">
        <MilestoneDot kind={kind} Icon={Icon} reduceMotion={reduceMotion} isInView={isInView} />
      </div>

      {/* Desktop right */}
      <div
        className={cn("hidden lg:flex", !isLeft ? "justify-start" : "opacity-0")}
        aria-hidden={isLeft}
      >
        {!isLeft ? <EntryCard entry={entry} isLeft={false} reduceMotion={reduceMotion} /> : null}
      </div>

      {/* Mobile / tablet card */}
      <div className="lg:hidden">
        <EntryCard entry={entry} isLeft={false} reduceMotion={reduceMotion} />
      </div>
    </motion.li>
  );
}

export function CareerJourney({ entries }: CareerJourneyProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (!entries.length) {
    return null;
  }

  return (
    <section
      id="journey"
      aria-labelledby="career-journey-heading"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 md:px-10" ref={containerRef}>
        <SectionHeading
          eyebrow="Path"
          title="Career journey"
          description="Roles, milestones, and the steps that shaped how I build."
        />

        <div className="relative mt-14 sm:mt-16">
          {/* Connecting vertical line drawing downward on scroll */}
          {reduceMotion ? (
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-5 w-px bg-border lg:left-1/2 lg:-translate-x-px"
            />
          ) : (
            <motion.div
              aria-hidden
              style={{ scaleY, originY: 0 }}
              className="absolute top-2 bottom-2 left-5 w-px bg-gradient-to-b from-teal-500 via-sky-500 to-indigo-500 lg:left-1/2 lg:-translate-x-px"
            />
          )}

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
