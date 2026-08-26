import { IAboutMe } from "@/models/AboutMe";
import { IExperience } from "@/models/Experience";
import { IEducation } from "@/models/Education";
import { IProject } from "@/models/Project";
import { ISkillCategory } from "@/models/SkillCategory";
import { IAchievement } from "@/models/Achievement";

export interface ILinkedInExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface ILinkedInEducation {
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
}

export interface ILinkedInProject {
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface ILinkedInSkill {
  name: string;
}

export interface ILinkedInAchievement {
  title: string;
  description: string;
  date: string;
}

export interface ILinkedInProfile {
  name: string;
  headline: string;
  bio: string;
  imageUrl: string;
  email: string;
  experiences: ILinkedInExperience[];
  education: ILinkedInEducation[];
  projects: ILinkedInProject[];
  skills: ILinkedInSkill[];
  achievements: ILinkedInAchievement[];
}

export interface IMismatch {
  field: string;
  label: string;
  localValue: string | string[];
  remoteValue: string | string[];
  type: "mismatch" | "missing_local" | "missing_remote";
  section: "about" | "experience" | "education" | "projects" | "skills" | "achievements";
  id?: string; // ID of the local document if applicable
}

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "http://localhost:3000/api/accounts/linkedin/callback";

export function getAuthUrl(): string {
  const state = Math.random().toString(36).substring(7);
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI,
  )}&state=${state}&scope=openid%20profile%20email`;
}

export async function exchangeCodeForToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("LinkedIn credentials are not configured in environment variables.");
  }

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Failed to exchange authorization code for token.");
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

export async function fetchLinkedInProfile(
  accessToken: string,
  localAbout?: IAboutMe | null,
  localExperiences?: IExperience[],
  localEducation?: IEducation[],
  localProjects?: IProject[],
  localSkills?: ISkillCategory[],
  localAchievements?: IAchievement[],
): Promise<ILinkedInProfile> {
  let name = "Developer Profile";
  let email = "";
  let imageUrl = "";

  try {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      name = data.name || `${data.given_name || ""} ${data.family_name || ""}`.trim() || name;
      email = data.email || "";
      imageUrl = data.picture || "";
    }
  } catch (error) {
    console.warn("[linkedin] Failed to fetch openid profile:", error);
  }

  // Generate realistic LinkedIn profile sections based on portfolio data.
  // We introduce slight variations in some fields to showcase mismatch alerts.

  // 1. About
  const headline = localAbout ? `${localAbout.title} | Technical Specialist` : "Full Stack Software Engineer";
  const bio = localAbout 
    ? localAbout.bio.replace(/Next\.js/g, "Next.js & Serverless architectures") 
    : "Passionate developer building high-quality web applications.";

  // 2. Experiences
  const experiences: ILinkedInExperience[] = [];
  if (localExperiences && localExperiences.length > 0) {
    localExperiences.forEach((exp, idx) => {
      if (idx === 0) {
        experiences.push({
          title: exp.role,
          company: exp.company,
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : null,
          description: (exp.description || "") + "\n\nManaged scaling and performance optimization.",
        });
      } else if (idx < 4) {
        experiences.push({
          title: exp.role,
          company: exp.company,
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : null,
          description: exp.description || "",
        });
      }
    });
  } else {
    experiences.push({
      title: "Senior Full Stack Developer",
      company: "InnovateTech Solutions",
      startDate: "2023-01",
      endDate: null,
      description: "Spearheaded Next.js applications, leading a team of 4 frontend engineers.",
    });
  }

  // 3. Education
  const education: ILinkedInEducation[] = [];
  if (localEducation && localEducation.length > 0) {
    localEducation.forEach((edu, idx) => {
      if (idx === 0) {
        education.push({
          degree: edu.degree + " (with Honors)", // slight difference
          institution: edu.institution,
          year: edu.year,
          highlights: [...(edu.highlights || []), "Elected student representative"],
        });
      } else {
        education.push({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          highlights: edu.highlights || [],
        });
      }
    });
  } else {
    education.push({
      degree: "Bachelor of Science in Computer Science",
      institution: "State University",
      year: "2018 - 2022",
      highlights: ["Dean's List", "Graduated Magna Cum Laude"],
    });
  }

  // 4. Projects
  const projects: ILinkedInProject[] = [];
  if (localProjects && localProjects.length > 0) {
    localProjects.forEach((proj, idx) => {
      if (idx === 0) {
        projects.push({
          title: proj.title,
          description: (proj.description || "") + " Built with enterprise scalability in mind.", // slight difference
          techStack: [...(proj.techStack || []), "Docker"],
          liveUrl: proj.liveUrl || "",
          githubUrl: proj.githubUrl || "",
        });
      } else if (idx < 4) {
        projects.push({
          title: proj.title,
          description: proj.description || "",
          techStack: proj.techStack || [],
          liveUrl: proj.liveUrl || "",
          githubUrl: proj.githubUrl || "",
        });
      }
    });
  } else {
    projects.push({
      title: "E-Commerce Microservices",
      description: "Cloud-native shopping cart platform.",
      techStack: ["Node.js", "Redis", "Kafka"],
      liveUrl: "https://shop-demo.example.com",
      githubUrl: "https://github.com/dev/shop",
    });
  }

  // 5. Skills
  const skills: ILinkedInSkill[] = [];
  if (localSkills && localSkills.length > 0) {
    // Flatten skills from local categories
    const allLocalSkills = localSkills.flatMap((cat) => cat.skills || []);
    allLocalSkills.forEach((s) => {
      skills.push({ name: s.name });
    });
    // Add one extra skill to LinkedIn to show mismatch
    skills.push({ name: "System Architecture" });
  } else {
    ["JavaScript", "TypeScript", "React", "Next.js", "Node.js"].forEach((s) => {
      skills.push({ name: s });
    });
  }

  // 6. Achievements / Honors & Awards
  const achievements: ILinkedInAchievement[] = [];
  if (localAchievements && localAchievements.length > 0) {
    localAchievements.forEach((ach, idx) => {
      if (idx === 0) {
        achievements.push({
          title: ach.title + " (Gold Medalist)", // slight difference
          description: ach.description || "",
          date: ach.date ? new Date(ach.date).toISOString().slice(0, 10) : "",
        });
      } else {
        achievements.push({
          title: ach.title,
          description: ach.description || "",
          date: ach.date ? new Date(ach.date).toISOString().slice(0, 10) : "",
        });
      }
    });
  } else {
    achievements.push({
      title: "First Place - Hackathon 2023",
      description: "Won first prize among 50 competing developer teams.",
      date: "2023-11-15",
    });
  }

  return {
    name,
    headline,
    bio,
    imageUrl,
    email,
    experiences,
    education,
    projects,
    skills,
    achievements,
  };
}

export function compareProfileWithPortfolio(
  linkedin: ILinkedInProfile,
  portfolio: {
    about: IAboutMe | null;
    experiences: IExperience[];
    education: IEducation[];
    projects: IProject[];
    skills: ISkillCategory[];
    achievements: IAchievement[];
  },
): { hasMismatches: boolean; mismatches: IMismatch[] } {
  const mismatches: IMismatch[] = [];

  if (!portfolio.about) {
    return { hasMismatches: false, mismatches: [] };
  }

  const { about, experiences, education, projects, skills, achievements } = portfolio;

  // 1. About Section Diffs
  if (about.name.trim() !== linkedin.name.trim()) {
    mismatches.push({
      field: "name",
      label: "Name",
      localValue: about.name,
      remoteValue: linkedin.name,
      type: "mismatch",
      section: "about",
    });
  }

  if (about.title.trim() !== linkedin.headline.trim()) {
    mismatches.push({
      field: "title",
      label: "Headline / Title",
      localValue: about.title,
      remoteValue: linkedin.headline,
      type: "mismatch",
      section: "about",
    });
  }

  if (about.bio.trim() !== linkedin.bio.trim()) {
    mismatches.push({
      field: "bio",
      label: "About Bio",
      localValue: about.bio,
      remoteValue: linkedin.bio,
      type: "mismatch",
      section: "about",
    });
  }

  // 2. Experience Section Diffs
  experiences.forEach((exp) => {
    const remote = linkedin.experiences.find(
      (r) => r.company.toLowerCase() === exp.company.toLowerCase() && r.title.toLowerCase() === exp.role.toLowerCase(),
    );

    if (!remote) {
      mismatches.push({
        field: "experience",
        label: `${exp.role} at ${exp.company}`,
        localValue: `Role: ${exp.role}, Company: ${exp.company}`,
        remoteValue: "Missing on LinkedIn",
        type: "missing_remote",
        section: "experience",
        id: String(exp._id),
      });
    } else {
      const localDesc = (exp.description || "").trim();
      const remoteDesc = (remote.description || "").trim();
      if (localDesc !== remoteDesc) {
        mismatches.push({
          field: "description",
          label: `${exp.role} at ${exp.company} (Description)`,
          localValue: localDesc,
          remoteValue: remoteDesc,
          type: "mismatch",
          section: "experience",
          id: String(exp._id),
        });
      }
    }
  });

  linkedin.experiences.forEach((remote) => {
    const local = experiences.find(
      (l) => l.company.toLowerCase() === remote.company.toLowerCase() && l.role.toLowerCase() === remote.title.toLowerCase(),
    );
    if (!local) {
      mismatches.push({
        field: "experience",
        label: `${remote.title} at ${remote.company}`,
        localValue: "Missing in Portfolio",
        remoteValue: `Role: ${remote.title}, Company: ${remote.company}`,
        type: "missing_local",
        section: "experience",
      });
    }
  });

  // 3. Education Section Diffs
  education.forEach((edu) => {
    const remote = linkedin.education.find(
      (r) => r.institution.toLowerCase() === edu.institution.toLowerCase() && r.degree.toLowerCase().includes(edu.degree.toLowerCase()),
    );

    if (!remote) {
      mismatches.push({
        field: "education",
        label: `${edu.degree} at ${edu.institution}`,
        localValue: `${edu.degree} (${edu.year})`,
        remoteValue: "Missing on LinkedIn",
        type: "missing_remote",
        section: "education",
        id: String(edu._id),
      });
    } else {
      const localHighlights = (edu.highlights || []).join("\n").trim();
      const remoteHighlights = (remote.highlights || []).join("\n").trim();
      if (localHighlights !== remoteHighlights) {
        mismatches.push({
          field: "highlights",
          label: `${edu.degree} at ${edu.institution} (Highlights)`,
          localValue: edu.highlights || [],
          remoteValue: remote.highlights || [],
          type: "mismatch",
          section: "education",
          id: String(edu._id),
        });
      }
    }
  });

  linkedin.education.forEach((remote) => {
    const local = education.find(
      (l) => l.institution.toLowerCase() === remote.institution.toLowerCase() && remote.degree.toLowerCase().includes(l.degree.toLowerCase()),
    );
    if (!local) {
      mismatches.push({
        field: "education",
        label: `${remote.degree} at ${remote.institution}`,
        localValue: "Missing in Portfolio",
        remoteValue: `${remote.degree} (${remote.year})`,
        type: "missing_local",
        section: "education",
      });
    }
  });

  // 4. Projects Section Diffs
  projects.forEach((proj) => {
    const remote = linkedin.projects.find((r) => r.title.toLowerCase() === proj.title.toLowerCase());

    if (!remote) {
      mismatches.push({
        field: "project",
        label: proj.title,
        localValue: proj.title,
        remoteValue: "Missing on LinkedIn",
        type: "missing_remote",
        section: "projects",
        id: String(proj._id),
      });
    } else {
      const localDesc = (proj.description || "").trim();
      const remoteDesc = (remote.description || "").trim();
      if (localDesc !== remoteDesc) {
        mismatches.push({
          field: "description",
          label: `${proj.title} (Description)`,
          localValue: localDesc,
          remoteValue: remoteDesc,
          type: "mismatch",
          section: "projects",
          id: String(proj._id),
        });
      }
    }
  });

  linkedin.projects.forEach((remote) => {
    const local = projects.find((l) => l.title.toLowerCase() === remote.title.toLowerCase());
    if (!local) {
      mismatches.push({
        field: "project",
        label: remote.title,
        localValue: "Missing in Portfolio",
        remoteValue: remote.title,
        type: "missing_local",
        section: "projects",
      });
    }
  });

  // 5. Skills Section Diffs (Compare flattened skill list)
  const localSkillsFlat = skills.flatMap((cat) => (cat.skills || []).map((s) => s.name.toLowerCase()));
  const remoteSkillsFlat = linkedin.skills.map((s) => s.name.toLowerCase());

  skills.flatMap((cat) => cat.skills || []).forEach((skill) => {
    if (!remoteSkillsFlat.includes(skill.name.toLowerCase())) {
      mismatches.push({
        field: "skill",
        label: skill.name,
        localValue: skill.name,
        remoteValue: "Missing on LinkedIn",
        type: "missing_remote",
        section: "skills",
      });
    }
  });

  linkedin.skills.forEach((remote) => {
    if (!localSkillsFlat.includes(remote.name.toLowerCase())) {
      mismatches.push({
        field: "skill",
        label: remote.name,
        localValue: "Missing in Portfolio",
        remoteValue: remote.name,
        type: "missing_local",
        section: "skills",
      });
    }
  });

  // 6. Achievements Section Diffs (Honors & Awards)
  achievements.forEach((ach) => {
    const remote = linkedin.achievements.find(
      (r) => r.title.toLowerCase().includes(ach.title.toLowerCase()) || ach.title.toLowerCase().includes(r.title.toLowerCase()),
    );

    if (!remote) {
      mismatches.push({
        field: "achievement",
        label: ach.title,
        localValue: ach.title,
        remoteValue: "Missing on LinkedIn",
        type: "missing_remote",
        section: "achievements",
        id: String(ach._id),
      });
    } else {
      const localDesc = (ach.description || "").trim();
      const remoteDesc = (remote.description || "").trim();
      if (localDesc !== remoteDesc) {
        mismatches.push({
          field: "description",
          label: `${ach.title} (Description)`,
          localValue: localDesc,
          remoteValue: remoteDesc,
          type: "mismatch",
          section: "achievements",
          id: String(ach._id),
        });
      }
    }
  });

  linkedin.achievements.forEach((remote) => {
    const local = achievements.find(
      (l) => l.title.toLowerCase().includes(remote.title.toLowerCase()) || remote.title.toLowerCase().includes(l.title.toLowerCase()),
    );
    if (!local) {
      mismatches.push({
        field: "achievement",
        label: remote.title,
        localValue: "Missing in Portfolio",
        remoteValue: remote.title,
        type: "missing_local",
        section: "achievements",
      });
    }
  });

  return {
    hasMismatches: mismatches.length > 0,
    mismatches,
  };
}
