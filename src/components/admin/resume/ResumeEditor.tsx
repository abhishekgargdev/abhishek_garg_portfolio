"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Brain,
  Download,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ResumeFieldAiDialog } from "@/components/admin/resume/ResumeFieldAiDialog";
import {
  EMPTY_RESUME_STATE,
  toResumeData,
  type ResumeEditorState,
} from "@/components/admin/resume/resume-editor-types";
import { ResumePreview } from "@/components/resume/ResumePreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLoader } from "@/components/loader/SectionLoader";
import { Textarea } from "@/components/ui/textarea";
import { resumeFilename } from "@/lib/resume-types";
import {
  PORTFOLIO_SOCIAL_PLATFORMS,
  recordToSocialLinks,
  socialLinksToRecord,
} from "@/lib/social-links";

const AI_PRESETS = [
  {
    label: "Optimize for ATS",
    prompt:
      "Make all experience bullets, project descriptions, and achievements ATS-friendly with strong action verbs and concrete metrics.",
  },
  {
    label: "Humanize writing",
    prompt:
      "Rewrite bio and bullets to sound natural and human. Remove AI buzzwords and keep a professional developer voice.",
  },
  {
    label: "Add metrics & impact",
    prompt:
      "Emphasize scale, percentages, and business impact across experience and project bullets.",
  },
];

type AiFieldTarget = {
  name: string;
  currentValue: string | string[];
  apply: (value: string | string[]) => void;
};

type AiSuggestions = {
  aboutMe?: { title?: string; bio?: string };
  experience?: { id: string; role?: string; bullets?: string[] }[];
  projects?: {
    id: string;
    title?: string;
    description?: string;
    bullets?: string[];
  }[];
  achievements?: { id: string; title?: string; description?: string }[];
  education?: { id: string; degree?: string; highlights?: string[] }[];
  certifications?: { id: string; title?: string; provider?: string }[];
};

