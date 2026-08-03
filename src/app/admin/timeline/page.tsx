"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  role: z.string().trim().min(1),
  company: z.string().trim().min(1),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  description: z.string().trim().min(1),
  order: z.coerce.number().int().default(0),
});

type TimelineRow = {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
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

export default function AdminTimelinePage() {
  return (
    <AdminResourcePage<TimelineRow, typeof schema>
      title="Timeline"
      description="Career journey milestones shown on the public timeline."
      resource="timeline"
      schema={schema}
      emptyValues={{
        role: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        order: 0,
      }}
      columns={[
        { key: "role", header: "Role" },
        { key: "company", header: "Company" },
        {
          key: "dates",
          header: "Dates",
          render: (row) =>
            `${formatDate(row.startDate)} — ${formatDate(row.endDate)}`,
        },
        { key: "order", header: "Order" },
      ]}
      fields={[
        { name: "role", label: "Role", type: "text" },
        { name: "company", label: "Company", type: "text" },
        { name: "startDate", label: "Start date", type: "date" },
        { name: "endDate", label: "End date", type: "date" },
        { name: "description", label: "Description", type: "textarea" },
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
      })}
    />
  );
}
