"use client";

import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  Award,
  Briefcase,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Trophy,
  type LucideProps,
} from "lucide-react";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  JOURNEY_TYPES,
  JOURNEY_TYPE_LABELS,
  JOURNEY_TYPE_LABELS_PLURAL,
  type JourneyItem,
  type JourneyType,
} from "@/lib/journey-types";
import { cn } from "@/lib/utils";

type CareerJourneyProps = {
  items: JourneyItem[];
};

const INITIAL_VISIBLE = 8;

const TYPE_ICON: Record<JourneyType, ComponentType<LucideProps>> = {
  experience: Briefcase,
  education: GraduationCap,
  certification: Award,
  achievement: Trophy,
};

const TYPE_ACCENT: Record<
  JourneyType,
  {
    text: string;
    border: string;
    ring: string;
    soft: string;
    badge: string;
    glow: string;
    hoverBorder: string;
  }
> = {
  experience: {
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500",
    ring: "ring-teal-500/20",
    soft: "from-teal-500/12 via-transparent to-transparent",
    badge: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
    glow: "bg-teal-500/20",
    hoverBorder: "hover:border-teal-500/40 hover:shadow-teal-500/10",
  },
  education: {
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
    ring: "ring-blue-500/20",
    soft: "from-blue-500/12 via-transparent to-transparent",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
    glow: "bg-blue-500/20",
    hoverBorder: "hover:border-blue-500/40 hover:shadow-blue-500/10",
  },
  certification: {
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500",
    ring: "ring-violet-500/20",
    soft: "from-violet-500/12 via-transparent to-transparent",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    glow: "bg-violet-500/20",
    hoverBorder: "hover:border-violet-500/40 hover:shadow-violet-500/10",
  },
  achievement: {
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500",
    ring: "ring-amber-500/20",
    soft: "from-amber-500/12 via-transparent to-transparent",
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    glow: "bg-amber-500/20",
    hoverBorder: "hover:border-amber-500/40 hover:shadow-amber-500/10",
  },
};

function formatDateRange(
  type: JourneyType,
  startDate: string,
  endDate?: string | null,
): string {
  const start = formatMonthYear(startDate);

  if (type === "education" || type === "certification" || type === "achievement") {
    // Single-date style events
    if (!endDate || start === formatMonthYear(endDate)) {
      return start;
    }
  }

  if (!endDate) return `${start} — Present`;
  const end = formatMonthYear(endDate);
  if (start === end) return start;
  return `${start} — ${end}`;
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function TruncatedText({
  text,
  maxChars = 160,
}: {
  text: string;
  maxChars?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = text.length > maxChars;

  if (!needsTruncate) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
    );
  }

  return (
    <div className="mt-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {expanded ? text : `${text.slice(0, maxChars).trimEnd()}…`}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-1.5 text-xs font-medium text-foreground/70 underline-offset-4 hover:underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

function EntryCard({
  item,
  isLeft,
  reduceMotion,
  index,
}: {
  item: JourneyItem;
  isLeft: boolean;
  reduceMotion: boolean | null;
  index: number;
}) {
  const accent = TYPE_ACCENT[item.type];
  const Icon = TYPE_ICON[item.type];
  const highlights = item.highlights ?? [];
  const extraHighlights = Math.max(0, highlights.length - 1);

  return (
    <motion.article
      layout
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, x: isLeft ? -40 : 40, y: 16 }
      }
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0.25 : 0.55,
        delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -4, transition: { duration: 0.22 } }
      }
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:max-w-md",
        "transition-[border-color,box-shadow] duration-300 hover:shadow-lg",
        accent.hoverBorder,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          accent.soft,
        )}
      />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn("gap-1 border-transparent pl-1.5", accent.badge)}
          >
            <Icon className="size-3" aria-hidden />
            {JOURNEY_TYPE_LABELS[item.type]}
          </Badge>
          <p
            className={cn(
              "text-xs font-semibold tracking-wide uppercase",
              accent.text,
            )}
          >
            {formatDateRange(item.type, item.startDate, item.endDate)}
          </p>
        </div>

        <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {item.title}
        </h3>

        {item.subtitle ? (
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {item.subtitle}
          </p>
        ) : null}

        {item.type === "education" && highlights.length > 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {highlights[0]}
            {extraHighlights > 0 ? (
              <span className="ml-1 font-medium text-foreground/70">
                +{extraHighlights} more
              </span>
            ) : null}
          </p>
        ) : item.description ? (
          <TruncatedText text={item.description} />
        ) : null}

        {item.type === "certification" && item.credentialUrl ? (
          <a
            href={item.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline",
              accent.text,
            )}
          >
            View credential
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}

function MilestoneDot({
  type,
  reduceMotion,
  isActive,
}: {
  type: JourneyType;
  reduceMotion: boolean | null;
  isActive: boolean;
}) {
  const Icon = TYPE_ICON[type];
  const accent = TYPE_ACCENT[type];

  return (
    <motion.span
      className={cn(
        "relative z-10 flex size-10 items-center justify-center rounded-full border bg-card shadow-sm lg:size-11",
        accent.border,
        accent.text,
        isActive && cn("ring-4", accent.ring),
      )}
      initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 320, damping: 16 }
      }
    >
      {isActive && !reduceMotion ? (
        <motion.span
          aria-hidden
          className={cn("absolute inset-0 rounded-full", accent.glow)}
          animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <Icon className="relative size-4" aria-hidden />
      <span className="sr-only">{JOURNEY_TYPE_LABELS[type]}</span>
    </motion.span>
  );
}

