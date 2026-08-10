"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Brain,
  Save,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionLoader } from "@/components/loader/SectionLoader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AboutMeForm = {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  bio: string;
  beyondCodeBio: string;
  taglines: string[];
  socialLinks: { platform: string; url: string }[];
};

type ExperienceForm = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  techStack: string[];
  order: number;
};

type ProjectForm = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  order: number;
};

type SkillForm = {
  name: string;
  proficiency: number;
  iconKey: string;
};

type SkillCategoryForm = {
  id: string;
  categoryName: string;
  order: number;
  skills: SkillForm[];
};

type EducationForm = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
};

type AchievementForm = {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  order: number;
};

type CertificationForm = {
  id: string;
  title: string;
  provider: string;
  date: string;
  credentialUrl: string;
  imageUrl: string;
  order: number;
};

type PortfolioData = {
  aboutMe: AboutMeForm;
  experience: ExperienceForm[];
  projects: ProjectForm[];
  skills: SkillCategoryForm[];
  education: EducationForm[];
  achievements: AchievementForm[];
  certifications: CertificationForm[];
};

type SuggestionAbout = {
  title?: string;
  bio?: string;
  beyondCodeBio?: string;
  taglines?: string[];
};

type SuggestionExperience = {
  id: string;
  role?: string;
  bullets?: string[];
};

type SuggestionProject = {
  id: string;
  title?: string;
  description?: string;
  bullets?: string[];
};

type SuggestionAchievement = {
  id: string;
  title?: string;
  description?: string;
};

type SuggestionEducation = {
  id: string;
  degree?: string;
  highlights?: string[];
};

type SuggestionCertification = {
  id: string;
  title?: string;
  provider?: string;
};

type AISuggestions = {
  aboutMe?: SuggestionAbout;
  experience?: SuggestionExperience[];
  projects?: SuggestionProject[];
  achievements?: SuggestionAchievement[];
  education?: SuggestionEducation[];
  certifications?: SuggestionCertification[];
};

const PRESETS = [
  {
    label: "✨ Optimize for ATS",
    prompt: "Make all my experience bullets, project descriptions, and achievements ATS-friendly by using strong action verbs, professional phrasing, and incorporating concrete metrics or outcomes where possible.",
  },
  {
    label: "✍️ Humanize Writing",
    prompt: "Rewrite my bio and experience descriptions to sound natural, conversational, and written by a human. Remove typical AI jargon (like 'seamlessly', 'testament', 'catalyst') and make it clear and engaging.",
  },
  {
    label: "📈 Add Metrics & Scale",
    prompt: "Review my experience and projects bullets and suggest updates that emphasize scale, business impact, percentages, or concrete figures (like speedups, throughput, or cost reductions).",
  },
];

const DEFAULT_USER_PROMPT = "Optimize my profile to be ATS-friendly and professional, using strong action verbs, clear outcomes, and metrics, while ensuring it sounds natural and human-written (avoiding typical AI buzzwords).";

