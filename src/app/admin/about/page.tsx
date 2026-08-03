"use client";

import { z } from "zod";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
  tagline: z.string().trim().min(1, "Tagline is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  profileImageUrl: z.string().optional().default(""),
  resumeFileUrl: z.string().optional().default(""),
  location: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.email("Enter a valid email"),
  socialLinks: z.array(z.string()).default([]),
});

type AboutRow = {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profileImageUrl: string;
  resumeFileUrl: string;
  location: string;
  phone: string;
  email: string;
  socialLinks: { platform: string; url: string }[];
};

export default function AdminAboutPage() {
  return (
    <AdminResourcePage<AboutRow, typeof schema>
      title="About"
      description="Your profile details shown on the homepage hero."
      resource="about"
      maxRecords={1}
      emptyMessage="No about profile yet. Add one to power the Hero section."
      schema={schema}
      emptyValues={{
        name: "",
        title: "",
        tagline: "",
        bio: "",
        profileImageUrl: "",
        resumeFileUrl: "",
        location: "",
        phone: "",
        email: "",
        socialLinks: [],
      }}
      columns={[
        { key: "name", header: "Name" },
        { key: "title", header: "Title" },
        { key: "email", header: "Email" },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "title", label: "Title", type: "text" },
        { name: "tagline", label: "Tagline", type: "text" },
        { name: "bio", label: "Bio", type: "textarea" },
        {
          name: "profileImageUrl",
          label: "Profile image",
          type: "image",
          uploadSection: "about",
        },
        {
          name: "resumeFileUrl",
          label: "Resume file",
          type: "image",
          uploadSection: "resume",
        },
        { name: "location", label: "Location", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "email", label: "Email", type: "email" },
        {
          name: "socialLinks",
          label: "Social links",
          type: "string-list",
          description: "One per line as platform|url (e.g. GitHub|https://…)",
        },
      ]}
      toFormValues={(row) => ({
        ...row,
        socialLinks: (row.socialLinks ?? []).map(
          (link) => `${link.platform}|${link.url}`,
        ),
      })}
      toPayload={(values) => ({
        ...values,
        socialLinks: values.socialLinks
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [platform, ...rest] = line.split("|");
            return {
              platform: platform?.trim() || "Link",
              url: rest.join("|").trim(),
            };
          })
          .filter((link) => link.url),
      })}
    />
  );
}
