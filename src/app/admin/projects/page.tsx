"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

const resultMetricSchema = z.object({
  label: z.string().trim().min(1, "Metric label is required"),
  value: z.string().trim().min(1, "Metric value is required"),
});

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().optional().default(""),
  description: z.string().trim().min(1, "Description is required"),
  imageUrl: z.string().optional().default(""),
  images: z.array(z.string()).default([]),
  category: z.string().trim().optional().default(""),
  status: z.enum(["completed", "ongoing", "concept"]).default("completed"),
  projectType: z.enum(["personal", "professional"]).default("personal"),
  company: z.string().trim().optional().default(""),
  teamSize: z.string().trim().optional().default(""),
  featured: z.union([z.boolean(), z.string()]).default(false),
  role: z.string().trim().optional().default(""),
  duration: z.string().trim().optional().default(""),
  problem: z.string().trim().optional().default(""),
  solution: z.string().trim().optional().default(""),
  features: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  results: z.array(resultMetricSchema).default([]),
  videoUrl: z.string().optional().default(""),
  techStack: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  liveUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Link label is required"),
        url: z.string().trim().min(1, "Link URL is required"),
      }),
    )
    .default([]),
  directoryStructure: z.string().optional().default(""),
  readmeMd: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
});

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  images: string[];
  category: string;
  status: "completed" | "ongoing" | "concept";
  projectType: "personal" | "professional";
  company: string;
  teamSize: string;
  featured: boolean;
  role: string;
  duration: string;
  problem: string;
  solution: string;
  features: string[];
  responsibilities: string[];
  results: { label: string; value: string }[];
  videoUrl: string;
  techStack: string[];
  bullets: string[];
  liveUrl: string;
  githubUrl: string;
  links: { label: string; url: string }[];
  directoryStructure: string;
  readmeMd: string;
  order: number;
};

