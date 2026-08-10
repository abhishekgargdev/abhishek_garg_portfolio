"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { CloudinaryUploader } from "@/components/admin/CloudinaryUploader";
import type { AboutAiSuggestions } from "@/app/api/ai/about-suggest/route";
import { Hero } from "@/components/sections/Hero";
import { normalizeTaglines } from "@/lib/about-taglines";
import type { AboutMeData } from "@/lib/about";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLoader } from "@/components/loader/SectionLoader";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  emptySocialLinkRecord,
  PORTFOLIO_SOCIAL_PLATFORMS,
  recordToSocialLinks,
  socialLinksToRecord,
} from "@/lib/social-links";
import { cn } from "@/lib/utils";

const aboutSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
  taglines: z
    .array(z.object({ value: z.string() }))
    .min(1, "Add at least one tagline")
    .refine((items) => items.some((item) => item.value.trim()), {
      message: "Add at least one non-empty tagline",
    }),
  bio: z.string().trim().min(1, "Bio is required"),
  profileImageUrl: z.string().default(""),
  resumeFileUrl: z.string().default(""),
  portfolioUrl: z.string().default(""),
  openSourceContributions: z.string().default(""),
  location: z.string().default(""),
  phone: z.string().default(""),
  email: z.email("Enter a valid email"),
  socialLinks: z.record(z.string(), z.string()).default(emptySocialLinkRecord()),
  beyondCodeBio: z.string().optional().default(""),
  beyondCodeImageUrl: z.string().optional().default(""),
  beyondCodeTraits: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Title is required"),
        description: z.string().trim().min(1, "Description is required"),
        icon: z.string().trim().min(1, "Icon name is required"),
      }),
    )
    .default([]),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

type AboutRow = {
  id: string;
  name: string;
  title: string;
  tagline?: string;
  taglines?: string[];
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  portfolioUrl?: string;
  openSourceContributions?: string[];
  location: string;
  phone: string;
  email: string;
  socialLinks: { platform: string; url: string }[];
  beyondCodeBio?: string;
  beyondCodeImageUrl?: string;
  beyondCodeTraits?: { title: string; description: string; icon: string }[];
};

const FIELD_LABELS: Record<
  AboutAiSuggestions["fields"][number]["field"],
  string
> = {
  name: "Name",
  title: "Title",
  taglines: "Taglines",
  bio: "Bio",
  location: "Location",
  phone: "Phone",
  email: "Email",
};

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(value: string[] | undefined): string {
  return (value ?? []).join("\n");
}

function toTaglineFields(taglines: string[]) {
  const cleaned = taglines.map((line) => line.trim()).filter(Boolean);
  return (cleaned.length ? cleaned : [""]).map((value) => ({ value }));
}

function HeroPreview({ values }: { values: AboutFormValues }) {
  const about = useMemo<AboutMeData>(
    () => ({
      name: values.name,
      title: values.title,
      taglines: values.taglines
        .map((item) => item.value.trim())
        .filter(Boolean),
      bio: values.bio,
      profileImageUrl: values.profileImageUrl,
      resumeFileUrl: values.resumeFileUrl,
      portfolioUrl: values.portfolioUrl,
      openSourceContributions: linesToArray(values.openSourceContributions),
      location: values.location,
      phone: values.phone,
      email: values.email,
      socialLinks: recordToSocialLinks(values.socialLinks),
      beyondCodeBio: values.beyondCodeBio || "",
      beyondCodeImageUrl: values.beyondCodeImageUrl || "",
      beyondCodeTraits: values.beyondCodeTraits || [],
    }),
    [values],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <Hero about={about} preview />
    </div>
  );
}

