"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  categoryName: z.string().trim().min(1),
  order: z.coerce.number().int().default(0),
  skills: z.array(z.string()).default([]),
});

type SkillRow = {
  id: string;
  categoryName: string;
  order: number;
  skills: { name: string; iconKey: string; proficiency: number }[];
};

export default function AdminSkillsPage() {
  return (
    <AdminResourcePage<SkillRow, typeof schema>
      title="Skills"
      description="Categories and skills for the Skills section tabs."
      resource="skills"
      schema={schema}
      emptyValues={{
        categoryName: "",
        order: 0,
        skills: [],
      }}
      columns={[
        { key: "categoryName", header: "Category" },
        {
          key: "count",
          header: "Skills",
          render: (row) => String(row.skills?.length ?? 0),
        },
        { key: "order", header: "Order" },
      ]}
      fields={[
        { name: "categoryName", label: "Category name", type: "text" },
        { name: "order", label: "Order", type: "number" },
        {
          name: "skills",
          label: "Skills",
          type: "string-list",
          description: "One per line as name|iconKey|proficiency (e.g. React|react|90)",
        },
      ]}
      toFormValues={(row) => ({
        categoryName: row.categoryName,
        order: row.order,
        skills: (row.skills ?? []).map(
          (skill) =>
            `${skill.name}|${skill.iconKey}|${skill.proficiency}`,
        ),
      })}
      toPayload={(values) => ({
        categoryName: values.categoryName,
        order: values.order,
        skills: values.skills
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, iconKey, proficiencyRaw] = line.split("|");
            return {
              name: name?.trim() || "Skill",
              iconKey: iconKey?.trim() || "code",
              proficiency: Math.min(
                100,
                Math.max(0, Number(proficiencyRaw) || 0),
              ),
            };
          }),
      })}
    />
  );
}