function TimelineItem({
  item,
  index,
  reduceMotion,
  isActive,
  onActive,
}: {
  item: JourneyItem;
  index: number;
  reduceMotion: boolean | null;
  isActive: boolean;
  onActive: (id: string) => void;
}) {
  const isLeft = index % 2 === 0;
  const itemRef = useRef<HTMLLIElement>(null);
  const isInView = useInView(itemRef, {
    once: false,
    amount: 0.45,
    margin: "-20% 0px -35% 0px",
  });

  useEffect(() => {
    if (isInView) onActive(item.id);
  }, [isInView, item.id, onActive]);

  return (
    <motion.li
      layout
      ref={itemRef}
      className="relative grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-[2.5rem_1fr] md:gap-6 lg:grid-cols-[1fr_3.5rem_1fr] lg:gap-8"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, height: 0, marginBottom: 0, scale: 0.98 }
      }
      transition={{
        duration: reduceMotion ? 0.2 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative flex justify-center pt-1 lg:hidden">
        <MilestoneDot
          type={item.type}
          reduceMotion={reduceMotion}
          isActive={isActive}
        />
      </div>

      <div
        className={cn(
          "hidden lg:flex",
          isLeft ? "justify-end" : "justify-end opacity-0",
        )}
        aria-hidden={!isLeft}
      >
        {isLeft ? (
          <EntryCard
            item={item}
            isLeft
            reduceMotion={reduceMotion}
            index={index}
          />
        ) : null}
      </div>

      <div className="relative hidden justify-center pt-1 lg:flex">
        <MilestoneDot
          type={item.type}
          reduceMotion={reduceMotion}
          isActive={isActive}
        />
      </div>

      <div
        className={cn("hidden lg:flex", !isLeft ? "justify-start" : "opacity-0")}
        aria-hidden={isLeft}
      >
        {!isLeft ? (
          <EntryCard
            item={item}
            isLeft={false}
            reduceMotion={reduceMotion}
            index={index}
          />
        ) : null}
      </div>

      {/* Mobile / tablet: single column */}
      <div className="lg:hidden">
        <EntryCard
          item={item}
          isLeft={false}
          reduceMotion={reduceMotion}
          index={index}
        />
      </div>
    </motion.li>
  );
}

export function CareerJourney({ items }: CareerJourneyProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [enabledTypes, setEnabledTypes] = useState<Set<JourneyType>>(
    () => new Set(JOURNEY_TYPES),
  );
  const [showAll, setShowAll] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const availableTypes = useMemo(() => {
    const present = new Set(items.map((item) => item.type));
    return JOURNEY_TYPES.filter((type) => present.has(type));
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => enabledTypes.has(item.type));
  }, [items, enabledTypes]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, filtered.length - INITIAL_VISIBLE);
  const allSelected =
    availableTypes.length > 0 &&
    availableTypes.every((type) => enabledTypes.has(type));

  const selectAll = () => {
    setEnabledTypes(new Set(JOURNEY_TYPES));
  };

  const toggleType = (type: JourneyType) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        // Don't allow emptying the set — snap back to all
        if (next.size === 1) return new Set(JOURNEY_TYPES);
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (!items.length) {
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.06),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.05),_transparent_45%)]"
      />

      <div
        className="relative mx-auto max-w-5xl px-4 sm:px-6 md:px-10"
        ref={containerRef}
      >
        <SectionHeading
          eyebrow="Path"
          title="Career journey"
          description="Experience, education, certifications, and achievements — one chronological story of how I build."
        />

        <div className="mt-8 space-y-4">
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            role="group"
            aria-label="Filter journey by type"
          >
            <FilterChip
              active={allSelected}
              onClick={selectAll}
              label="All"
              count={items.length}
            />
            {availableTypes.map((type) => {
              const Icon = TYPE_ICON[type];
              const count = items.filter((item) => item.type === type).length;
              return (
                <FilterChip
                  key={type}
                  active={!allSelected && enabledTypes.has(type)}
                  onClick={() => {
                    // Multi-select: if All is on, start from only this type;
                    // otherwise toggle this type in the set.
                    if (allSelected) {
                      setEnabledTypes(new Set([type]));
                    } else {
                      toggleType(type);
                    }
                  }}
                  label={JOURNEY_TYPE_LABELS_PLURAL[type]}
                  count={count}
                  icon={Icon}
                />
              );
            })}
          </motion.div>

          <div
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
            aria-label="Type color legend"
          >
            {availableTypes.map((type) => {
              const accent = TYPE_ACCENT[type];
              return (
                <span key={type} className="inline-flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full border-2 bg-card",
                      accent.border,
                    )}
                  />
                  {JOURNEY_TYPE_LABELS[type]}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative mt-12 sm:mt-14">
          {reduceMotion ? (
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-5 w-px bg-border md:left-5 lg:left-1/2 lg:-translate-x-px"
            />
          ) : (
            <motion.div
              aria-hidden
              style={{ scaleY, originY: 0 }}
              className="absolute top-2 bottom-2 left-5 w-px bg-gradient-to-b from-teal-500 via-blue-500 to-violet-500 md:left-5 lg:left-1/2 lg:-translate-x-px"
            />
          )}

          <ol className="relative flex flex-col gap-10 sm:gap-12">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  index={index}
                  reduceMotion={reduceMotion}
                  isActive={activeId === item.id}
                  onActive={setActiveId}
                />
              ))}
            </AnimatePresence>
          </ol>

          {!filtered.length ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No milestones match the selected filters.
            </p>
          ) : null}

          {!showAll && hiddenCount > 0 ? (
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAll(true)}
              >
                Show {hiddenCount} more
                <ChevronDown data-icon="inline-end" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: ComponentType<LucideProps>;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-foreground/20 bg-foreground text-background shadow-sm"
          : "border-border bg-card/80 text-muted-foreground hover:border-foreground/20 hover:text-foreground",
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[0.65rem] tabular-nums",
          active ? "bg-background/20" : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default CareerJourney;
