import { getAboutMe, type AboutMeData } from "@/lib/about";
import { getAchievements, type AchievementData } from "@/lib/achievements";
import { getCertifications, type CertificationData } from "@/lib/certifications";
import { getEducationRecords, type EducationData } from "@/lib/education";
import { getExperienceRecords, type ExperienceData } from "@/lib/experience";
import { getProjects, type ProjectData } from "@/lib/projects";
import { getSkillCategories, type SkillCategoryData } from "@/lib/skills";

export type ResumeData = {
  about: AboutMeData;
  experience: ExperienceData[];
  projects: ProjectData[];
  education: EducationData[];
  certifications: CertificationData[];
  achievements: AchievementData[];
  skills: SkillCategoryData[];
};

const FALLBACK_ABOUT: AboutMeData = {
  name: "Abhishek Garg",
  title: "Full Stack Developer",
  tagline: "",
  bio: "",
  profileImageUrl: "",
  resumeFileUrl: "",
  socialLinks: [],
  location: "",
  phone: "",
  email: "",
};

export async function getResumeData(): Promise<ResumeData> {
  const [
    about,
    experience,
    projects,
    education,
    certifications,
    achievements,
    skills,
  ] = await Promise.all([
    getAboutMe(),
    getExperienceRecords(),
    getProjects(),
    getEducationRecords(),
    getCertifications(),
    getAchievements(),
    getSkillCategories(),
  ]);

  return {
    about: about ?? FALLBACK_ABOUT,
    experience,
    projects,
    education,
    certifications,
    achievements,
    skills,
  };
}

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