export default function AiAssistantPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_USER_PROMPT);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);

  // Field-wise AI States
  const [activeField, setActiveField] = useState<{
    name: string;
    key: string;
    currentValue: string | string[];
    applyValue: (val: string | string[]) => void;
  } | null>(null);
  const [fieldInstruction, setFieldInstruction] = useState("");
  const [generatingField, setGeneratingField] = useState(false);
  const [fieldSuggestion, setFieldSuggestion] = useState<string | string[] | null>(null);

  const optimizeField = async () => {
    if (!activeField) return;
    setGeneratingField(true);
    setFieldSuggestion(null);
    try {
      const response = await fetch("/api/admin/portfolio-data/optimize-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldName: activeField.name,
          currentValue: activeField.currentValue,
          instruction: fieldInstruction,
        }),
      });
      const data = (await response.json()) as {
        suggestedValue?: string | string[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to optimize field");
      }
      setFieldSuggestion(data.suggestedValue || null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate suggestion",
      );
    } finally {
      setGeneratingField(false);
    }
  };

  // Form states
  const [aboutMe, setAboutMe] = useState<AboutMeForm | null>(null);
  const [experience, setExperience] = useState<ExperienceForm[]>([]);
  const [projects, setProjects] = useState<ProjectForm[]>([]);
  const [skills, setSkills] = useState<SkillCategoryForm[]>([]);
  const [education, setEducation] = useState<EducationForm[]>([]);
  const [achievements, setAchievements] = useState<AchievementForm[]>([]);
  const [certifications, setCertifications] = useState<CertificationForm[]>([]);

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/portfolio-data");
      const data = (await response.json()) as PortfolioData;
      if (!response.ok) {
        throw new Error("Failed to load portfolio data");
      }
      setAboutMe(data.aboutMe);
      setExperience(data.experience || []);
      setProjects(data.projects || []);
      setSkills(data.skills || []);
      setEducation(data.education || []);
      setAchievements(data.achievements || []);
      setCertifications(data.certifications || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load portfolio data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPortfolioData();
  }, [fetchPortfolioData]);

  const savePortfolio = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/portfolio-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutMe,
          experience,
          projects,
          skills,
          education,
          achievements,
          certifications,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save portfolio data");
      }
      toast.success("Portfolio saved successfully!");
      setSuggestions(null); // Clear suggestions after save
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save portfolio",
      );
    } finally {
      setSaving(false);
    }
  };

  const generateSuggestions = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const currentData = {
        aboutMe,
        experience,
        projects,
        achievements,
        education,
        certifications,
      };

      const response = await fetch("/api/admin/portfolio-data/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, currentData }),
      });
      const data = (await response.json()) as {
        suggestions?: AISuggestions;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }
      setSuggestions(data.suggestions || null);
      toast.success("Suggestions loaded! Review them in each tab.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate suggestions",
      );
    } finally {
      setGenerating(false);
    }
  };

  const applyAllSuggestions = () => {
    if (!suggestions) return;

    // 1. About Me
    if (suggestions.aboutMe) {
      setAboutMe((prev) =>
        prev
          ? {
              ...prev,
              title: suggestions.aboutMe?.title || prev.title,
              bio: suggestions.aboutMe?.bio || prev.bio,
              beyondCodeBio:
                suggestions.aboutMe?.beyondCodeBio || prev.beyondCodeBio,
              taglines: suggestions.aboutMe?.taglines || prev.taglines,
            }
          : null,
      );
    }

    // 2. Experience
    if (Array.isArray(suggestions.experience)) {
      setExperience((prev) =>
        prev.map((exp) => {
          const sugg = suggestions.experience?.find((s) => s.id === exp.id);
          if (sugg) {
            return {
              ...exp,
              role: sugg.role || exp.role,
              bullets: sugg.bullets || exp.bullets,
            };
          }
          return exp;
        }),
      );
    }

    // 3. Projects
    if (Array.isArray(suggestions.projects)) {
      setProjects((prev) =>
        prev.map((proj) => {
          const sugg = suggestions.projects?.find((s) => s.id === proj.id);
          if (sugg) {
            return {
              ...proj,
              title: sugg.title || proj.title,
              description: sugg.description || proj.description,
              bullets: sugg.bullets || proj.bullets,
            };
          }
          return proj;
        }),
      );
    }

    // 4. Achievements
    if (Array.isArray(suggestions.achievements)) {
      setAchievements((prev) =>
        prev.map((ach) => {
          const sugg = suggestions.achievements?.find((s) => s.id === ach.id);
          if (sugg) {
            return {
              ...ach,
              title: sugg.title || ach.title,
              description: sugg.description || ach.description,
            };
          }
          return ach;
        }),
      );
    }

    // 5. Education
    if (Array.isArray(suggestions.education)) {
      setEducation((prev) =>
        prev.map((edu) => {
          const sugg = suggestions.education?.find((s) => s.id === edu.id);
          if (sugg) {
            return {
              ...edu,
              degree: sugg.degree || edu.degree,
              highlights: sugg.highlights || edu.highlights,
            };
          }
          return edu;
        }),
      );
    }

    // 6. Certifications
    if (Array.isArray(suggestions.certifications)) {
      setCertifications((prev) =>
        prev.map((cert) => {
          const sugg = suggestions.certifications?.find((s) => s.id === cert.id);
          if (sugg) {
            return {
              ...cert,
              title: sugg.title || cert.title,
              provider: sugg.provider || cert.provider,
            };
          }
          return cert;
        }),
      );
    }

    toast.success("Applied all suggestions to the form fields!");
  };

  // List Management Helpers
  const addExperience = () => {
    const tempId = `temp_${Date.now()}`;
    setExperience((prev) => [
      ...prev,
      {
        id: tempId,
        role: "New Role",
        company: "Company Name",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: null,
        bullets: ["Accomplished task A", "Optimized process B"],
        techStack: ["React"],
        order: prev.length,
      },
    ]);
  };

  const addProject = () => {
    const tempId = `temp_${Date.now()}`;
    setProjects((prev) => [
      ...prev,
      {
        id: tempId,
        title: "New Project",
        description: "A description of the new project.",
        bullets: ["Developed feature X using React", "Deployed on AWS"],
        techStack: ["Next.js", "TailwindCSS"],
        liveUrl: "",
        githubUrl: "",
        order: prev.length,
      },
    ]);
  };

  const addSkillCategory = () => {
    const tempId = `temp_${Date.now()}`;
    setSkills((prev) => [
      ...prev,
      {
        id: tempId,
        categoryName: "New Category",
        order: prev.length,
        skills: [{ name: "Skill", proficiency: 80, iconKey: "skill" }],
      },
    ]);
  };

  const addEducation = () => {
    const tempId = `temp_${Date.now()}`;
    setEducation((prev) => [
      ...prev,
      {
        id: tempId,
        degree: "Degree Name",
        institution: "Institution Name",
        year: String(new Date().getFullYear()),
        highlights: [],
      },
    ]);
  };

  const addAchievement = () => {
    const tempId = `temp_${Date.now()}`;
    setAchievements((prev) => [
      ...prev,
      {
        id: tempId,
        title: "Achievement Title",
        description: "Brief details about this achievement.",
        date: new Date().toISOString().slice(0, 10),
        imageUrl: "",
        order: prev.length,
      },
    ]);
  };

  const addCertification = () => {
    const tempId = `temp_${Date.now()}`;
    setCertifications((prev) => [
      ...prev,
      {
        id: tempId,
        title: "Certification Title",
        provider: "Issuing Organization",
        date: new Date().toISOString().slice(0, 10),
        credentialUrl: "",
        imageUrl: "",
        order: prev.length,
      },
    ]);
  };

  const getDiffs = () => {
    if (!suggestions) return [];
    const diffs: {
      id: string;
      section: string;
      label: string;
      original: string | string[];
      suggested: string | string[];
      apply: () => void;
    }[] = [];

    // About Me
    if (suggestions.aboutMe) {
      if (suggestions.aboutMe.title && suggestions.aboutMe.title !== aboutMe?.title) {
        diffs.push({
          id: "about_title",
          section: "About Me",
          label: "Professional Title",
          original: aboutMe?.title || "",
          suggested: suggestions.aboutMe.title,
          apply: () => setAboutMe(prev => prev ? { ...prev, title: suggestions.aboutMe!.title! } : null),
        });
      }
      if (suggestions.aboutMe.bio && suggestions.aboutMe.bio !== aboutMe?.bio) {
        diffs.push({
          id: "about_bio",
          section: "About Me",
          label: "Bio Summary",
          original: aboutMe?.bio || "",
          suggested: suggestions.aboutMe.bio,
          apply: () => setAboutMe(prev => prev ? { ...prev, bio: suggestions.aboutMe!.bio! } : null),
        });
      }
      if (suggestions.aboutMe.beyondCodeBio && suggestions.aboutMe.beyondCodeBio !== aboutMe?.beyondCodeBio) {
        diffs.push({
          id: "about_beyond",
          section: "About Me",
          label: "Beyond Code Bio",
          original: aboutMe?.beyondCodeBio || "",
          suggested: suggestions.aboutMe.beyondCodeBio,
          apply: () => setAboutMe(prev => prev ? { ...prev, beyondCodeBio: suggestions.aboutMe!.beyondCodeBio! } : null),
        });
      }
      if (
        suggestions.aboutMe.taglines &&
        suggestions.aboutMe.taglines.join("\n") !== aboutMe?.taglines.join("\n")
      ) {
        diffs.push({
          id: "about_taglines",
          section: "About Me",
          label: "Hero Taglines",
          original: aboutMe?.taglines || [],
          suggested: suggestions.aboutMe.taglines,
          apply: () => setAboutMe(prev => prev ? { ...prev, taglines: suggestions.aboutMe!.taglines! } : null),
        });
      }
    }

    // Experience
    if (Array.isArray(suggestions.experience)) {
      suggestions.experience.forEach(sugg => {
        const orig = experience.find(x => x.id === sugg.id);
        if (orig) {
          if (sugg.role && sugg.role !== orig.role) {
            diffs.push({
              id: `exp_role_${sugg.id}`,
              section: `Experience: ${orig.company}`,
              label: "Role",
              original: orig.role,
              suggested: sugg.role,
              apply: () => setExperience(prev => prev.map(x => x.id === sugg.id ? { ...x, role: sugg.role! } : x)),
            });
          }
          if (sugg.bullets && sugg.bullets.join("\n") !== orig.bullets.join("\n")) {
            diffs.push({
              id: `exp_bullets_${sugg.id}`,
              section: `Experience: ${orig.company}`,
              label: "Accomplishments",
              original: orig.bullets,
              suggested: sugg.bullets,
              apply: () => setExperience(prev => prev.map(x => x.id === sugg.id ? { ...x, bullets: sugg.bullets! } : x)),
            });
          }
        }
      });
    }

    // Projects
    if (Array.isArray(suggestions.projects)) {
      suggestions.projects.forEach(sugg => {
        const orig = projects.find(x => x.id === sugg.id);
        if (orig) {
          if (sugg.title && sugg.title !== orig.title) {
            diffs.push({
              id: `proj_title_${sugg.id}`,
              section: `Project: ${orig.title}`,
              label: "Title",
              original: orig.title,
              suggested: sugg.title,
              apply: () => setProjects(prev => prev.map(x => x.id === sugg.id ? { ...x, title: sugg.title! } : x)),
            });
          }
          if (sugg.description && sugg.description !== orig.description) {
            diffs.push({
              id: `proj_desc_${sugg.id}`,
              section: `Project: ${orig.title}`,
              label: "Description",
              original: orig.description,
              suggested: sugg.description,
              apply: () => setProjects(prev => prev.map(x => x.id === sugg.id ? { ...x, description: sugg.description! } : x)),
            });
          }
          if (sugg.bullets && sugg.bullets.join("\n") !== orig.bullets.join("\n")) {
            diffs.push({
              id: `proj_bullets_${sugg.id}`,
              section: `Project: ${orig.title}`,
              label: "Accomplishments",
              original: orig.bullets,
              suggested: sugg.bullets,
              apply: () => setProjects(prev => prev.map(x => x.id === sugg.id ? { ...x, bullets: sugg.bullets! } : x)),
            });
          }
        }
      });
    }

    // Achievements
    if (Array.isArray(suggestions.achievements)) {
      suggestions.achievements.forEach(sugg => {
        const orig = achievements.find(x => x.id === sugg.id);
        if (orig) {
          if (sugg.title && sugg.title !== orig.title) {
            diffs.push({
              id: `ach_title_${sugg.id}`,
              section: `Achievement: ${orig.title}`,
              label: "Title",
              original: orig.title,
              suggested: sugg.title,
              apply: () => setAchievements(prev => prev.map(x => x.id === sugg.id ? { ...x, title: sugg.title! } : x)),
            });
          }
          if (sugg.description && sugg.description !== orig.description) {
            diffs.push({
              id: `ach_desc_${sugg.id}`,
              section: `Achievement: ${orig.title}`,
              label: "Description",
              original: orig.description,
              suggested: sugg.description,
              apply: () => setAchievements(prev => prev.map(x => x.id === sugg.id ? { ...x, description: sugg.description! } : x)),
            });
          }
        }
      });
    }

    // Education
    if (Array.isArray(suggestions.education)) {
      suggestions.education.forEach(sugg => {
        const orig = education.find(x => x.id === sugg.id);
        if (orig) {
          if (sugg.degree && sugg.degree !== orig.degree) {
            diffs.push({
              id: `edu_degree_${sugg.id}`,
              section: `Education: ${orig.institution}`,
              label: "Degree",
              original: orig.degree,
              suggested: sugg.degree,
              apply: () => setEducation(prev => prev.map(x => x.id === sugg.id ? { ...x, degree: sugg.degree! } : x)),
            });
          }
          if (sugg.highlights && sugg.highlights.join("\n") !== orig.highlights.join("\n")) {
            diffs.push({
              id: `edu_highlights_${sugg.id}`,
              section: `Education: ${orig.institution}`,
              label: "Highlights",
              original: orig.highlights,
              suggested: sugg.highlights,
              apply: () => setEducation(prev => prev.map(x => x.id === sugg.id ? { ...x, highlights: sugg.highlights! } : x)),
            });
          }
        }
      });
    }

    // Certifications
    if (Array.isArray(suggestions.certifications)) {
      suggestions.certifications.forEach(sugg => {
        const orig = certifications.find(x => x.id === sugg.id);
        if (orig) {
          if (sugg.title && sugg.title !== orig.title) {
            diffs.push({
              id: `cert_title_${sugg.id}`,
              section: `Certification: ${orig.provider}`,
              label: "Title",
              original: orig.title,
              suggested: sugg.title,
              apply: () => setCertifications(prev => prev.map(x => x.id === sugg.id ? { ...x, title: sugg.title! } : x)),
            });
          }
          if (sugg.provider && sugg.provider !== orig.provider) {
            diffs.push({
              id: `cert_provider_${sugg.id}`,
              section: `Certification: ${orig.provider}`,
              label: "Provider",
              original: orig.provider,
              suggested: sugg.provider,
              apply: () => setCertifications(prev => prev.map(x => x.id === sugg.id ? { ...x, provider: sugg.provider! } : x)),
            });
          }
        }
      });
    }

    return diffs;
  };

  const renderAiLabel = (
    label: string,
    fieldKey: string,
    currentValue: string | string[],
    applyValue: (val: any) => void,
    uppercase = true,
  ) => {
    return (
      <div className="flex items-center justify-between mb-1">
        <label className={`text-xs font-semibold text-zinc-500 ${uppercase ? "uppercase tracking-wide" : ""}`}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setActiveField({
              name: label,
              key: fieldKey,
              currentValue,
              applyValue,
            });
            setFieldInstruction("Optimize this field for ATS-friendliness and professional tone, ensuring it remains natural and human-written.");
          }}
          className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 transition-colors shrink-0"
        >
          <Sparkles className="size-3 text-teal-500" />
          <span>Ask AI</span>
        </button>
      </div>
    );
  };

  if (loading) {
    return <SectionLoader variant="table" count={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Portfolio Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bulk edit your portfolio data manually or optimize it using custom AI guidelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={fetchPortfolioData}
            disabled={saving}
          >
            <RotateCcw className="size-4 mr-1.5" />
            Reset Form
          </Button>
          <Button
            type="button"
            onClick={savePortfolio}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Save className="size-4 mr-1.5" />
            {saving ? "Saving Changes..." : "Save Portfolio"}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Editor Workspace, Right AI Assistant Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form Columns (8/12) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <Tabs defaultValue="about" className="flex flex-col">
            <div className="border-b border-zinc-200 bg-zinc-50/50 p-2">
              <TabsList className="flex flex-wrap gap-1 justify-start border-none bg-transparent h-auto p-0">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* --- About Tab --- */}
              <TabsContent value="about" className="space-y-6 mt-0">
                {aboutMe ? (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</label>
                        <input
                          type="text"
                          value={aboutMe.name}
                          onChange={(e) => setAboutMe({ ...aboutMe, name: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div className="space-y-2">
                        {renderAiLabel("Title", "title", aboutMe.title, (val) => setAboutMe({ ...aboutMe, title: val as string }))}
                        <input
                          type="text"
                          value={aboutMe.title}
                          onChange={(e) => setAboutMe({ ...aboutMe, title: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                        />
                        {suggestions?.aboutMe?.title && suggestions.aboutMe.title !== aboutMe.title && (
                          <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                            <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                              <span>AI Suggestion:</span>
                              <button
                                type="button"
                                onClick={() => setAboutMe({ ...aboutMe, title: suggestions.aboutMe!.title! })}
                                className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                              >
                                Apply
                              </button>
                            </div>
                            <p>{suggestions.aboutMe.title}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Location</label>
                        <input
                          type="text"
                          value={aboutMe.location}
                          onChange={(e) => setAboutMe({ ...aboutMe, location: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Phone</label>
                        <input
                          type="text"
                          value={aboutMe.phone}
                          onChange={(e) => setAboutMe({ ...aboutMe, phone: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</label>
                        <input
                          type="text"
                          value={aboutMe.email}
                          onChange={(e) => setAboutMe({ ...aboutMe, email: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {renderAiLabel("Bio", "bio", aboutMe.bio, (val) => setAboutMe({ ...aboutMe, bio: val as string }))}
                      <textarea
                        rows={5}
                        value={aboutMe.bio}
                        onChange={(e) => setAboutMe({ ...aboutMe, bio: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                      />
                      {suggestions?.aboutMe?.bio && suggestions.aboutMe.bio !== aboutMe.bio && (
                        <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                          <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                            <span>AI Suggestion:</span>
                            <button
                              type="button"
                              onClick={() => setAboutMe({ ...aboutMe, bio: suggestions.aboutMe!.bio! })}
                              className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                            >
                              Apply
                            </button>
                          </div>
                          <p className="whitespace-pre-wrap">{suggestions.aboutMe.bio}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {renderAiLabel("Beyond Code Bio", "beyondCodeBio", aboutMe.beyondCodeBio, (val) => setAboutMe({ ...aboutMe, beyondCodeBio: val as string }))}
                      <textarea
                        rows={3}
                        value={aboutMe.beyondCodeBio}
                        onChange={(e) => setAboutMe({ ...aboutMe, beyondCodeBio: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                      />
                      {suggestions?.aboutMe?.beyondCodeBio && suggestions.aboutMe.beyondCodeBio !== aboutMe.beyondCodeBio && (
                        <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                          <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                            <span>AI Suggestion:</span>
                            <button
                              type="button"
                              onClick={() => setAboutMe({ ...aboutMe, beyondCodeBio: suggestions.aboutMe!.beyondCodeBio! })}
                              className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                            >
                              Apply
                            </button>
                          </div>
                          <p className="whitespace-pre-wrap">{suggestions.aboutMe.beyondCodeBio}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {renderAiLabel("Hero Taglines", "taglines", aboutMe.taglines, (val) => setAboutMe({ ...aboutMe, taglines: val as string[] }))}
                      <textarea
                        rows={3}
                        value={aboutMe.taglines.join("\n")}
                        onChange={(e) => setAboutMe({ ...aboutMe, taglines: e.target.value.split("\n").filter(Boolean) })}
                        className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800"
                      />
                      {suggestions?.aboutMe?.taglines && suggestions.aboutMe.taglines.join("\n") !== aboutMe.taglines.join("\n") && (
                        <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                          <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                            <span>AI Suggestion:</span>
                            <button
                              type="button"
                              onClick={() => setAboutMe({ ...aboutMe, taglines: suggestions.aboutMe!.taglines! })}
                              className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                            >
                              Apply
                            </button>
                          </div>
                          <ul className="list-disc list-inside">
                            {suggestions.aboutMe.taglines.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </TabsContent>

              {/* --- Experience Tab --- */}
              <TabsContent value="experience" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Work History</h2>
                  <Button type="button" size="sm" onClick={addExperience} className="bg-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="size-3.5 mr-1" />
                    Add Work
                  </Button>
                </div>

                <div className="space-y-6">
                  {experience.map((item, index) => {
                    const expSuggestion = suggestions?.experience?.find((s) => s.id === item.id);

                    return (
                      <div key={item.id} className="relative rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 space-y-4">
                        <button
                          type="button"
                          onClick={() => setExperience(experience.filter((x) => x.id !== item.id))}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-destructive transition-colors"
                          title="Remove experience"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                          <div className="space-y-1">
                            {renderAiLabel("Role", `role_${item.id}`, item.role, (val) => setExperience(experience.map(x => x.id === item.id ? { ...x, role: val as string } : x)), false)}
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((x) => (x.id === item.id ? { ...x, role: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                            {expSuggestion?.role && expSuggestion.role !== item.role && (
                              <div className="mt-1 rounded-lg border border-teal-200 bg-teal-50/30 p-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-teal-800 mb-0.5">
                                  <span>AI Suggested Role:</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExperience(
                                        experience.map((x) => (x.id === item.id ? { ...x, role: expSuggestion.role! } : x)),
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                </div>
                                <p>{expSuggestion.role}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Company</label>
                            <input
                              type="text"
                              value={item.company}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((x) => (x.id === item.id ? { ...x, company: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Dates (e.g. 2021-05-01)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.startDate.slice(0, 10)}
                                onChange={(e) =>
                                  setExperience(
                                    experience.map((x) => (x.id === item.id ? { ...x, startDate: e.target.value } : x)),
                                  )
                                }
                                placeholder="Start Date"
                                className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                              />
                              <input
                                type="text"
                                value={item.endDate ? item.endDate.slice(0, 10) : ""}
                                onChange={(e) =>
                                  setExperience(
                                    experience.map((x) =>
                                      x.id === item.id ? { ...x, endDate: e.target.value || null } : x,
                                    ),
                                  )
                                }
                                placeholder="End Date (or blank)"
                                className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Tech Stack (Comma-separated)</label>
                            <input
                              type="text"
                              value={item.techStack.join(", ")}
                              onChange={(e) =>
                                setExperience(
                                  experience.map((x) =>
                                    x.id === item.id
                                      ? {
                                          ...x,
                                          techStack: e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean),
                                        }
                                      : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          {renderAiLabel("Accomplishments", `bullets_${item.id}`, item.bullets, (val) => setExperience(experience.map(x => x.id === item.id ? { ...x, bullets: val as string[] } : x)), false)}
                          <textarea
                            rows={4}
                            value={item.bullets.join("\n")}
                            onChange={(e) =>
                              setExperience(
                                experience.map((x) =>
                                  x.id === item.id ? { ...x, bullets: e.target.value.split("\n") } : x,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                          />
                          {expSuggestion?.bullets && expSuggestion.bullets.join("\n") !== item.bullets.join("\n") && (
                            <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                              <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                                <span>AI Suggested Bullets:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExperience(
                                      experience.map((x) =>
                                        x.id === item.id ? { ...x, bullets: expSuggestion.bullets! } : x,
                                      ),
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                                >
                                  Apply
                                </button>
                              </div>
                              <ul className="list-disc list-inside space-y-1">
                                {expSuggestion.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* --- Projects Tab --- */}
              <TabsContent value="projects" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Projects</h2>
                  <Button type="button" size="sm" onClick={addProject} className="bg-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="size-3.5 mr-1" />
                    Add Project
                  </Button>
                </div>

                <div className="space-y-6">
                  {projects.map((item) => {
                    const projSuggestion = suggestions?.projects?.find((s) => s.id === item.id);

                    return (
                      <div key={item.id} className="relative rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 space-y-4">
                        <button
                          type="button"
                          onClick={() => setProjects(projects.filter((x) => x.id !== item.id))}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-destructive transition-colors"
                          title="Remove project"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                          <div className="space-y-1">
                            {renderAiLabel("Project Title", `title_${item.id}`, item.title, (val) => setProjects(projects.map(x => x.id === item.id ? { ...x, title: val as string } : x)), false)}
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                setProjects(
                                  projects.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                            {projSuggestion?.title && projSuggestion.title !== item.title && (
                              <div className="mt-1 rounded-lg border border-teal-200 bg-teal-50/30 p-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-teal-800 mb-0.5">
                                  <span>AI Suggestion:</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setProjects(
                                        projects.map((x) => (x.id === item.id ? { ...x, title: projSuggestion.title! } : x)),
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                </div>
                                <p>{projSuggestion.title}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Tech Stack (Comma-separated)</label>
                            <input
                              type="text"
                              value={item.techStack.join(", ")}
                              onChange={(e) =>
                                setProjects(
                                  projects.map((x) =>
                                    x.id === item.id
                                      ? {
                                          ...x,
                                          techStack: e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean),
                                        }
                                      : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Live URL</label>
                            <input
                              type="text"
                              value={item.liveUrl}
                              onChange={(e) =>
                                setProjects(
                                  projects.map((x) => (x.id === item.id ? { ...x, liveUrl: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">GitHub URL</label>
                            <input
                              type="text"
                              value={item.githubUrl}
                              onChange={(e) =>
                                setProjects(
                                  projects.map((x) => (x.id === item.id ? { ...x, githubUrl: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          {renderAiLabel("Description", `description_${item.id}`, item.description, (val) => setProjects(projects.map(x => x.id === item.id ? { ...x, description: val as string } : x)), false)}
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) =>
                              setProjects(
                                projects.map((x) => (x.id === item.id ? { ...x, description: e.target.value } : x)),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                          />
                          {projSuggestion?.description && projSuggestion.description !== item.description && (
                            <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                              <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                                <span>AI Suggestion:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProjects(
                                      projects.map((x) =>
                                        x.id === item.id ? { ...x, description: projSuggestion.description! } : x,
                                      ),
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                                >
                                  Apply
                                </button>
                              </div>
                              <p>{projSuggestion.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          {renderAiLabel("Accomplishments", `bullets_${item.id}`, item.bullets, (val) => setProjects(projects.map(x => x.id === item.id ? { ...x, bullets: val as string[] } : x)), false)}
                          <textarea
                            rows={3}
                            value={item.bullets.join("\n")}
                            onChange={(e) =>
                              setProjects(
                                projects.map((x) =>
                                  x.id === item.id ? { ...x, bullets: e.target.value.split("\n") } : x,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                          />
                          {projSuggestion?.bullets && projSuggestion.bullets.join("\n") !== item.bullets.join("\n") && (
                            <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                              <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                                <span>AI Suggested Bullets:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProjects(
                                      projects.map((x) =>
                                        x.id === item.id ? { ...x, bullets: projSuggestion.bullets! } : x,
                                      ),
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                                >
                                  Apply
                                </button>
                              </div>
                              <ul className="list-disc list-inside space-y-1">
                                {projSuggestion.bullets.map((b, idx) => (
                                  <li key={idx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* --- Skills Tab --- */}
              <TabsContent value="skills" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Skills Inventory</h2>
                  <Button type="button" size="sm" onClick={addSkillCategory} className="bg-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="size-3.5 mr-1" />
                    Add Category
                  </Button>
                </div>

                <div className="space-y-6">
                  {skills.map((cat) => (
                    <div key={cat.id} className="relative rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 space-y-4">
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((x) => x.id !== cat.id))}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-destructive transition-colors"
                        title="Remove category"
                      >
                        <Trash2 className="size-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-zinc-500">Category Name</label>
                          <input
                            type="text"
                            value={cat.categoryName}
                            onChange={(e) =>
                              setSkills(
                                skills.map((x) => (x.id === cat.id ? { ...x, categoryName: e.target.value } : x)),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-zinc-500">Skills list (Format: Skill Name | Proficiency)</label>
                        </div>
                        <textarea
                          rows={4}
                          value={cat.skills.map((s) => `${s.name} | ${s.proficiency}`).join("\n")}
                          onChange={(e) => {
                            const parsed = e.target.value
                              .split("\n")
                              .map((line) => {
                                const parts = line.split("|");
                                const name = parts[0]?.trim();
                                const prof = Number(parts[1]?.trim()) || 0;
                                return {
                                  name: name || "",
                                  proficiency: prof,
                                  iconKey: name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "",
                                };
                              })
                              .filter((s) => s.name);

                            setSkills(skills.map((x) => (x.id === cat.id ? { ...x, skills: parsed } : x)));
                          }}
                          placeholder="React | 90&#10;Node.js | 85"
                          className="w-full rounded-lg border border-zinc-200 p-2.5 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* --- Education Tab --- */}
              <TabsContent value="education" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Education</h2>
                  <Button type="button" size="sm" onClick={addEducation} className="bg-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="size-3.5 mr-1" />
                    Add Education
                  </Button>
                </div>

                <div className="space-y-6">
                  {education.map((item) => {
                    const eduSuggestion = suggestions?.education?.find((s) => s.id === item.id);

                    return (
                      <div key={item.id} className="relative rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 space-y-4">
                        <button
                          type="button"
                          onClick={() => setEducation(education.filter((x) => x.id !== item.id))}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-destructive transition-colors"
                          title="Remove education"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-8">
                          <div className="space-y-1">
                            {renderAiLabel("Degree", `degree_${item.id}`, item.degree, (val) => setEducation(education.map(x => x.id === item.id ? { ...x, degree: val as string } : x)), false)}
                            <input
                              type="text"
                              value={item.degree}
                              onChange={(e) =>
                                setEducation(
                                  education.map((x) => (x.id === item.id ? { ...x, degree: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                            {eduSuggestion?.degree && eduSuggestion.degree !== item.degree && (
                              <div className="mt-1 rounded-lg border border-teal-200 bg-teal-50/30 p-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-teal-800 mb-0.5">
                                  <span>AI Suggestion:</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEducation(
                                        education.map((x) => (x.id === item.id ? { ...x, degree: eduSuggestion.degree! } : x)),
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                </div>
                                <p>{eduSuggestion.degree}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Institution</label>
                            <input
                              type="text"
                              value={item.institution}
                              onChange={(e) =>
                                setEducation(
                                  education.map((x) => (x.id === item.id ? { ...x, institution: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Year</label>
                            <input
                              type="text"
                              value={item.year}
                              onChange={(e) =>
                                setEducation(
                                  education.map((x) => (x.id === item.id ? { ...x, year: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          {renderAiLabel("Highlights", `highlights_${item.id}`, item.highlights, (val) => setEducation(education.map(x => x.id === item.id ? { ...x, highlights: val as string[] } : x)), false)}
                          <textarea
                            rows={2}
                            value={item.highlights.join("\n")}
                            onChange={(e) =>
                              setEducation(
                                education.map((x) =>
                                  x.id === item.id ? { ...x, highlights: e.target.value.split("\n") } : x,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                          />
                          {eduSuggestion?.highlights && eduSuggestion.highlights.join("\n") !== item.highlights.join("\n") && (
                            <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                              <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                                <span>AI Suggestion:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEducation(
                                      education.map((x) =>
                                        x.id === item.id ? { ...x, highlights: eduSuggestion.highlights! } : x,
                                      ),
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                                >
                                  Apply
                                </button>
                              </div>
                              <ul className="list-disc list-inside">
                                {eduSuggestion.highlights.map((h, idx) => (
                                  <li key={idx}>{h}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* --- Achievements Tab --- */}
              <TabsContent value="achievements" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Achievements</h2>
                  <Button type="button" size="sm" onClick={addAchievement} className="bg-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="size-3.5 mr-1" />
                    Add Achievement
                  </Button>
                </div>

                <div className="space-y-6">
                  {achievements.map((item) => {
                    const achSuggestion = suggestions?.achievements?.find((s) => s.id === item.id);

                    return (
                      <div key={item.id} className="relative rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 space-y-4">
                        <button
                          type="button"
                          onClick={() => setAchievements(achievements.filter((x) => x.id !== item.id))}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-destructive transition-colors"
                          title="Remove achievement"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                          <div className="space-y-1">
                            {renderAiLabel("Title", `title_${item.id}`, item.title, (val) => setAchievements(achievements.map(x => x.id === item.id ? { ...x, title: val as string } : x)), false)}
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                setAchievements(
                                  achievements.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                            {achSuggestion?.title && achSuggestion.title !== item.title && (
                              <div className="mt-1 rounded-lg border border-teal-200 bg-teal-50/30 p-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-teal-800 mb-0.5">
                                  <span>AI Suggestion:</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAchievements(
                                        achievements.map((x) =>
                                          x.id === item.id ? { ...x, title: achSuggestion.title! } : x,
                                        ),
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                </div>
                                <p>{achSuggestion.title}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Date (e.g. 2020-01-01)</label>
                            <input
                              type="text"
                              value={item.date.slice(0, 10)}
                              onChange={(e) =>
                                setAchievements(
                                  achievements.map((x) => (x.id === item.id ? { ...x, date: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Certificate Image URL</label>
                            <input
                              type="text"
                              value={item.imageUrl}
                              onChange={(e) =>
                                setAchievements(
                                  achievements.map((x) => (x.id === item.id ? { ...x, imageUrl: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Display Order</label>
                            <input
                              type="number"
                              value={item.order}
                              onChange={(e) =>
                                setAchievements(
                                  achievements.map((x) =>
                                    x.id === item.id ? { ...x, order: Number(e.target.value) || 0 } : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          {renderAiLabel("Description", `description_${item.id}`, item.description, (val) => setAchievements(achievements.map(x => x.id === item.id ? { ...x, description: val as string } : x)), false)}
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) =>
                              setAchievements(
                                achievements.map((x) => (x.id === item.id ? { ...x, description: e.target.value } : x)),
                                )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                          />
                          {achSuggestion?.description && achSuggestion.description !== item.description && (
                            <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs leading-relaxed text-zinc-700">
                              <div className="flex items-center justify-between font-bold text-teal-800 uppercase tracking-wide mb-1">
                                <span>AI Suggestion:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAchievements(
                                      achievements.map((x) =>
                                        x.id === item.id ? { ...x, description: achSuggestion.description! } : x,
                                      ),
                                    )
                                  }
                                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-medium normal-case"
                                >
                                  Apply
                                </button>
                              </div>
                              <p>{achSuggestion.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* --- Certifications Tab --- */}
              <TabsContent value="certifications" className="space-y-6 mt-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Certifications</h2>
                  <Button type="button" size="sm" onClick={addCertification} className="bg-zinc-800 text-white hover:bg-zinc-900">
                    <Plus className="size-3.5 mr-1" />
                    Add Certification
                  </Button>
                </div>

                <div className="space-y-6">
                  {certifications.map((item) => {
                    const certSuggestion = suggestions?.certifications?.find((s) => s.id === item.id);

                    return (
                      <div key={item.id} className="relative rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 space-y-4">
                        <button
                          type="button"
                          onClick={() => setCertifications(certifications.filter((x) => x.id !== item.id))}
                          className="absolute top-4 right-4 text-zinc-400 hover:text-destructive transition-colors"
                          title="Remove certification"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-8">
                          <div className="space-y-1">
                            {renderAiLabel("Title", `title_${item.id}`, item.title, (val) => setCertifications(certifications.map(x => x.id === item.id ? { ...x, title: val as string } : x)), false)}
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) =>
                                setCertifications(
                                  certifications.map((x) => (x.id === item.id ? { ...x, title: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                            {certSuggestion?.title && certSuggestion.title !== item.title && (
                              <div className="mt-1 rounded-lg border border-teal-200 bg-teal-50/30 p-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-teal-800 mb-0.5">
                                  <span>AI Suggestion:</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCertifications(
                                        certifications.map((x) =>
                                          x.id === item.id ? { ...x, title: certSuggestion.title! } : x,
                                        ),
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                </div>
                                <p>{certSuggestion.title}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {renderAiLabel("Provider", `provider_${item.id}`, item.provider, (val) => setCertifications(certifications.map(x => x.id === item.id ? { ...x, provider: val as string } : x)), false)}
                            <input
                              type="text"
                              value={item.provider}
                              onChange={(e) =>
                                setCertifications(
                                  certifications.map((x) => (x.id === item.id ? { ...x, provider: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                            {certSuggestion?.provider && certSuggestion.provider !== item.provider && (
                              <div className="mt-1 rounded-lg border border-teal-200 bg-teal-50/30 p-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-teal-800 mb-0.5">
                                  <span>AI Suggestion:</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCertifications(
                                        certifications.map((x) =>
                                          x.id === item.id ? { ...x, provider: certSuggestion.provider! } : x,
                                        ),
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-teal-600 text-white text-[10px]"
                                  >
                                    Apply
                                  </button>
                                </div>
                                <p>{certSuggestion.provider}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Date (e.g. 2020-01-01)</label>
                            <input
                              type="text"
                              value={item.date.slice(0, 10)}
                              onChange={(e) =>
                                setCertifications(
                                  certifications.map((x) => (x.id === item.id ? { ...x, date: e.target.value } : x)),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium text-zinc-500">Credential Verification URL</label>
                            <input
                              type="text"
                              value={item.credentialUrl}
                              onChange={(e) =>
                                setCertifications(
                                  certifications.map((x) =>
                                    x.id === item.id ? { ...x, credentialUrl: e.target.value } : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Display Order</label>
                            <input
                              type="number"
                              value={item.order}
                              onChange={(e) =>
                                setCertifications(
                                  certifications.map((x) =>
                                    x.id === item.id ? { ...x, order: Number(e.target.value) || 0 } : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-zinc-500">Certificate Image URL</label>
                          <input
                            type="text"
                            value={item.imageUrl}
                            onChange={(e) =>
                              setCertifications(
                                certifications.map((x) =>
                                  x.id === item.id ? { ...x, imageUrl: e.target.value } : x,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 p-2 text-sm bg-white text-zinc-800 font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* AI Assistant Sidebar (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-teal-950 to-zinc-900 text-zinc-100 rounded-2xl p-6 border border-teal-900 shadow-lg space-y-5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500 text-teal-950">
                <Brain className="size-4" />
              </div>
              <h2 className="text-sm font-semibold tracking-wider text-teal-400 uppercase">AI Portfolio Assistant</h2>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Describe how you want to improve your portfolio. Gemini will analyze your dataset and suggest ATS-friendly, professional, human-style improvements.
            </p>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Quick Presets</span>
              <div className="flex flex-col gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPrompt(p.prompt)}
                    className="w-full text-left rounded-lg bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 text-xs border border-zinc-700/50 hover:border-zinc-700 transition-all text-zinc-200 flex items-center justify-between group"
                  >
                    <span>{p.label}</span>
                    <ChevronRight className="size-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Form */}
            <div className="space-y-2 flex flex-col">
              <label htmlFor="copilot-prompt-textarea" className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                Custom Instructions
              </label>
              <textarea
                id="copilot-prompt-textarea"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                placeholder="Example: Optimize my experience bullets to focus on metrics like loading speeds and API response times..."
                className="w-full rounded-lg border border-zinc-850 p-2.5 text-xs bg-zinc-850 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
              <Button
                type="button"
                onClick={generateSuggestions}
                disabled={!prompt.trim() || generating}
                className="w-full bg-teal-500 hover:bg-teal-400 text-teal-950 font-semibold"
              >
                {generating ? (
                  <>
                    <Sparkles className="size-4 animate-spin mr-1.5" />
                    Generating Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-1.5" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions actions */}
            {suggestions ? (
              <div className="border-t border-zinc-800 pt-4 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-400">Suggestions Ready</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">New</Badge>
                </div>
                
                {getDiffs().length > 0 ? (
                  <>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyAllSuggestions}
                        className="w-full text-zinc-200 border-zinc-700 hover:bg-zinc-800 text-xs"
                      >
                        <Check className="size-3.5 mr-1" />
                        Apply All Suggestions
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSuggestions(null)}
                        className="text-zinc-400 hover:text-zinc-300 text-xs px-2"
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Suggested Changes ({getDiffs().length})</p>
                      {getDiffs().map((diff) => (
                        <div key={diff.id} className="rounded-lg border border-zinc-850 bg-zinc-900/60 p-2.5 space-y-2 text-[11px]">
                          <div className="flex items-center justify-between text-zinc-300">
                            <div className="max-w-[75%]">
                              <span className="font-semibold text-teal-400 block truncate">{diff.section}</span>
                              <span className="text-zinc-500 text-[10px]">{diff.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={diff.apply}
                              className="px-2 py-0.5 rounded bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold transition-colors shrink-0"
                            >
                              Apply
                            </button>
                          </div>
                          
                          <div className="space-y-1 bg-zinc-950/40 rounded p-1.5 border border-zinc-900/50">
                            {Array.isArray(diff.suggested) ? (
                              <ul className="list-disc list-inside text-zinc-300 space-y-0.5 pl-0.5">
                                {diff.suggested.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-zinc-350 leading-normal whitespace-pre-wrap">{diff.suggested}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-3.5 text-center text-xs text-emerald-400">
                    🎉 All suggestions applied! Click <strong>Save Portfolio</strong> above to publish your changes.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Quick instructions guide */}
          <div className="bg-zinc-100/80 rounded-xl p-4 border border-zinc-200 text-zinc-600 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-zinc-700">
              <HelpCircle className="size-4 text-zinc-500" />
              <span>How it works</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-500 pl-0.5">
              <li>Review your data sections in the tabbed panel.</li>
              <li>Use the AI Copilot to generate suggestions.</li>
              <li>Review the suggested text inline in each tab.</li>
              <li>Click <strong>Apply</strong> to keep a change, or edit it manually.</li>
              <li>Click <strong>Save Portfolio</strong> to commit updates.</li>
            </ul>
          </div>
      {/* Field-wise AI Assistant Modal */}
      <Dialog
        open={Boolean(activeField)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveField(null);
            setFieldInstruction("");
            setFieldSuggestion(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg gap-4 bg-white border border-zinc-200 shadow-xl rounded-xl">
          {activeField ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5 text-teal-700 text-lg font-bold">
                  <Brain className="size-5 text-teal-600 animate-pulse" />
                  Field AI Optimizer
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-505">
                  Suggest professional updates for field: <strong className="text-zinc-800 font-semibold">{activeField.name}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm mt-2">
                {/* Original Value Display */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Current Value</span>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-zinc-700 whitespace-pre-wrap max-h-[150px] overflow-y-auto text-xs leading-relaxed">
                    {Array.isArray(activeField.currentValue) ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {activeField.currentValue.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    ) : (
                      activeField.currentValue
                    )}
                  </div>
                </div>

                {/* Rewrite Instructions */}
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="field-instruction-textarea" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Optimization Instructions
                  </label>
                  <textarea
                    id="field-instruction-textarea"
                    rows={3}
                    value={fieldInstruction}
                    onChange={(e) => setFieldInstruction(e.target.value)}
                    disabled={generatingField}
                    placeholder="E.g., Make it more concise, emphasize cloud scale, add metrics, rewrite in third person..."
                    className="w-full rounded-lg border border-zinc-200 p-2.5 text-xs bg-white text-zinc-800 disabled:opacity-50 placeholder:text-zinc-400 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Suggestion Result */}
                {fieldSuggestion && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">AI Recommendation</span>
                    <div className="rounded-lg border border-teal-200 bg-teal-50/10 p-3 text-zinc-800 whitespace-pre-wrap max-h-[150px] overflow-y-auto text-xs leading-relaxed">
                      {Array.isArray(fieldSuggestion) ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {fieldSuggestion.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        fieldSuggestion
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-150 pt-3.5 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={generatingField}
                  onClick={() => {
                    setActiveField(null);
                    setFieldInstruction("");
                    setFieldSuggestion(null);
                  }}
                  className="text-xs"
                >
                  Close
                </Button>
                
                <Button
                  type="button"
                  onClick={optimizeField}
                  disabled={generatingField || !fieldInstruction.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                >
                  {generatingField ? "Optimizing..." : "Generate Suggestion"}
                </Button>
                
                {fieldSuggestion && (
                  <Button
                    type="button"
                    onClick={() => {
                      activeField.applyValue(fieldSuggestion);
                      setActiveField(null);
                      setFieldInstruction("");
                      setFieldSuggestion(null);
                      toast.success("Applied suggestion to field!");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    Apply Suggestion
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
