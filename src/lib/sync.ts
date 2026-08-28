import mongoose from "mongoose";
import TimelineEntry from "@/models/TimelineEntry";
import Experience from "@/models/Experience";
import Education from "@/models/Education";
import Certification from "@/models/Certification";
import Achievement from "@/models/Achievement";
import { parseEducationYear } from "@/lib/journey-utils";

// Module level flag to prevent recursion
let isSyncing = false;

// Helper to convert start/end date into year string for education
export function getYearString(startDate: Date | string | null | undefined, endDate: Date | string | null | undefined): string {
  if (!startDate) return "";
  const startYear = new Date(startDate).getUTCFullYear();
  if (!endDate) return `${startYear} - Present`;
  const endYear = new Date(endDate).getUTCFullYear();
  if (startYear === endYear) return `${startYear}`;
  return `${startYear} - ${endYear}`;
}

// Helper to parse education year strings like "2020", "2018–2022", "2018 - Present" into start/end dates
export function parseEducationYearRange(yearStr: string): { startDate: Date; endDate: Date | null } {
  const trimmed = yearStr.trim();
  const parts = trimmed.split(/[-–—to]/).map(p => p.trim());
  const startPart = parts[0] || "2020";
  const endPart = parts[1] || null;

  const startDate = parseEducationYear(startPart);
  let endDate: Date | null = null;
  if (endPart) {
    if (["present", "current", "ongoing", ""].includes(endPart.toLowerCase())) {
      endDate = null;
    } else {
      endDate = parseEducationYear(endPart);
    }
  }
  return { startDate, endDate };
}

export async function syncOnCreate(resource: string, doc: any) {
  // Syncing disabled: all collections are independent
  return;
}

export async function syncOnUpdate(resource: string, id: string | mongoose.Types.ObjectId, body: any) {
  // Syncing disabled: all collections are independent
  return;
}

export async function syncOnDelete(resource: string, idOrDoc: any) {
  // Syncing disabled: all collections are independent
  return;
}

export async function reconcileDatabase() {
  // Syncing disabled: all collections are independent
  return;
}