export default function AdminProjectsPage() {
  return (
    <AdminResourcePage<ProjectRow, typeof schema>
      title="Projects"
      resource="projects"
      enableReorder
      schema={schema}
      emptyValues={{
        title: "",
        slug: "",
        description: "",
        imageUrl: "",
        images: [],
        category: "",
        status: "completed",
        projectType: "personal",
        company: "",
        teamSize: "",
        featured: "false",
        role: "",
        duration: "",
        problem: "",
        solution: "",
        features: [],
        responsibilities: [],
        results: [],
        videoUrl: "",
        techStack: [],
        bullets: [],
        liveUrl: "",
        githubUrl: "",
        links: [],
        directoryStructure: "",
        readmeMd: "",
        order: 0,
      }}
      columns={[
        { key: "title", header: "Title" },
        {
          key: "projectType",
          header: "Type",
          render: (row) =>
            row.projectType === "professional"
              ? "🏢 Professional"
              : "👤 Personal",
        },
        {
          key: "featured",
          header: "Featured",
          render: (row) => (row.featured ? "★ Yes" : "No"),
        },
        { key: "order", header: "Order" },
      ]}
      fields={[
        // Basics tab
        { name: "title", label: "Title", type: "text", tab: "Basics" },
        {
          name: "slug",
          label: "Slug (URL path slug)",
          type: "text",
          tab: "Basics",
          placeholder: "e.g. post-forge-ai (auto-generated if empty)",
        },
        {
          name: "projectType",
          label: "Project Type",
          type: "select",
          tab: "Basics",
          options: [
            { value: "personal", label: "Personal Project" },
            { value: "professional", label: "Professional / Company Project" },
          ],
        },
        {
          name: "company",
          label: "Company Name (For Professional projects)",
          type: "text",
          tab: "Basics",
          placeholder: "e.g. Google, Acme Corp (Leave blank for personal)",
        },
        {
          name: "teamSize",
          label: "Team Size / Collaboration (For Professional projects)",
          type: "text",
          tab: "Basics",
          placeholder: "e.g. 5 developers, Solo, Cross-functional of 12",
        },
        {
          name: "category",
          label: "Category",
          type: "text",
          tab: "Basics",
          placeholder: "e.g. SaaS Platform, AI/ML Tool",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          tab: "Basics",
          options: [
            { value: "completed", label: "Completed" },
            { value: "ongoing", label: "In Progress" },
            { value: "concept", label: "Concept" },
          ],
        },
        {
          name: "featured",
          label: "Featured Project",
          type: "select",
          tab: "Basics",
          options: [
            { value: "false", label: "No (Regular)" },
            { value: "true", label: "Yes (Featured)" },
          ],
          description: "Featured projects stand out visually on the grid",
        },
        {
          name: "duration",
          label: "Duration",
          type: "text",
          tab: "Basics",
          placeholder: "e.g. 3 months",
        },
        {
          name: "role",
          label: "My Role",
          type: "text",
          tab: "Basics",
          placeholder: "e.g. Full-stack Developer & Architect",
        },
        {
          name: "description",
          label: "Short Description (Grid Card Summary)",
          type: "textarea",
          tab: "Basics",
        },

        // Media tab
        {
          name: "imageUrl",
          label: "Cover Image URL (Main card thumbnail)",
          type: "image",
          uploadSection: "projects",
          tab: "Media",
        },
        {
          name: "images",
          label: "Gallery Images",
          type: "multi-image",
          uploadSection: "projects",
          tab: "Media",
        },
        {
          name: "videoUrl",
          label: "Video Demo Embed URL (Loom or YouTube)",
          type: "url",
          tab: "Media",
          placeholder: "e.g. https://www.youtube.com/embed/dQw4w9WgXcQ",
        },

        // Story tab
        {
          name: "problem",
          label: "The Problem / Challenge",
          type: "textarea",
          tab: "Story",
          placeholder: "What pain point does this solve?",
        },
        {
          name: "solution",
          label: "The Solution / Execution",
          type: "textarea",
          tab: "Story",
          placeholder: "How did you build the solution?",
        },
        {
          name: "features",
          label: "Key Features Checklist",
          type: "string-list",
          tab: "Story",
        },
        {
          name: "responsibilities",
          label: "My Responsibilities (For Professional projects)",
          type: "string-list",
          tab: "Story",
          placeholder: "e.g. Designed database schema, Guided 2 juniors",
        },
        {
          name: "results",
          label: "Results & Impact Metrics",
          type: "results-list",
          tab: "Story",
        },

        // Links & Tech tab
        {
          name: "techStack",
          label: "Tech Stack",
          type: "tech-select",
          tab: "Links & Tech",
        },
        {
          name: "bullets",
          label: "Achievements (Resume Bullets)",
          type: "string-list",
          tab: "Links & Tech",
        },
        {
          name: "liveUrl",
          label: "Live Demo URL",
          type: "url",
          tab: "Links & Tech",
        },
        {
          name: "githubUrl",
          label: "GitHub URL",
          type: "url",
          tab: "Links & Tech",
        },
        {
          name: "links",
          label: "Additional links",
          type: "links-list",
          tab: "Links & Tech",
          description:
            "Each link needs a label (what it is for) and the URL. Example: Documentation → https://docs.example.com",
        },
        {
          name: "order",
          label: "Order / Position",
          type: "number",
          tab: "Links & Tech",
        },

        {
          name: "directoryStructure",
          label: "Directory structure",
          type: "textarea",
          tab: "README",
          placeholder:
            "src/\n  app/\n  components/\n  lib/\npackage.json",
          description:
            "Paste a folder tree. AI will include it in the README.",
        },
        {
          name: "readmeMd",
          label: "Project README.md",
          type: "markdown",
          tab: "README",
          aiGenerate: true,
          placeholder:
            "Fill the other tabs, then generate a professional README with AI. You can edit it before saving.",
          description:
            "This markdown is what visitors read on the public project page.",
        },
      ]}
      toFormValues={(row) => ({
        ...row,
        featured: row.featured ? "true" : "false",
        images: Array.isArray(row.images) ? row.images : [],
        features: Array.isArray(row.features) ? row.features : [],
        responsibilities: Array.isArray(row.responsibilities)
          ? row.responsibilities
          : [],
        results: Array.isArray(row.results) ? row.results : [],
        links: Array.isArray(row.links) ? row.links : [],
        directoryStructure: row.directoryStructure ?? "",
        readmeMd: row.readmeMd ?? "",
      })}
      toPayload={(values) => {
        const isFeatured =
          values.featured === "true" || values.featured === true;
        const rawSlug = values.slug ? values.slug : values.title;
        const generatedSlug = slugify(rawSlug);

        const imagesList = Array.isArray(values.images) ? values.images : [];
        const finalImages =
          imagesList.length === 0 && values.imageUrl
            ? [values.imageUrl]
            : imagesList;

        return {
          ...values,
          slug: generatedSlug,
          featured: isFeatured,
          images: finalImages,
          bullets: values.bullets
            .map((item: string) => item.trim())
            .filter(Boolean),
          features: values.features
            .map((item: string) => item.trim())
            .filter(Boolean),
          responsibilities: values.responsibilities
            .map((item: string) => item.trim())
            .filter(Boolean),
          techStack: values.techStack
            .map((item: string) => item.trim())
            .filter(Boolean),
          links: (values.links ?? [])
            .filter(
              (item: { label?: string; url?: string }) =>
                item.label?.trim() && item.url?.trim(),
            )
            .map((item: { label: string; url: string }) => ({
              label: item.label.trim(),
              url: item.url.trim(),
            })),
          directoryStructure: values.directoryStructure?.trim() ?? "",
          readmeMd: values.readmeMd ?? "",
        };
      }}
    />
  );
}
