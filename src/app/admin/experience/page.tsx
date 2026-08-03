"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  role: z.string().trim().min(1),
  company: z.string().trim().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  bullets: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  order: z.coerce.number().int().default(0),
});

type ExperienceRow = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  techStack: string[];
  order: number;
};

export default function AdminExperiencePage() {
  return (
    <AdminResourcePage<ExperienceRow, typeof schema>
      title="Experience"
      resource="experience"
      schema={schema}
      emptyValues={{
        role: "",
        company: "",
        startDate: "",
        endDate: "",
        bullets: [],
        techStack: [],
        order: 0,
      }}
      columns={[
        { key: "role", header: "Role" },
        { key: "company", header: "Company" },
        { key: "order", header: "Order" },
        {
          key: "tech",
          header: "Tech",
          render: (row) => row.techStack?.slice(0, 3).join(", ") || "—",
        },
      ]}
      fields={[
        { name: "role", label: "Role", type: "text" },
        { name: "company", label: "Company", type: "text" },
        { name: "startDate", label: "Start date", type: "date" },
        { name: "endDate", label: "End date", type: "date" },
        {
          name: "bullets",
          label: "Achievements",
          type: "string-list",
          description: "One bullet per line",
        },
        {
          name: "techStack",
          label: "Tech stack",
          type: "string-list",
          description: "One technology per line",
        },
        { name: "order", label: "Order", type: "number" },
      ]}
      toFormValues={(row) => ({
        ...row,
        startDate: row.startDate?.slice(0, 10) ?? "",
        endDate: row.endDate ? row.endDate.slice(0, 10) : "",
      })}
      toPayload={(values) => ({
        ...values,
        endDate: values.endDate ? values.endDate : null,
        bullets: values.bullets.map((item) => item.trim()).filter(Boolean),
        techStack: values.techStack.map((item) => item.trim()).filter(Boolean),
      })}
    />
  );
}
