/** Client-safe experience tenure types and duration helpers (no DB imports). */

export type TenurePeriodData = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  countsTotal: boolean;
  countsRelevant: boolean;
};

/** @deprecated Prefer TenurePeriodData */
export type RelevantPeriodData = TenurePeriodData;

export type ExperienceTenureData = {
  id: string;
  totalLabel: string;
  relevantLabel: string;
  periods: TenurePeriodData[];
  updatedAt?: string;
};

export type DurationParts = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export type PeriodLike = {
  title?: string;
  company?: string;
  startDate?: string | Date;
  endDate?: string | Date | null;
  ongoing?: boolean;
};

function toDayKey(value: string | Date | null | undefined): string {
  if (!value) return "ongoing";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "invalid";
  return date.toISOString().slice(0, 10);
}

/** Stable identity for detecting duplicate periods when merging legacy lists. */
export function periodIdentity(period: PeriodLike): string {
  return [
    (period.title ?? "").trim().toLowerCase(),
    (period.company ?? "").trim().toLowerCase(),
    toDayKey(period.startDate),
    period.ongoing || !period.endDate ? "ongoing" : toDayKey(period.endDate),
  ].join("|");
}

export function periodsMatch(a: PeriodLike, b: PeriodLike): boolean {
  return periodIdentity(a) === periodIdentity(b);
}

export function findMatchingPeriodIndex(
  periods: PeriodLike[],
  candidate: PeriodLike,
): number {
  const key = periodIdentity(candidate);
  return periods.findIndex((period) => periodIdentity(period) === key);
}

/** Periods that feed the Total Experience clock. */
export function periodsForTotal(
  periods: TenurePeriodData[],
): TenurePeriodData[] {
  return periods.filter((period) => period.countsTotal);
}

/** Periods that feed the Relevant Experience clock. */
export function periodsForRelevant(
  periods: TenurePeriodData[],
): TenurePeriodData[] {
  return periods.filter((period) => period.countsRelevant);
}

type LegacyPeriodInput = {
  id?: string;
  _id?: unknown;
  title: string;
  company?: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  countsTotal?: boolean;
  countsRelevant?: boolean;
};

/**
 * Merge legacy dual lists (and optional totalStartDate) into one periods array.
 * Matching title+company+dates become a single entry with both toggles on.
 */
export function mergeLegacyIntoPeriods(input: {
  periods?: LegacyPeriodInput[] | null;
  totalPeriods?: LegacyPeriodInput[] | null;
  relevantPeriods?: LegacyPeriodInput[] | null;
  totalStartDate?: string | Date | null;
}): TenurePeriodData[] {
  if (input.periods?.length) {
    return input.periods.map((period, index) => mapUnifiedPeriod(period, index));
  }

  const merged = new Map<
    string,
    {
      id: string;
      title: string;
      company: string;
      startDate: string;
      endDate: string | null;
      countsTotal: boolean;
      countsRelevant: boolean;
    }
  >();

  const upsert = (
    period: LegacyPeriodInput,
    flags: { countsTotal: boolean; countsRelevant: boolean },
    fallbackId: string,
  ) => {
    const startDate = new Date(period.startDate);
    if (Number.isNaN(startDate.getTime())) return;

    const endDate = period.endDate ? new Date(period.endDate) : null;
    if (endDate && Number.isNaN(endDate.getTime())) return;

    const startIso = startDate.toISOString();
    const endIso = endDate ? endDate.toISOString() : null;
    const key = periodIdentity({
      title: period.title,
      company: period.company,
      startDate: startIso,
      endDate: endIso,
    });

    const existing = merged.get(key);
    if (existing) {
      existing.countsTotal = existing.countsTotal || flags.countsTotal;
      existing.countsRelevant =
        existing.countsRelevant || flags.countsRelevant;
      return;
    }

    merged.set(key, {
      id: String(period.id ?? period._id ?? fallbackId),
      title: period.title,
      company: period.company ?? "",
      startDate: startIso,
      endDate: endIso,
      countsTotal: flags.countsTotal,
      countsRelevant: flags.countsRelevant,
    });
  };

  (input.totalPeriods ?? []).forEach((period, index) => {
    upsert(period, { countsTotal: true, countsRelevant: false }, `total-${index}`);
  });

  (input.relevantPeriods ?? []).forEach((period, index) => {
    upsert(
      period,
      { countsTotal: false, countsRelevant: true },
      `relevant-${index}`,
    );
  });

  if (!merged.size && input.totalStartDate) {
    const start = new Date(input.totalStartDate);
    if (!Number.isNaN(start.getTime())) {
      merged.set("legacy-total", {
        id: "legacy-total",
        title: "Career start",
        company: "",
        startDate: start.toISOString(),
        endDate: null,
        countsTotal: true,
        countsRelevant: false,
      });
    }
  }

  return Array.from(merged.values());
}

