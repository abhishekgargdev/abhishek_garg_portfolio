import type { ResumeData } from "@/lib/resume-types";

export type ResumeAboutForm = {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  bio: string;
  portfolioUrl: string;
  socialLinks: { platform: string; url: string }[];
  openSourceContributions: string[];
};

export type ResumeExperienceForm = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  techStack: string[];
  order: number;
};

export type ResumeProjectForm = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  order: number;
};

export type ResumeSkillForm = {
  name: string;
  proficiency: number;
  iconKey: string;
};

export type ResumeSkillCategoryForm = {
  id: string;
  categoryName: string;
  order: number;
  skills: ResumeSkillForm[];
};

export type ResumeEducationForm = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
};

export type ResumeAchievementForm = {
  id: string;
  title: string;
  description: string;
  date: string;
  order: number;
};

export type ResumeCertificationForm = {
  id: string;
  title: string;
  provider: string;
  date: string;
  credentialUrl: string;
  order: number;
};

export type ResumeEditorState = {
  aboutMe: ResumeAboutForm;
  experience: ResumeExperienceForm[];
  projects: ResumeProjectForm[];
  skills: ResumeSkillCategoryForm[];
  education: ResumeEducationForm[];
  achievements: ResumeAchievementForm[];
  certifications: ResumeCertificationForm[];
};

export function toResumeData(state: ResumeEditorState): ResumeData {
  return {
    about: {
      name: state.aboutMe.name,
      title: state.aboutMe.title,
      taglines: [],
      bio: state.aboutMe.bio,
      profileImageUrl: "",
      resumeFileUrl: "",
      portfolioUrl: state.aboutMe.portfolioUrl,
      openSourceContributions: state.aboutMe.openSourceContributions,
      socialLinks: state.aboutMe.socialLinks,
      location: state.aboutMe.location,
      phone: state.aboutMe.phone,
      email: state.aboutMe.email,
    },
    experience: state.experience,
    projects: state.projects.map((p) => ({
      ...p,
      imageUrl: "",
    })),
    education: state.education,
    certifications: state.certifications,
    achievements: state.achievements,
    skills: state.skills,
  };
}

export const EMPTY_RESUME_STATE: ResumeEditorState = {
  aboutMe: {
    name: "",
    title: "",
    location: "",
    phone: "",
    email: "",
    bio: "",
    portfolioUrl: "",
    socialLinks: [],
    openSourceContributions: [],
  },
  experience: [],
  projects: [],
  skills: [],
  education: [],
  achievements: [],
  certifications: [],
};
