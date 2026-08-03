/** Client-safe resume types and formatters (no DB imports). */

export type ResumeSocialLink = {
  platform: string;
  url: string;
};

export type ResumeAbout = {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  socialLinks: ResumeSocialLink[];
  location: string;
  phone: string;
  email: string;
};

export type ResumeExperience = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  techStack: string[];
  order: number;
};

export type ResumeProject = {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  bullets: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  order: number;
};

export type ResumeEducation = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
};

export type ResumeCertification = {
  id: string;
  title: string;
  provider: string;
  date: string;
  credentialUrl: string;
  order: number;
};

export type ResumeAchievement = {
  id: string;
  title: string;
  description: string;
  date: string;
  order: number;
};

export type ResumeSkill = {
  name: string;
  iconKey: string;
  proficiency: number;
};

export type ResumeSkillCategory = {
  id: string;
  categoryName: string;
  skills: ResumeSkill[];
  order: number;
};

export type ResumeData = {
  about: ResumeAbout;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
  skills: ResumeSkillCategory[];
};

export function formatResumeDateRange(
  startDate: string,
  endDate: string | null,
): string {
  const start = formatResumeMonthYear(startDate);
  if (!endDate) return `${start} – Present`;
  return `${start} – ${formatResumeMonthYear(endDate)}`;
}

export function formatResumeMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function resumeFilename(name: string): string {
  const safe = name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${safe || "Abhishek_Garg"}_Resume.pdf`;
}
