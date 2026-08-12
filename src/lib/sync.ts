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
  if (isSyncing) return;
  isSyncing = true;

  try {
    const rawId = doc._id || doc.id;
    const id = typeof rawId === "string" ? new mongoose.Types.ObjectId(rawId) : rawId;

    if (resource === "timeline") {
      const category = doc.category;
      if (category === "experience") {
        const exp = await Experience.create({
          role: doc.role,
          company: doc.company,
          startDate: doc.startDate,
          endDate: doc.endDate,
          description: doc.description || "",
          bullets: [],
          techStack: [],
          order: doc.order || 0,
        });
        await TimelineEntry.findByIdAndUpdate(id, { linkedId: exp._id });
      } else if (category === "education") {
        const edu = await Education.create({
          degree: doc.role,
          institution: doc.company,
          year: getYearString(doc.startDate, doc.endDate),
          highlights: doc.description ? doc.description.split("\n").map(h => h.trim()).filter(Boolean) : [],
        });
        await TimelineEntry.findByIdAndUpdate(id, { linkedId: edu._id });
      } else if (category === "certificate") {
        const cert = await Certification.create({
          title: doc.role,
          provider: doc.company,
          date: doc.startDate,
          credentialUrl: doc.link || "",
          imageUrl: "",
          order: doc.order || 0,
        });
        await TimelineEntry.findByIdAndUpdate(id, { linkedId: cert._id });
      } else if (category === "achievement") {
        const ach = await Achievement.create({
          title: doc.role,
          description: doc.description || "",
          date: doc.startDate,
          imageUrl: "",
          order: doc.order || 0,
        });
        await TimelineEntry.findByIdAndUpdate(id, { linkedId: ach._id });
      }
    } else if (resource === "experience") {
      await TimelineEntry.create({
        category: "experience",
        role: doc.role,
        company: doc.company,
        startDate: doc.startDate,
        endDate: doc.endDate,
        description: doc.description || "",
        link: "",
        order: doc.order || 0,
        linkedId: id,
      });
    } else if (resource === "education") {
      const { startDate, endDate } = parseEducationYearRange(doc.year || "");
      await TimelineEntry.create({
        category: "education",
        role: doc.degree,
        company: doc.institution,
        startDate,
        endDate,
        description: doc.highlights?.join("\n") || "",
        link: "",
        order: 0,
        linkedId: id,
      });
    } else if (resource === "certifications") {
      await TimelineEntry.create({
        category: "certificate",
        role: doc.title,
        company: doc.provider,
        startDate: doc.date,
        endDate: null,
        description: "",
        link: doc.credentialUrl || "",
        order: doc.order || 0,
        linkedId: id,
      });
    } else if (resource === "achievements") {
      await TimelineEntry.create({
        category: "achievement",
        role: doc.title,
        company: "",
        startDate: doc.date,
        endDate: null,
        description: doc.description || "",
        link: "",
        order: doc.order || 0,
        linkedId: id,
      });
    }
  } catch (err) {
    console.error(`[Sync] syncOnCreate failed for resource ${resource}:`, err);
  } finally {
    isSyncing = false;
  }
}