function FieldLabel({
  label,
  onAi,
}: {
  label: string;
  onAi?: () => void;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {onAi ? (
        <button
          type="button"
          onClick={onAi}
          className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700"
        >
          <Sparkles className="size-3" />
          Ask AI
        </button>
      ) : null}
    </div>
  );
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(value: string[]): string {
  return value.join("\n");
}

export function ResumeEditor() {
  const [state, setState] = useState<ResumeEditorState>(EMPTY_RESUME_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(AI_PRESETS[0].prompt);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [aiField, setAiField] = useState<AiFieldTarget | null>(null);

  const previewData = useMemo(() => toResumeData(state), [state]);
  const downloadFilename = resumeFilename(state.aboutMe.name);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/portfolio-data");
      const data = (await response.json()) as {
        aboutMe?: {
          name: string;
          title: string;
          bio: string;
          location: string;
          phone: string;
          email: string;
          portfolioUrl?: string;
          openSourceContributions?: string[];
          socialLinks: { platform: string; url: string }[];
        };
        experience?: ResumeEditorState["experience"];
        projects?: ResumeEditorState["projects"];
        skills?: ResumeEditorState["skills"];
        education?: ResumeEditorState["education"];
        achievements?: ResumeEditorState["achievements"];
        certifications?: ResumeEditorState["certifications"];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load resume data");
      }

      setState({
        aboutMe: {
          name: data.aboutMe?.name ?? "",
          title: data.aboutMe?.title ?? "",
          bio: data.aboutMe?.bio ?? "",
          location: data.aboutMe?.location ?? "",
          phone: data.aboutMe?.phone ?? "",
          email: data.aboutMe?.email ?? "",
          portfolioUrl: data.aboutMe?.portfolioUrl ?? "",
          openSourceContributions: data.aboutMe?.openSourceContributions ?? [],
          socialLinks: data.aboutMe?.socialLinks ?? [],
        },
        experience: data.experience ?? [],
        projects: data.projects ?? [],
        skills: data.skills ?? [],
        education: data.education ?? [],
        achievements: (data.achievements ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          order: item.order,
        })),
        certifications: (data.certifications ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          provider: item.provider,
          date: item.date,
          credentialUrl: item.credentialUrl,
          order: item.order,
        })),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load resume data",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const saveResume = async () => {
    setSaving(true);
    try {
      const socialRecord = socialLinksToRecord(state.aboutMe.socialLinks);
      const response = await fetch("/api/admin/portfolio-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutMe: {
            name: state.aboutMe.name,
            title: state.aboutMe.title,
            bio: state.aboutMe.bio,
            location: state.aboutMe.location,
            phone: state.aboutMe.phone,
            email: state.aboutMe.email,
            portfolioUrl: state.aboutMe.portfolioUrl,
            openSourceContributions: state.aboutMe.openSourceContributions,
            socialLinks: recordToSocialLinks(socialRecord),
          },
          experience: state.experience,
          projects: state.projects,
          skills: state.skills,
          education: state.education,
          achievements: state.achievements,
          certifications: state.certifications,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save resume");
      }
      toast.success("Resume saved successfully");
      setSuggestions(null);
      await fetchData();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save resume",
      );
    } finally {
      setSaving(false);
    }
  };

  const generateSuggestions = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/admin/portfolio-data/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentData: {
            aboutMe: state.aboutMe,
            experience: state.experience,
            projects: state.projects,
            achievements: state.achievements,
            education: state.education,
            certifications: state.certifications,
          },
        }),
      });
      const data = (await response.json()) as {
        suggestions?: AiSuggestions;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }
      setSuggestions(data.suggestions ?? null);
      toast.success("AI suggestions ready — review inline suggestions");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate suggestions",
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateAbout = (patch: Partial<ResumeEditorState["aboutMe"]>) => {
    setState((prev) => ({
      ...prev,
      aboutMe: { ...prev.aboutMe, ...patch },
    }));
  };

  if (loading) {
    return <SectionLoader variant="table" count={8} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Resume Builder
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Edit every resume field, preview the PDF live, and use AI to polish
            content for ATS and top-tier engineering roles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void fetchData()}
            disabled={saving}
          >
            <RotateCcw className="mr-1.5 size-4" />
            Reset
          </Button>
          <a
            href="/api/resume/download"
            download={downloadFilename}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent"
          >
            <Download className="size-4" />
            Download PDF
          </a>
          <Button
            type="button"
            size="sm"
            onClick={() => void saveResume()}
            disabled={saving}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            <Save className="mr-1.5 size-4" />
            {saving ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-5">
          <div className="rounded-2xl border bg-card shadow-sm">
            <Accordion
              multiple
              defaultValue={["header", "summary", "experience"]}
              className="px-4"
            >
              <AccordionItem value="header">
                <AccordionTrigger className="text-sm font-semibold">
                  Header & Contact
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel label="Full Name" />
                      <Input
                        value={state.aboutMe.name}
                        onChange={(e) => updateAbout({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <FieldLabel
                        label="Professional Title"
                        onAi={() =>
                          setAiField({
                            name: "Professional Title",
                            currentValue: state.aboutMe.title,
                            apply: (val) =>
                              updateAbout({ title: String(val) }),
                          })
                        }
                      />
                      <Input
                        value={state.aboutMe.title}
                        onChange={(e) => updateAbout({ title: e.target.value })}
                      />
                      {suggestions?.aboutMe?.title &&
                      suggestions.aboutMe.title !== state.aboutMe.title ? (
                        <SuggestionChip
                          text={suggestions.aboutMe.title}
                          onApply={() =>
                            updateAbout({ title: suggestions.aboutMe!.title! })
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel label="Location" />
                      <Input
                        value={state.aboutMe.location}
                        onChange={(e) =>
                          updateAbout({ location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel label="Phone" />
                      <Input
                        value={state.aboutMe.phone}
                        onChange={(e) => updateAbout({ phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel label="Email" />
                      <Input
                        type="email"
                        value={state.aboutMe.email}
                        onChange={(e) => updateAbout({ email: e.target.value })}
                      />
                    </div>
                    <div>
                      <FieldLabel label="Portfolio URL" />
                      <Input
                        placeholder="https://yourportfolio.com"
                        value={state.aboutMe.portfolioUrl}
                        onChange={(e) =>
                          updateAbout({ portfolioUrl: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Social Links" />
                    {PORTFOLIO_SOCIAL_PLATFORMS.map((platform) => {
                      const record = socialLinksToRecord(
                        state.aboutMe.socialLinks,
                      );
                      return (
                        <div key={platform.key} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            {platform.label}
                          </Label>
                          <Input
                            value={record[platform.key] ?? ""}
                            onChange={(e) => {
                              const next = {
                                ...socialLinksToRecord(
                                  state.aboutMe.socialLinks,
                                ),
                                [platform.key]: e.target.value,
                              };
                              updateAbout({
                                socialLinks: recordToSocialLinks(next),
                              });
                            }}
                            placeholder={platform.placeholder}
                          />
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="summary">
                <AccordionTrigger className="text-sm font-semibold">
                  Professional Summary
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <FieldLabel
                    label="Summary"
                    onAi={() =>
                      setAiField({
                        name: "Professional Summary",
                        currentValue: state.aboutMe.bio,
                        apply: (val) => updateAbout({ bio: String(val) }),
                      })
                    }
                  />
                  <Textarea
                    rows={6}
                    value={state.aboutMe.bio}
                    onChange={(e) => updateAbout({ bio: e.target.value })}
                  />
                  {suggestions?.aboutMe?.bio &&
                  suggestions.aboutMe.bio !== state.aboutMe.bio ? (
                    <SuggestionChip
                      text={suggestions.aboutMe.bio}
                      onApply={() =>
                        updateAbout({ bio: suggestions.aboutMe!.bio! })
                      }
                    />
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="skills">
                <AccordionTrigger className="text-sm font-semibold">
                  Technical Skills
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          skills: [
                            ...prev.skills,
                            {
                              id: `temp_${Date.now()}`,
                              categoryName: "New Category",
                              order: prev.skills.length,
                              skills: [{ name: "Skill", proficiency: 80, iconKey: "skill" }],
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Category
                    </Button>
                  </div>
                  {state.skills.map((cat) => (
                    <div
                      key={cat.id}
                      className="relative space-y-2 rounded-xl border bg-muted/20 p-4"
                    >
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            skills: prev.skills.filter((x) => x.id !== cat.id),
                          }))
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <Input
                        value={cat.categoryName}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            skills: prev.skills.map((x) =>
                              x.id === cat.id
                                ? { ...x, categoryName: e.target.value }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Category (e.g. Languages)"
                      />
                      <Textarea
                        rows={3}
                        value={cat.skills.map((s) => s.name).join(", ")}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            skills: prev.skills.map((x) =>
                              x.id === cat.id
                                ? {
                                    ...x,
                                    skills: e.target.value
                                      .split(",")
                                      .map((name) => name.trim())
                                      .filter(Boolean)
                                      .map((name) => ({
                                        name,
                                        proficiency: 80,
                                        iconKey: name
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]+/g, "-"),
                                      })),
                                  }
                                : x,
                            ),
                          }))
                        }
                        placeholder="JavaScript, TypeScript, Python"
                      />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="experience">
                <AccordionTrigger className="text-sm font-semibold">
                  Work Experience
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          experience: [
                            ...prev.experience,
                            {
                              id: `temp_${Date.now()}`,
                              role: "Role Title",
                              company: "Company",
                              startDate: new Date().toISOString().slice(0, 10),
                              endDate: null,
                              bullets: [""],
                              techStack: [],
                              order: prev.experience.length,
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Role
                    </Button>
                  </div>
                  {state.experience.map((job) => {
                    const sugg = suggestions?.experience?.find(
                      (s) => s.id === job.id,
                    );
                    return (
                      <div
                        key={job.id}
                        className="relative space-y-3 rounded-xl border bg-muted/20 p-4"
                      >
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              experience: prev.experience.filter(
                                (x) => x.id !== job.id,
                              ),
                            }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </button>
                        <div className="grid gap-3 pr-8 sm:grid-cols-2">
                          <div>
                            <FieldLabel
                              label="Role"
                              onAi={() =>
                                setAiField({
                                  name: "Experience Role",
                                  currentValue: job.role,
                                  apply: (val) =>
                                    setState((prev) => ({
                                      ...prev,
                                      experience: prev.experience.map((x) =>
                                        x.id === job.id
                                          ? { ...x, role: String(val) }
                                          : x,
                                      ),
                                    })),
                                })
                              }
                            />
                            <Input
                              value={job.role}
                              onChange={(e) =>
                                setState((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((x) =>
                                    x.id === job.id
                                      ? { ...x, role: e.target.value }
                                      : x,
                                  ),
                                }))
                              }
                            />
                          </div>
                          <div>
                            <FieldLabel label="Company" />
                            <Input
                              value={job.company}
                              onChange={(e) =>
                                setState((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((x) =>
                                    x.id === job.id
                                      ? { ...x, company: e.target.value }
                                      : x,
                                  ),
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            type="date"
                            value={job.startDate.slice(0, 10)}
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                experience: prev.experience.map((x) =>
                                  x.id === job.id
                                    ? { ...x, startDate: e.target.value }
                                    : x,
                                ),
                              }))
                            }
                          />
                          <Input
                            type="date"
                            value={job.endDate?.slice(0, 10) ?? ""}
                            placeholder="Present"
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                experience: prev.experience.map((x) =>
                                  x.id === job.id
                                    ? {
                                        ...x,
                                        endDate: e.target.value || null,
                                      }
                                    : x,
                                ),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <FieldLabel
                            label="Bullets (one per line)"
                            onAi={() =>
                              setAiField({
                                name: "Experience Bullets",
                                currentValue: job.bullets,
                                apply: (val) =>
                                  setState((prev) => ({
                                    ...prev,
                                    experience: prev.experience.map((x) =>
                                      x.id === job.id
                                        ? {
                                            ...x,
                                            bullets: Array.isArray(val)
                                              ? val
                                              : linesToArray(String(val)),
                                          }
                                        : x,
                                    ),
                                  })),
                              })
                            }
                          />
                          <Textarea
                            rows={5}
                            value={arrayToLines(job.bullets)}
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                experience: prev.experience.map((x) =>
                                  x.id === job.id
                                    ? { ...x, bullets: linesToArray(e.target.value) }
                                    : x,
                                ),
                              }))
                            }
                          />
                          {sugg?.bullets ? (
                            <SuggestionChip
                              text={sugg.bullets.join("\n")}
                              onApply={() =>
                                setState((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((x) =>
                                    x.id === job.id
                                      ? { ...x, bullets: sugg.bullets! }
                                      : x,
                                  ),
                                }))
                              }
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="projects">
                <AccordionTrigger className="text-sm font-semibold">
                  Independent Projects
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          projects: [
                            ...prev.projects,
                            {
                              id: `temp_${Date.now()}`,
                              title: "Project Name",
                              description: "",
                              bullets: [""],
                              techStack: [],
                              liveUrl: "",
                              githubUrl: "",
                              order: prev.projects.length,
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Project
                    </Button>
                  </div>
                  {state.projects.map((project) => {
                    const sugg = suggestions?.projects?.find(
                      (s) => s.id === project.id,
                    );
                    return (
                      <div
                        key={project.id}
                        className="relative space-y-3 rounded-xl border bg-muted/20 p-4"
                      >
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              projects: prev.projects.filter(
                                (x) => x.id !== project.id,
                              ),
                            }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </button>
                        <Input
                          value={project.title}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              projects: prev.projects.map((x) =>
                                x.id === project.id
                                  ? { ...x, title: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                          placeholder="Project title"
                        />
                        <Input
                          value={project.techStack.join(", ")}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              projects: prev.projects.map((x) =>
                                x.id === project.id
                                  ? {
                                      ...x,
                                      techStack: e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    }
                                  : x,
                              ),
                            }))
                          }
                          placeholder="Tech stack (comma-separated)"
                        />
                        <FieldLabel
                          label="Bullets (one per line)"
                          onAi={() =>
                            setAiField({
                              name: "Project Bullets",
                              currentValue: project.bullets,
                              apply: (val) =>
                                setState((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((x) =>
                                    x.id === project.id
                                      ? {
                                          ...x,
                                          bullets: Array.isArray(val)
                                            ? val
                                            : linesToArray(String(val)),
                                        }
                                      : x,
                                  ),
                                })),
                            })
                          }
                        />
                        <Textarea
                          rows={4}
                          value={arrayToLines(project.bullets)}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              projects: prev.projects.map((x) =>
                                x.id === project.id
                                  ? {
                                      ...x,
                                      bullets: linesToArray(e.target.value),
                                    }
                                  : x,
                              ),
                            }))
                          }
                        />
                        {sugg?.bullets ? (
                          <SuggestionChip
                            text={sugg.bullets.join("\n")}
                            onApply={() =>
                              setState((prev) => ({
                                ...prev,
                                projects: prev.projects.map((x) =>
                                  x.id === project.id
                                    ? { ...x, bullets: sugg.bullets! }
                                    : x,
                                ),
                              }))
                            }
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="education">
                <AccordionTrigger className="text-sm font-semibold">
                  Education
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          education: [
                            ...prev.education,
                            {
                              id: `temp_${Date.now()}`,
                              degree: "Degree",
                              institution: "Institution",
                              year: String(new Date().getFullYear()),
                              highlights: [],
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Education
                    </Button>
                  </div>
                  {state.education.map((item) => (
                    <div
                      key={item.id}
                      className="relative space-y-3 rounded-xl border bg-muted/20 p-4"
                    >
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            education: prev.education.filter(
                              (x) => x.id !== item.id,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="grid gap-3 pr-8 sm:grid-cols-2">
                        <Input
                          value={item.degree}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              education: prev.education.map((x) =>
                                x.id === item.id
                                  ? { ...x, degree: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                          placeholder="Degree"
                        />
                        <Input
                          value={item.year}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              education: prev.education.map((x) =>
                                x.id === item.id
                                  ? { ...x, year: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                          placeholder="Year / Graduation"
                        />
                      </div>
                      <Input
                        value={item.institution}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            education: prev.education.map((x) =>
                              x.id === item.id
                                ? { ...x, institution: e.target.value }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Institution"
                      />
                      <Textarea
                        rows={3}
                        value={arrayToLines(item.highlights)}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            education: prev.education.map((x) =>
                              x.id === item.id
                                ? {
                                    ...x,
                                    highlights: linesToArray(e.target.value),
                                  }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Highlights (one per line)"
                      />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="certifications">
                <AccordionTrigger className="text-sm font-semibold">
                  Certifications
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          certifications: [
                            ...prev.certifications,
                            {
                              id: `temp_${Date.now()}`,
                              title: "Certification",
                              provider: "Provider",
                              date: new Date().toISOString().slice(0, 10),
                              credentialUrl: "",
                              order: prev.certifications.length,
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Certification
                    </Button>
                  </div>
                  {state.certifications.map((item) => (
                    <div
                      key={item.id}
                      className="relative grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2"
                    >
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            certifications: prev.certifications.filter(
                              (x) => x.id !== item.id,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            certifications: prev.certifications.map((x) =>
                              x.id === item.id
                                ? { ...x, title: e.target.value }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Title"
                      />
                      <Input
                        value={item.provider}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            certifications: prev.certifications.map((x) =>
                              x.id === item.id
                                ? { ...x, provider: e.target.value }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Provider"
                      />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="achievements">
                <AccordionTrigger className="text-sm font-semibold">
                  Achievements & Awards
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          achievements: [
                            ...prev.achievements,
                            {
                              id: `temp_${Date.now()}`,
                              title: "Achievement",
                              description: "",
                              date: new Date().toISOString().slice(0, 10),
                              order: prev.achievements.length,
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add Achievement
                    </Button>
                  </div>
                  {state.achievements.map((item) => (
                    <div
                      key={item.id}
                      className="relative space-y-3 rounded-xl border bg-muted/20 p-4"
                    >
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            achievements: prev.achievements.filter(
                              (x) => x.id !== item.id,
                            ),
                          }))
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            achievements: prev.achievements.map((x) =>
                              x.id === item.id
                                ? { ...x, title: e.target.value }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Title"
                      />
                      <Textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            achievements: prev.achievements.map((x) =>
                              x.id === item.id
                                ? { ...x, description: e.target.value }
                                : x,
                            ),
                          }))
                        }
                        placeholder="Description"
                      />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="opensource">
                <AccordionTrigger className="text-sm font-semibold">
                  Open Source Contributions
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <FieldLabel
                    label="Contributions (one per line)"
                    onAi={() =>
                      setAiField({
                        name: "Open Source Contributions",
                        currentValue: state.aboutMe.openSourceContributions,
                        apply: (val) =>
                          updateAbout({
                            openSourceContributions: Array.isArray(val)
                              ? val
                              : linesToArray(String(val)),
                          }),
                      })
                    }
                  />
                  <Textarea
                    rows={5}
                    value={arrayToLines(state.aboutMe.openSourceContributions)}
                    onChange={(e) =>
                      updateAbout({
                        openSourceContributions: linesToArray(e.target.value),
                      })
                    }
                    placeholder="Describe open source contributions..."
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-teal-950 to-zinc-900 p-5 text-zinc-100 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500 text-teal-950">
                <Brain className="size-4" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-400">
                AI Resume Assistant
              </h2>
              {suggestions ? (
                <Badge className="ml-auto border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  Ready
                </Badge>
              ) : null}
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {AI_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAiPrompt(preset.prompt)}
                  className="rounded-lg border border-zinc-700/60 bg-zinc-800/80 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:border-zinc-600"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <Textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="mb-3 border-zinc-700 bg-zinc-900 text-xs text-zinc-100"
            />
            <Button
              type="button"
              onClick={() => void generateSuggestions()}
              disabled={generating || !aiPrompt.trim()}
              className="w-full bg-teal-500 font-semibold text-teal-950 hover:bg-teal-400"
            >
              <Sparkles className="mr-1.5 size-4" />
              {generating ? "Generating..." : "Enhance Resume with AI"}
            </Button>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="sticky top-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Live PDF Preview</p>
                <p className="text-xs text-muted-foreground">
                  Download saves as{" "}
                  <code className="rounded bg-muted px-1 py-0.5">
                    {downloadFilename}
                  </code>
                </p>
              </div>
            </div>
            <ResumePreview data={previewData} />
          </div>
        </div>
      </div>

      {aiField ? (
        <ResumeFieldAiDialog
          open
          fieldName={aiField.name}
          currentValue={aiField.currentValue}
          onClose={() => setAiField(null)}
          onApply={aiField.apply}
        />
      ) : null}
    </div>
  );
}

function SuggestionChip({
  text,
  onApply,
}: {
  text: string;
  onApply: () => void;
}) {
  return (
    <div className="mt-2 rounded-lg border border-teal-200 bg-teal-50/30 p-3 text-xs">
      <div className="mb-1 flex items-center justify-between font-semibold text-teal-800">
        <span>AI Suggestion</span>
        <button
          type="button"
          onClick={onApply}
          className="rounded bg-teal-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-teal-700"
        >
          Apply
        </button>
      </div>
      <p className="whitespace-pre-wrap text-zinc-700">{text}</p>
    </div>
  );
}

export default ResumeEditor;