function mapUnifiedPeriod(
  period: LegacyPeriodInput,
  index: number,
): TenurePeriodData {
  return {
    id: String(period.id ?? period._id ?? `period-${index}`),
    title: period.title,
    company: period.company ?? "",
    startDate: new Date(period.startDate).toISOString(),
    endDate: period.endDate ? new Date(period.endDate).toISOString() : null,
    countsTotal: period.countsTotal ?? true,
    countsRelevant: period.countsRelevant ?? false,
  };
}

/** Convert raw milliseconds into Y/M/D/H/M/S using average month length. */
export function msToDurationParts(totalMs: number): DurationParts {
  const safeMs = Math.max(0, Math.floor(totalMs));
  let remaining = Math.floor(safeMs / 1000);

  const seconds = remaining % 60;
  remaining = Math.floor(remaining / 60);
  const minutes = remaining % 60;
  remaining = Math.floor(remaining / 60);
  const hours = remaining % 24;
  remaining = Math.floor(remaining / 24);

  const years = Math.floor(remaining / 365);
  remaining %= 365;
  const months = Math.floor(remaining / 30);
  const days = remaining % 30;

  return { years, months, days, hours, minutes, seconds, totalMs: safeMs };
}

/** Calendar-aware diff between two dates at a fixed "now". */
export function diffDurationParts(from: Date, to: Date): DurationParts {
  if (to.getTime() < from.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    };
  }

  const totalMs = to.getTime() - from.getTime();

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  let hours = to.getHours() - from.getHours();
  let minutes = to.getMinutes() - from.getMinutes();
  let seconds = to.getSeconds() - from.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days, hours, minutes, seconds, totalMs };
}

/** Sum multiple ranges into one duration. */
export function sumPeriodDurations(
  periods: { startDate: string | Date; endDate: string | Date | null }[],
  now: Date = new Date(),
): DurationParts {
  let totalMs = 0;

  for (const period of periods) {
    const start = new Date(period.startDate);
    const end = period.endDate ? new Date(period.endDate) : now;
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    totalMs += Math.max(0, end.getTime() - start.getTime());
  }

  return msToDurationParts(totalMs);
}

export function earliestPeriodStart(
  periods: { startDate: string | Date }[],
): Date | null {
  let earliest: Date | null = null;
  for (const period of periods) {
    const start = new Date(period.startDate);
    if (Number.isNaN(start.getTime())) continue;
    if (!earliest || start.getTime() < earliest.getTime()) {
      earliest = start;
    }
  }
  return earliest;
}

export function formatDurationShort(parts: DurationParts): string {
  const chunks: string[] = [];
  if (parts.years) chunks.push(`${parts.years}y`);
  if (parts.months) chunks.push(`${parts.months}mo`);
  if (parts.days || chunks.length === 0) chunks.push(`${parts.days}d`);
  return chunks.join(" ");
}

export function formatPeriodRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
): string {
  if (!startDate) return "No dates";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "Invalid dates";

  const fmt = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  if (!endDate) return `${fmt(start)} – Present`;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return `${fmt(start)} – Present`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export function emptyDurationParts(): DurationParts {
  return {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
  };
}