export function AboutMeEditor() {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AboutAiSuggestions | null>(
    null,
  );

  const form = useForm<AboutFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(aboutSchema as any),
    defaultValues: {
      name: "",
      title: "",
      taglines: [{ value: "" }],
      bio: "",
      profileImageUrl: "",
      resumeFileUrl: "",
      portfolioUrl: "",
      openSourceContributions: "",
      location: "",
      phone: "",
      email: "",
      socialLinks: emptySocialLinkRecord(),
      beyondCodeBio: "",
      beyondCodeImageUrl: "",
      beyondCodeTraits: [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "taglines",
  });

  const {
    fields: traitFields,
    append: appendTrait,
    remove: removeTrait,
  } = useFieldArray({
    control,
    name: "beyondCodeTraits",
  });

  const values = watch();

  const loadAbout = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/about");
      const data = (await response.json()) as {
        items?: AboutRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load about profile");
      }

      const row = data.items?.[0];
      if (row) {
        setRecordId(row.id);
        reset({
          name: row.name,
          title: row.title,
          taglines: toTaglineFields(
            normalizeTaglines(row.tagline, row.taglines),
          ),
          bio: row.bio,
          profileImageUrl: row.profileImageUrl ?? "",
          resumeFileUrl: row.resumeFileUrl ?? "",
          portfolioUrl: row.portfolioUrl ?? "",
          openSourceContributions: arrayToLines(row.openSourceContributions),
          location: row.location ?? "",
          phone: row.phone ?? "",
          email: row.email,
          socialLinks: socialLinksToRecord(row.socialLinks ?? []),
          beyondCodeBio: row.beyondCodeBio ?? "",
          beyondCodeImageUrl: row.beyondCodeImageUrl ?? "",
          beyondCodeTraits: row.beyondCodeTraits ?? [],
        });
      } else {
        setRecordId(null);
        reset({
          name: "",
          title: "",
          taglines: [{ value: "" }],
          bio: "",
          profileImageUrl: "",
          resumeFileUrl: "",
          location: "",
          phone: "",
          email: "",
          socialLinks: emptySocialLinkRecord(),
          beyondCodeBio: "",
          beyondCodeImageUrl: "",
          beyondCodeTraits: [],
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load about profile",
      );
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void loadAbout();
  }, [loadAbout]);

  const buildPayload = useCallback((formValues: AboutFormValues) => {
    const { socialLinks, taglines, ...rest } = formValues;
    const cleanedTaglines = taglines
      .map((item) => item.value.trim())
      .filter(Boolean);

    return {
      ...rest,
      taglines: cleanedTaglines,
      openSourceContributions: linesToArray(rest.openSourceContributions),
      // Keep legacy field synced so Mongoose validators never see an empty
      // required `tagline` from an older compiled schema.
      tagline: cleanedTaglines[0] ?? "",
      socialLinks: recordToSocialLinks(socialLinks),
    };
  }, []);

  const onSubmit = async (formValues: AboutFormValues) => {
    setSaving(true);
    try {
      const payload = buildPayload(formValues);
      const response = await fetch(
        recordId ? `/api/admin/about/${recordId}` : "/api/admin/about",
        {
          method: recordId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        item?: AboutRow;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save about profile");
      }

      if (data.item?.id) {
        setRecordId(data.item.id);
      }

      toast.success("About profile saved");
      await loadAbout();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save about profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const requestAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/about-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: buildPayload(values) }),
      });
      const data = (await response.json()) as {
        suggestions?: AboutAiSuggestions;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI suggestions");
      }
      setSuggestions(data.suggestions ?? null);
      toast.success("AI suggestions ready");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to get AI suggestions",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const applyFieldSuggestion = (
    field: AboutAiSuggestions["fields"][number]["field"],
    value: string,
  ) => {
    if (field === "taglines") {
      const lines = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      setValue("taglines", toTaglineFields(lines.length ? lines : [value]), {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("Applied taglines");
      return;
    }

    setValue(field, value, { shouldDirty: true, shouldValidate: true });
    toast.success(`Applied ${FIELD_LABELS[field]}`);
  };

  const applySocialSuggestion = (platform: string, url?: string) => {
    if (!url?.trim()) return;
    const match = PORTFOLIO_SOCIAL_PLATFORMS.find(
      (item) => item.label.toLowerCase() === platform.toLowerCase(),
    );
    if (!match) return;
    setValue(`socialLinks.${match.key}`, url.trim(), {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success(`Applied ${platform} URL`);
  };

  const suggestionFields = useMemo(() => {
    if (!suggestions) return [];
    return suggestions.fields;
  }, [suggestions]);

  if (loading) {
    return <SectionLoader variant="text" count={4} className="max-w-3xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">About</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit your hero profile directly, preview changes, and use AI to map
            portfolio data into the right sections.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={saving || (!isDirty && Boolean(recordId))}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Saving…
            </>
          ) : (
            <>
              <Save data-icon="inline-start" />
              Save changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="edit" className="gap-4">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye data-icon="inline-start" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles data-icon="inline-start" />
            AI suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
            noValidate
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile content</CardTitle>
                  <CardDescription>
                    These fields power the public hero section.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name ? (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Senior Full Stack Engineer | Next.js | Node.js"
                        {...register("title")}
                      />
                      {errors.title ? (
                        <p className="text-sm text-destructive">
                          {errors.title.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>Taglines (typewriter rotation)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ value: "" })}
                        >
                          <Plus data-icon="inline-start" />
                          Add tagline
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add multiple short lines. They rotate with a typewriter
                        effect on the homepage hero.
                      </p>
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-2">
                            <Input
                              placeholder={`Tagline ${index + 1}`}
                              {...register(`taglines.${index}.value`)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove tagline ${index + 1}`}
                              disabled={fields.length <= 1}
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {errors.taglines ? (
                        <p className="text-sm text-destructive">
                          {errors.taglines.message ??
                            errors.taglines.root?.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={6}
                        placeholder="Professional summary shown on resume and extended profile areas"
                        {...register("bio")}
                      />
                      {errors.bio ? (
                        <p className="text-sm text-destructive">
                          {errors.bio.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email ? (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" {...register("location")} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      placeholder="https://abhishekgarg.dev"
                      {...register("portfolioUrl")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown on your generated resume PDF contact line. Kept in
                      sync with the Resume Builder.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resume extras</CardTitle>
                  <CardDescription>
                    Open source bullets appear on your resume PDF. Edit the full
                    resume layout under Admin → Resume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="openSourceContributions">
                      Open source contributions
                    </Label>
                    <Textarea
                      id="openSourceContributions"
                      rows={4}
                      placeholder="One contribution per line"
                      {...register("openSourceContributions")}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social links</CardTitle>
                  <CardDescription>
                    Add only the platforms you use. Empty fields are ignored on
                    save.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {PORTFOLIO_SOCIAL_PLATFORMS.map((platform) => (
                    <div key={platform.key} className="space-y-2">
                      <Label htmlFor={`social-${platform.key}`}>
                        {platform.label}
                      </Label>
                      <Input
                        id={`social-${platform.key}`}
                        type="url"
                        placeholder={platform.placeholder}
                        {...register(`socialLinks.${platform.key}`)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CloudinaryUploader
                    section="about"
                    label="Profile image"
                    value={values.profileImageUrl}
                    onUploadComplete={(url) =>
                      setValue("profileImageUrl", url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={saving}
                  />
                  <CloudinaryUploader
                    section="resume"
                    label="Resume file"
                    value={values.resumeFileUrl}
                    onUploadComplete={(url) =>
                      setValue("resumeFileUrl", url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={saving}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Beyond the Code</CardTitle>
                  <CardDescription>
                    Configure the &quot;Beyond the Code&quot; section layout and traits.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="beyondCodeBio">Beyond the Code Summary</Label>
                    <Textarea
                      id="beyondCodeBio"
                      rows={4}
                      placeholder="e.g. When I'm not coding, you can find me writing articles, playing mathematics riddles, or hiking..."
                      {...register("beyondCodeBio")}
                    />
                  </div>

                  <CloudinaryUploader
                    section="about"
                    label="Beyond the Code Section Image"
                    value={values.beyondCodeImageUrl || ""}
                    onUploadComplete={(url) =>
                      setValue("beyondCodeImageUrl", url, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={saving}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Interests & Traits</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendTrait({ title: "", description: "", icon: "sparkles" })}
                      >
                        <Plus className="mr-1 size-3.5" />
                        Add Trait
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {traitFields.map((field, index) => (
                        <div key={field.id} className="relative rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-2 top-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeTrait(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                placeholder="e.g. Problem Solving"
                                {...register(`beyondCodeTraits.${index}.title`)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Icon Key (Lucide icon name)</Label>
                              <Input
                                placeholder="e.g. Brain, Code, Cpu, Trophy"
                                {...register(`beyondCodeTraits.${index}.icon`)}
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-xs">Short Description</Label>
                              <Textarea
                                rows={2}
                                placeholder="A brief description of this trait..."
                                {...register(`beyondCodeTraits.${index}.description`)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="hidden xl:block">
              <div className="sticky top-20">
                <HeroPreview values={values} />
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <HeroPreview values={values} />
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="size-4" />
                  AI content advisor
                </CardTitle>
                <CardDescription>
                  Shares your current About draft plus experience, projects,
                  skills, education, achievements, and certifications with
                  Gemini, then suggests what belongs in each section.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  onClick={requestAiSuggestions}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="animate-spin" data-icon="inline-start" />
                      Analyzing portfolio…
                    </>
                  ) : (
                    <>
                      <Sparkles data-icon="inline-start" />
                      Generate suggestions
                    </>
                  )}
                </Button>

                {suggestions ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
                    {suggestions.overview}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Run the advisor to get field-level copy suggestions and
                    social link recommendations based on your full portfolio
                    data.
                  </p>
                )}

                {suggestions?.gaps.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Missing from About
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {suggestions.gaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {suggestionFields.map((item) => (
                <Card key={item.field}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {FIELD_LABELS[item.field]}
                    </CardTitle>
                    <CardDescription>{item.reason}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                      {item.suggestedValue}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        applyFieldSuggestion(item.field, item.suggestedValue)
                      }
                    >
                      Apply to {FIELD_LABELS[item.field]}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {suggestions?.socialLinks.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Social links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestions.socialLinks.map((item) => (
                      <div
                        key={item.platform}
                        className={cn(
                          "rounded-lg border p-3",
                          item.recommended
                            ? "border-teal-500/30 bg-teal-500/5"
                            : "border-border bg-muted/20",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground">
                            {item.platform}
                          </p>
                          <Badge
                            variant={item.recommended ? "default" : "secondary"}
                          >
                            {item.recommended ? "Recommended" : "Optional"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.reason}
                        </p>
                        {item.suggestedUrl ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <code className="rounded bg-muted px-2 py-1 text-xs">
                              {item.suggestedUrl}
                            </code>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                applySocialSuggestion(
                                  item.platform,
                                  item.suggestedUrl,
                                )
                              }
                            >
                              Apply URL
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" data-icon="inline-start" />
              Saving…
            </>
          ) : (
            <>
              <Save data-icon="inline-start" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default AboutMeEditor;
