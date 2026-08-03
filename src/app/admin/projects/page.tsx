"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  techStack: z.array(z.string()).default([]),
  bullets: z.array(z.string()).default([]),
  liveUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
});

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  bullets: string[];
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
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
        description: "",
        techStack: [],
        bullets: [],
        liveUrl: "",
        githubUrl: "",
        imageUrl: "",
        order: 0,
      }}
      columns={[
        { key: "title", header: "Title" },
        {
          key: "tech",
          header: "Tech",
          render: (row) => row.techStack?.slice(0, 3).join(", ") || "—",
        },
        { key: "order", header: "Order" },
      ]}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "imageUrl",
          label: "Project image",
          type: "image",
          uploadSection: "projects",
        },
        {
          name: "techStack",
          label: "Tech stack",
          type: "string-list",
        },
        {
          name: "bullets",
          label: "Highlights",
          type: "string-list",
        },
        { name: "liveUrl", label: "Live URL", type: "url" },
        { name: "githubUrl", label: "GitHub URL", type: "url" },
        { name: "order", label: "Order", type: "number" },
      ]}
      toPayload={(values) => ({
        ...values,
        techStack: values.techStack.map((item) => item.trim()).filter(Boolean),
        bullets: values.bullets.map((item) => item.trim()).filter(Boolean),
      })}
    />
  );
}
