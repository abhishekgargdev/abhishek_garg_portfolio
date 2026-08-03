"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  degree: z.string().trim().min(1),
  institution: z.string().trim().min(1),
  year: z.string().trim().min(1),
  highlights: z.array(z.string()).default([]),
});

type EducationRow = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
};

export default function AdminEducationPage() {
  return (
    <AdminResourcePage<EducationRow, typeof schema>
      title="Education"
      resource="education"
      schema={schema}
      emptyValues={{
        degree: "",
        institution: "",
        year: "",
        highlights: [],
      }}
      columns={[
        { key: "degree", header: "Degree" },
        { key: "institution", header: "Institution" },
        { key: "year", header: "Year" },
      ]}
      fields={[
        { name: "degree", label: "Degree", type: "text" },
        { name: "institution", label: "Institution", type: "text" },
        { name: "year", label: "Year", type: "text", placeholder: "2020 or 2018–2022" },
        {
          name: "highlights",
          label: "Highlights",
          type: "string-list",
          description: "One highlight per line",
        },
      ]}
      toPayload={(values) => ({
        ...values,
        highlights: values.highlights.map((item) => item.trim()).filter(Boolean),
      })}
    />
  );
}
