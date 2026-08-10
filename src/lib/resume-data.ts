import { getAboutMe, type AboutMeData } from "@/lib/about";
import { getAchievements } from "@/lib/achievements";
import { getCertifications } from "@/lib/certifications";
import { getEducationRecords } from "@/lib/education";
import { getExperienceRecords } from "@/lib/experience";
import { getProjects } from "@/lib/projects";
import { getSkillCategories } from "@/lib/skills";
import type { ResumeData } from "@/lib/resume-types";

export type { ResumeData } from "@/lib/resume-types";
export {
  formatResumeDateRange,
  formatResumeMonthYear,
  resumeFilename,
} from "@/lib/resume-types";

const FALLBACK_ABOUT: AboutMeData = {
  name: "Abhishek Garg",
  title: "Full Stack Developer",
  taglines: [],
  bio: "",
  profileImageUrl: "",
  resumeFileUrl: "",
  portfolioUrl: "",
  openSourceContributions: [],
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
