/** Normalize legacy single tagline + taglines array into a clean list. */
export function normalizeTaglines(
  tagline?: string | null,
  taglines?: string[] | null,
): string[] {
  const fromArray = (taglines ?? [])
    .map((line) => line.trim())
    .filter(Boolean);

  if (fromArray.length) return fromArray;

  const legacy = tagline?.trim();
  if (legacy) return [legacy];

  return [];
}

export const DEFAULT_HERO_TAGLINES = [
  "Building thoughtful web experiences with clean code and clear craft.",
  "Architecting scalable full-stack products with modern web technologies.",
  "Turning complex ideas into polished, production-ready applications.",
];
