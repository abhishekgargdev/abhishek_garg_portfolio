export type PortfolioSocialPlatform = {
  key: string;
  label: string;
  placeholder: string;
};

/** Common portfolio social platforms with dedicated admin inputs. */
export const PORTFOLIO_SOCIAL_PLATFORMS: PortfolioSocialPlatform[] = [
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/your-profile",
  },
  {
    key: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-username",
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    placeholder: "https://x.com/your-handle",
  },
  {
    key: "website",
    label: "Portfolio / Website",
    placeholder: "https://yourdomain.com",
  },
  {
    key: "devto",
    label: "Dev.to",
    placeholder: "https://dev.to/your-handle",
  },
  {
    key: "stackoverflow",
    label: "Stack Overflow",
    placeholder: "https://stackoverflow.com/users/…",
  },
  {
    key: "medium",
    label: "Medium",
    placeholder: "https://medium.com/@your-handle",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@your-channel",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/your-handle",
  },
  {
    key: "leetcode",
    label: "LeetCode",
    placeholder: "https://leetcode.com/u/your-handle",
  },
  {
    key: "hackerrank",
    label: "HackerRank",
    placeholder: "https://hackerrank.com/your-handle",
  },
  {
    key: "codepen",
    label: "CodePen",
    placeholder: "https://codepen.io/your-handle",
  },
  {
    key: "behance",
    label: "Behance",
    placeholder: "https://behance.net/your-handle",
  },
  {
    key: "dribbble",
    label: "Dribbble",
    placeholder: "https://dribbble.com/your-handle",
  },
  {
    key: "npm",
    label: "npm",
    placeholder: "https://www.npmjs.com/~your-handle",
  },
];

export function emptySocialLinkRecord(): Record<string, string> {
  return Object.fromEntries(
    PORTFOLIO_SOCIAL_PLATFORMS.map((platform) => [platform.key, ""]),
  );
}

export function socialLinksToRecord(
  links: { platform: string; url: string }[],
): Record<string, string> {
  const record = emptySocialLinkRecord();

  for (const link of links) {
    const platform = link.platform.toLowerCase();
    const match = PORTFOLIO_SOCIAL_PLATFORMS.find(
      (item) =>
        item.key === platform ||
        item.label.toLowerCase() === platform ||
        platform.includes(item.key),
    );
    if (match && link.url?.trim()) {
      record[match.key] = link.url.trim();
    }
  }

  return record;
}

export function recordToSocialLinks(
  record: Record<string, string>,
): { platform: string; url: string }[] {
  return PORTFOLIO_SOCIAL_PLATFORMS.map((platform) => ({
    platform: platform.label,
    url: record[platform.key]?.trim() ?? "",
  })).filter((link) => link.url);
}