export async function syncOnUpdate(resource: string, id: string | mongoose.Types.ObjectId, body: any) {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const objectId = typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

    if (resource === "timeline") {
      const timeEntry = await TimelineEntry.findById(objectId);
      if (!timeEntry) return;

      const category = timeEntry.category;
      let linkedId = timeEntry.linkedId;

      let linkedDoc: any = null;
      let oldCategory: string | null = null;

      if (linkedId) {
        if (await Experience.exists({ _id: linkedId })) {
          linkedDoc = await Experience.findById(linkedId);
          oldCategory = "experience";
        } else if (await Education.exists({ _id: linkedId })) {
          linkedDoc = await Education.findById(linkedId);
          oldCategory = "education";
        } else if (await Certification.exists({ _id: linkedId })) {
          linkedDoc = await Certification.findById(linkedId);
          oldCategory = "certificate";
        } else if (await Achievement.exists({ _id: linkedId })) {
          linkedDoc = await Achievement.findById(linkedId);
          oldCategory = "achievement";
        }
      }

      if (oldCategory && oldCategory !== category) {
        if (oldCategory === "experience") await Experience.findByIdAndDelete(linkedId);
        else if (oldCategory === "education") await Education.findByIdAndDelete(linkedId);
        else if (oldCategory === "certificate") await Certification.findByIdAndDelete(linkedId);
        else if (oldCategory === "achievement") await Achievement.findByIdAndDelete(linkedId);

        linkedId = null;
        linkedDoc = null;
      }

      if (!linkedId || !linkedDoc) {
        let newLinkedDoc: any = null;
        if (category === "experience") {
          newLinkedDoc = await Experience.create({
            role: timeEntry.role,
            company: timeEntry.company,
            startDate: timeEntry.startDate,
            endDate: timeEntry.endDate,
            description: timeEntry.description || "",
            bullets: [],
            techStack: [],
            order: timeEntry.order || 0,
          });
        } else if (category === "education") {
          newLinkedDoc = await Education.create({
            degree: timeEntry.role,
            institution: timeEntry.company,
            year: getYearString(timeEntry.startDate, timeEntry.endDate),
            highlights: timeEntry.description ? timeEntry.description.split("\n").map(h => h.trim()).filter(Boolean) : [],
          });
        } else if (category === "certificate") {
          newLinkedDoc = await Certification.create({
            title: timeEntry.role,
            provider: timeEntry.company,
            date: timeEntry.startDate,
            credentialUrl: timeEntry.link || "",
            imageUrl: "",
            order: timeEntry.order || 0,
          });
        } else if (category === "achievement") {
          newLinkedDoc = await Achievement.create({
            title: timeEntry.role,
            description: timeEntry.description || "",
            date: timeEntry.startDate,
            imageUrl: "",
            order: timeEntry.order || 0,
          });
        }

        if (newLinkedDoc) {
          await TimelineEntry.findByIdAndUpdate(objectId, { linkedId: newLinkedDoc._id });
        }
      } else {
        if (category === "experience") {
          await Experience.findByIdAndUpdate(linkedId, {
            role: timeEntry.role,
            company: timeEntry.company,
            startDate: timeEntry.startDate,
            endDate: timeEntry.endDate,
            description: timeEntry.description || "",
            order: timeEntry.order || 0,
          });
        } else if (category === "education") {
          await Education.findByIdAndUpdate(linkedId, {
            degree: timeEntry.role,
            institution: timeEntry.company,
            year: getYearString(timeEntry.startDate, timeEntry.endDate),
            highlights: timeEntry.description ? timeEntry.description.split("\n").map(h => h.trim()).filter(Boolean) : [],
          });
        } else if (category === "certificate") {
          await Certification.findByIdAndUpdate(linkedId, {
            title: timeEntry.role,
            provider: timeEntry.company,
            date: timeEntry.startDate,
            credentialUrl: timeEntry.link || "",
            order: timeEntry.order || 0,
          });
        } else if (category === "achievement") {
          await Achievement.findByIdAndUpdate(linkedId, {
            title: timeEntry.role,
            description: timeEntry.description || "",
            date: timeEntry.startDate,
            order: timeEntry.order || 0,
          });
        }
      }
    } else if (resource === "experience") {
      const exp = await Experience.findById(objectId);
      if (exp) {
        await TimelineEntry.findOneAndUpdate(
          { linkedId: objectId },
          {
            category: "experience",
            role: exp.role,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description || "",
            order: exp.order || 0,
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    } else if (resource === "education") {
      const edu = await Education.findById(objectId);
      if (edu) {
        const { startDate, endDate } = parseEducationYearRange(edu.year || "");
        await TimelineEntry.findOneAndUpdate(
          { linkedId: objectId },
          {
            category: "education",
            role: edu.degree,
            company: edu.institution,
            startDate,
            endDate,
            description: edu.highlights?.join("\n") || "",
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    } else if (resource === "certifications") {
      const cert = await Certification.findById(objectId);
      if (cert) {
        await TimelineEntry.findOneAndUpdate(
          { linkedId: objectId },
          {
            category: "certificate",
            role: cert.title,
            company: cert.provider,
            startDate: cert.date,
            endDate: null,
            link: cert.credentialUrl || "",
            order: cert.order || 0,
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    } else if (resource === "achievements") {
      const ach = await Achievement.findById(objectId);
      if (ach) {
        await TimelineEntry.findOneAndUpdate(
          { linkedId: objectId },
          {
            category: "achievement",
            role: ach.title,
            company: "",
            startDate: ach.date,
            endDate: null,
            description: ach.description || "",
            order: ach.order || 0,
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    }
  } catch (err) {
    console.error(`[Sync] syncOnUpdate failed for resource ${resource} (ID: ${id}):`, err);
  } finally {
    isSyncing = false;
  }
}

export async function syncOnDelete(resource: string, idOrDoc: any) {
  if (isSyncing) return;
  isSyncing = true;

  try {
    let doc: any = null;
    let objectId: mongoose.Types.ObjectId;

    if (idOrDoc && typeof idOrDoc === "object" && !(idOrDoc instanceof mongoose.Types.ObjectId)) {
      doc = idOrDoc;
      const rawId = doc._id || doc.id;
      objectId = typeof rawId === "string" ? new mongoose.Types.ObjectId(rawId) : rawId;
    } else {
      objectId = typeof idOrDoc === "string" ? new mongoose.Types.ObjectId(idOrDoc) : idOrDoc;
    }

    if (resource === "timeline") {
      const timeEntry = doc || (await TimelineEntry.findById(objectId));
      if (timeEntry && timeEntry.linkedId) {
        const category = timeEntry.category;
        const linkedId = timeEntry.linkedId;

        if (category === "experience") {
          await Experience.findByIdAndDelete(linkedId);
        } else if (category === "education") {
          await Education.findByIdAndDelete(linkedId);
        } else if (category === "certificate") {
          await Certification.findByIdAndDelete(linkedId);
        } else if (category === "achievement") {
          await Achievement.findByIdAndDelete(linkedId);
        }
      }
    } else {
      await TimelineEntry.deleteMany({ linkedId: objectId });
    }
  } catch (err) {
    console.error(`[Sync] syncOnDelete failed for resource ${resource}:`, err);
  } finally {
    isSyncing = false;
  }
}

export async function reconcileDatabase() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    console.log("[Sync] Reconciling database to sync timeline and modules...");

    const timelineEntries = await TimelineEntry.find();
    for (const entry of timelineEntries) {
      if (entry.linkedId) {
        let exists = false;
        if (entry.category === "experience") exists = !!(await Experience.exists({ _id: entry.linkedId }));
        else if (entry.category === "education") exists = !!(await Education.exists({ _id: entry.linkedId }));
        else if (entry.category === "certificate") exists = !!(await Certification.exists({ _id: entry.linkedId }));
        else if (entry.category === "achievement") exists = !!(await Achievement.exists({ _id: entry.linkedId }));

        if (exists) continue;
      }

      let matchedDocId: mongoose.Types.ObjectId | null = null;

      if (entry.category === "experience") {
        const match = await Experience.findOne({
          role: entry.role,
          company: entry.company,
        });
        if (match) matchedDocId = match._id as mongoose.Types.ObjectId;
        else {
          const exp = await Experience.create({
            role: entry.role,
            company: entry.company,
            startDate: entry.startDate,
            endDate: entry.endDate,
            description: entry.description || "",
            bullets: [],
            techStack: [],
            order: entry.order || 0,
          });
          matchedDocId = exp._id as mongoose.Types.ObjectId;
        }
      } else if (entry.category === "education") {
        const match = await Education.findOne({
          degree: entry.role,
          institution: entry.company,
        });
        if (match) matchedDocId = match._id as mongoose.Types.ObjectId;
        else {
          const edu = await Education.create({
            degree: entry.role,
            institution: entry.company,
            year: getYearString(entry.startDate, entry.endDate),
            highlights: entry.description ? entry.description.split("\n").map(h => h.trim()).filter(Boolean) : [],
          });
          matchedDocId = edu._id as mongoose.Types.ObjectId;
        }
      } else if (entry.category === "certificate") {
        const match = await Certification.findOne({
          title: entry.role,
          provider: entry.company,
        });
        if (match) matchedDocId = match._id as mongoose.Types.ObjectId;
        else {
          const cert = await Certification.create({
            title: entry.role,
            provider: entry.company,
            date: entry.startDate,
            credentialUrl: entry.link || "",
            imageUrl: "",
            order: entry.order || 0,
          });
          matchedDocId = cert._id as mongoose.Types.ObjectId;
        }
      } else if (entry.category === "achievement") {
        const match = await Achievement.findOne({
          title: entry.role,
        });
        if (match) matchedDocId = match._id as mongoose.Types.ObjectId;
        else {
          const ach = await Achievement.create({
            title: entry.role,
            description: entry.description || "",
            date: entry.startDate,
            imageUrl: "",
            order: entry.order || 0,
          });
          matchedDocId = ach._id as mongoose.Types.ObjectId;
        }
      }

      if (matchedDocId) {
        await TimelineEntry.findByIdAndUpdate(entry._id, { linkedId: matchedDocId });
      }
    }

    const experiences = await Experience.find();
    for (const exp of experiences) {
      const linked = await TimelineEntry.findOne({ linkedId: exp._id });
      if (!linked) {
        const match = await TimelineEntry.findOne({
          category: "experience",
          role: exp.role,
          company: exp.company,
          linkedId: null,
        });
        if (match) {
          await TimelineEntry.findByIdAndUpdate(match._id, { linkedId: exp._id });
        } else {
          await TimelineEntry.create({
            category: "experience",
            role: exp.role,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description || "",
            link: "",
            order: exp.order || 0,
            linkedId: exp._id,
          });
        }
      }
    }

    const educations = await Education.find();
    for (const edu of educations) {
      const linked = await TimelineEntry.findOne({ linkedId: edu._id });
      if (!linked) {
        const match = await TimelineEntry.findOne({
          category: "education",
          role: edu.degree,
          company: edu.institution,
          linkedId: null,
        });
        if (match) {
          await TimelineEntry.findByIdAndUpdate(match._id, { linkedId: edu._id });
        } else {
          const { startDate, endDate } = parseEducationYearRange(edu.year || "");
          await TimelineEntry.create({
            category: "education",
            role: edu.degree,
            company: edu.institution,
            startDate,
            endDate,
            description: edu.highlights?.join("\n") || "",
            link: "",
            order: 0,
            linkedId: edu._id,
          });
        }
      }
    }

    const certifications = await Certification.find();
    for (const cert of certifications) {
      const linked = await TimelineEntry.findOne({ linkedId: cert._id });
      if (!linked) {
        const match = await TimelineEntry.findOne({
          category: "certificate",
          role: cert.title,
          company: cert.provider,
          linkedId: null,
        });
        if (match) {
          await TimelineEntry.findByIdAndUpdate(match._id, { linkedId: cert._id });
        } else {
          await TimelineEntry.create({
            category: "certificate",
            role: cert.title,
            company: cert.provider,
            startDate: cert.date,
            endDate: null,
            description: "",
            link: cert.credentialUrl || "",
            order: cert.order || 0,
            linkedId: cert._id,
          });
        }
      }
    }

    const achievements = await Achievement.find();
    for (const ach of achievements) {
      const linked = await TimelineEntry.findOne({ linkedId: ach._id });
      if (!linked) {
        const match = await TimelineEntry.findOne({
          category: "achievement",
          role: ach.title,
          linkedId: null,
        });
        if (match) {
          await TimelineEntry.findByIdAndUpdate(match._id, { linkedId: ach._id });
        } else {
          await TimelineEntry.create({
            category: "achievement",
            role: ach.title,
            company: "",
            startDate: ach.date,
            endDate: null,
            description: ach.description || "",
            link: "",
            order: ach.order || 0,
            linkedId: ach._id,
          });
        }
      }
    }

    console.log("[Sync] Database reconciliation complete.");
  } catch (err) {
    console.error("[Sync] reconcileDatabase failed:", err);
  } finally {
    isSyncing = false;
  }
}
