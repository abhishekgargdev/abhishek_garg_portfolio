"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: z.string().min(1),
  order: z.coerce.number().int().default(0),
});

type AchievementRow = {
  id: string;
  title: string;
  description: string;
  date: string;
  order: number;
};

export default function AdminAchievementsPage() {
  return (
    <AdminResourcePage<AchievementRow, typeof schema>
      title="Achievements"
      resource="achievements"
      schema={schema}
      emptyValues={{
        title: "",
        description: "",
        date: "",
        order: 0,
      }}
      columns={[
        { key: "title", header: "Title" },
        {
          key: "date",
          header: "Date",
          render: (row) =>
            new Date(row.date).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            }),
        },
        { key: "order", header: "Order" },
      ]}
      fields={[
        { name: "title", label: "Title", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "date", label: "Date", type: "date" },
        { name: "order", label: "Order", type: "number" },
      ]}
      toFormValues={(row) => ({
        ...row,
        date: row.date?.slice(0, 10) ?? "",
      })}
    />
  );
}
