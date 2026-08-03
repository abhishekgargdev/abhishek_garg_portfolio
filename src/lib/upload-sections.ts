/** Allowed portfolio upload subfolders under `portfolio/`. */
export const UPLOAD_SECTIONS = [
  "about",
  "projects",
  "experience",
  "education",
  "skills",
  "achievements",
  "certifications",
  "timeline",
  "resume",
  "general",
] as const;

export type UploadSection = (typeof UPLOAD_SECTIONS)[number];

export function isUploadSection(value: string): value is UploadSection {
  return (UPLOAD_SECTIONS as readonly string[]).includes(value);
}

export function portfolioFolder(section: UploadSection): string {
  return `portfolio/${section}`;
}
