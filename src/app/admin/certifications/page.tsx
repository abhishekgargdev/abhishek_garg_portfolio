"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  title: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  date: z.string().min(1),
  credentialUrl: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  order: z.coerce.number().int().default(0),
});

type CertificationRow = {
  id: string;
  title: string;
  provider: string;
  date: string;
  credentialUrl: string;
  imageUrl?: string;
  order: number;
};

export default function AdminCertificationsPage() {
  return (
    <AdminResourcePage<CertificationRow, typeof schema>
      title="Certifications"
      resource="certifications"
      enableReorder
      schema={schema}
      emptyValues={{
        title: "",
        provider: "",
        date: "",
        credentialUrl: "",
        imageUrl: "",
        order: 0,
      }}
      columns={[
        { key: "title", header: "Title" },
        { key: "provider", header: "Provider" },
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
        { name: "provider", label: "Provider", type: "text" },
        { name: "date", label: "Date", type: "date" },
        { name: "credentialUrl", label: "Credential URL", type: "url" },
        {
          name: "imageUrl",
          label: "Certificate Image",
          type: "image",
          uploadSection: "certifications",
        },
        { name: "order", label: "Order", type: "number" },
      ]}
      toFormValues={(row) => ({
        ...row,
        date: row.date?.slice(0, 10) ?? "",
      })}
    />
  );
}
