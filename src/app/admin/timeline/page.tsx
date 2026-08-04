"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { Badge } from "@/components/ui/badge";
import {
  TIMELINE_CATEGORIES,
  TIMELINE_CATEGORY_LABELS,
  TIMELINE_CATEGORY_OPTIONS,
  type TimelineCategory,
} from "@/lib/timeline-types";
import { cn } from "@/lib/utils";

const schema = z.object({
  category: z.enum(TIMELINE_CATEGORIES).default("experience"),
  role: z.string().trim().min(1, "Title is required"),
  company: z.string().trim().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  description: z.string().trim().min(1),
  link: z.string().trim().default(""),
  order: z.coerce.number().int().default(0),
});

type TimelineRow = {
  id: string;
  category?: TimelineCategory | string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
  link?: string;
  order: number;
};

function formatDate(iso: string | null) {
  if (!iso) return "Present";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const CATEGORY_BADGE_CLASS: Record<TimelineCategory, string> = {
  experience: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  education: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  achievement: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  certificate: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  other: "bg-muted text-muted-foreground",
};

export default function AdminTimelinePage() {
  return (
    <AdminResourcePage<TimelineRow, typeof schema>
      title="Timeline"
      description="Milestones on the public journey timeline — experience, education, achievements, certificates, and more."
      resource="timeline"
      enableReorder
      schema={schema}
      emptyValues={{
        category: "experience",
        role: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        link: "",
        order: 0,
      }}
      columns={[
        {
          key: "category",
          header: "Type",
          render: (row) => {
            const category = (row.category ??
              "experience") as TimelineCategory;
            return (
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent",
                  CATEGORY_BADGE_CLASS[category] ?? CATEGORY_BADGE_CLASS.other,
                )}
              >
                {TIMELINE_CATEGORY_LABELS[category] ?? category}
              </Badge>
            );
          },
        },
        { key: "role", header: "Title" },
        {
          key: "company",
          header: "Organization",
          render: (row) => row.company || "—",
        },
        {
          key: "dates",
          header: "Dates",
          render: (row) =>
            `${formatDate(row.startDate)} — ${formatDate(row.endDate)}`,
        },
        { key: "order", header: "Order" },
      ]}
      fields={[
        {
          name: "category",
          label: "Type",
          type: "select",
          options: TIMELINE_CATEGORY_OPTIONS,
          description:
            "Controls the badge and icon on the public timeline.",
        },
        {
          name: "role",
          label: "Title",
          type: "text",
          placeholder: "Role, degree, award, or certificate name",
        },
        {
          name: "company",
          label: "Organization",
          type: "text",
          placeholder: "Company, school, or issuer (optional)",
        },
        { name: "startDate", label: "Start date", type: "date" },
        {
          name: "endDate",
          label: "End date",
          type: "date",
          description: "Leave empty for ongoing / present.",
        },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "link",
          label: "Link",
          type: "url",
          placeholder: "https://… (optional credential or detail URL)",
        },
        { name: "order", label: "Order", type: "number" },
      ]}
      toFormValues={(row) => ({
        category: (row.category as TimelineCategory) || "experience",
        role: row.role,
        company: row.company ?? "",
        startDate: row.startDate?.slice(0, 10) ?? "",
        endDate: row.endDate ? row.endDate.slice(0, 10) : "",
        description: row.description,
        link: row.link ?? "",
        order: row.order,
      })}
      toPayload={(values) => ({
        ...values,
        company: values.company ?? "",
        link: values.link ?? "",
        endDate: values.endDate ? values.endDate : null,
      })}
    />
  );
}
