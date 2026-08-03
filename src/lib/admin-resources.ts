import type { Model } from "mongoose";
import AboutMe from "@/models/AboutMe";
import Achievement from "@/models/Achievement";
import Certification from "@/models/Certification";
import Education from "@/models/Education";
import Experience from "@/models/Experience";
import Project from "@/models/Project";
import SkillCategory from "@/models/SkillCategory";
import TimelineEntry from "@/models/TimelineEntry";

export const ADMIN_RESOURCES = [
  "about",
  "timeline",
  "education",
  "experience",
  "projects",
  "skills",
  "achievements",
  "certifications",
] as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[number];

export function isAdminResource(value: string): value is AdminResource {
  return (ADMIN_RESOURCES as readonly string[]).includes(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODEL_MAP: Record<AdminResource, Model<any>> = {
  about: AboutMe,
  timeline: TimelineEntry,
  education: Education,
  experience: Experience,
  projects: Project,
  skills: SkillCategory,
  achievements: Achievement,
  certifications: Certification,
};

export function getAdminModel(resource: AdminResource) {
  return MODEL_MAP[resource];
}

export function serializeAdminDoc(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: Record<string, any>,
) {
  const { _id, __v, ...rest } = doc;
  const serialized: Record<string, unknown> = {
    ...rest,
    id: String(_id),
  };

  for (const [key, value] of Object.entries(serialized)) {
    if (value instanceof Date) {
      serialized[key] = value.toISOString();
    }
  }

  return serialized;
}
