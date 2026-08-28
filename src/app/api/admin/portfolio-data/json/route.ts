import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import AboutMe from "@/models/AboutMe";
import Experience from "@/models/Experience";
import Project from "@/models/Project";
import SkillCategory from "@/models/SkillCategory";
import Education from "@/models/Education";
import Achievement from "@/models/Achievement";
import Certification from "@/models/Certification";
import TimelineEntry from "@/models/TimelineEntry";
import ExperienceTenure from "@/models/ExperienceTenure";
import { z } from "zod";

export const runtime = "nodejs";

// Zod schemas for validation
const aboutMeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  beyondCodeBio: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  profileImageUrl: z.string().trim().optional().default(""),
  resumeFileUrl: z.string().trim().optional().default(""),
  portfolioUrl: z.string().trim().optional().default(""),
  openSourceContributions: z.array(z.string()).optional().default([]),
  taglines: z.array(z.string()).optional().default([]),
  socialLinks: z.array(
    z.object({
      platform: z.string().trim().min(1, "Platform name is required"),
      url: z.string().trim().min(1, "Social URL is required"),
    })
  ).optional().default([]),
});

const experienceSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  role: z.string().trim().min(1, "Role is required"),
  company: z.string().trim().min(1, "Company is required"),
  description: z.string().trim().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  bullets: z.array(z.string()).optional().default([]),
  techStack: z.array(z.string()).optional().default([]),
  order: z.coerce.number().int().optional().default(0),
});

const projectSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  techStack: z.array(z.string()).optional().default([]),
  description: z.string().trim().min(1, "Description is required"),
  bullets: z.array(z.string()).optional().default([]),
  imageUrl: z.string().trim().optional().default(""),
  images: z.array(z.string()).optional().default([]),
  category: z.string().trim().optional().default(""),
  status: z.enum(["completed", "ongoing", "concept"]).optional().default("completed"),
  featured: z.boolean().optional().default(false),
  role: z.string().trim().optional().default(""),
  duration: z.string().trim().optional().default(""),
  problem: z.string().trim().optional().default(""),
  solution: z.string().trim().optional().default(""),
  features: z.array(z.string()).optional().default([]),
  results: z.array(
    z.object({
      label: z.string().trim().min(1, "Label is required"),
      value: z.string().trim().min(1, "Value is required"),
    })
  ).optional().default([]),
  videoUrl: z.string().trim().optional().default(""),
  liveUrl: z.string().trim().optional().default(""),
  githubUrl: z.string().trim().optional().default(""),
  links: z.array(
    z.object({
      label: z.string().trim().min(1, "Label is required"),
      url: z.string().trim().min(1, "Link URL is required"),
    })
  ).optional().default([]),
  directoryStructure: z.string().trim().optional().default(""),
  readmeMd: z.string().trim().optional().default(""),
  projectType: z.enum(["personal", "professional"]).optional().default("personal"),
  company: z.string().trim().optional().default(""),
  teamSize: z.string().trim().optional().default(""),
  responsibilities: z.array(z.string()).optional().default([]),
  order: z.coerce.number().int().optional().default(0),
});

const skillCategorySchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  categoryName: z.string().trim().min(1, "Category name is required"),
  order: z.coerce.number().int().optional().default(0),
  skills: z.array(
    z.object({
      name: z.string().trim().min(1, "Skill name is required"),
      proficiency: z.coerce.number().min(0, "Proficiency cannot be less than 0").max(100, "Proficiency cannot exceed 100").optional().default(0),
      iconKey: z.string().trim().optional().default(""),
    })
  ).optional().default([]),
});

const educationSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  degree: z.string().trim().min(1, "Degree is required"),
  institution: z.string().trim().min(1, "Institution is required"),
  year: z.string().trim().min(1, "Year is required"),
  highlights: z.array(z.string()).optional().default([]),
});

const achievementSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  imageUrl: z.string().trim().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});

const certificationSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  provider: z.string().trim().min(1, "Provider is required"),
  date: z.string().min(1, "Date is required"),
  credentialUrl: z.string().trim().optional().default(""),
  imageUrl: z.string().trim().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});

const timelineSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  category: z.enum(["experience", "education", "achievement", "certificate", "other"]).default("experience"),
  role: z.string().trim().min(1, "Role/title is required"),
  company: z.string().trim().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  description: z.string().trim().min(1, "Description is required"),
  link: z.string().trim().optional().default(""),
  order: z.coerce.number().int().optional().default(0),
});

const periodSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required"),
  company: z.string().trim().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  countsTotal: z.boolean().default(true),
  countsRelevant: z.boolean().default(false),
});

const experienceTenureSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  totalLabel: z.string().trim().min(1, "Total label is required").default("Total Experience"),
  relevantLabel: z.string().trim().min(1, "Relevant label is required").default("Relevant Experience"),
  periods: z.array(periodSchema).min(1, "Add at least one period"),
});

const allSchema = z.object({
  aboutMe: aboutMeSchema.optional(),
  experience: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(skillCategorySchema).optional(),
  education: z.array(educationSchema).optional(),
  achievements: z.array(achievementSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  timeline: z.array(timelineSchema).optional(),
  experienceTenure: experienceTenureSchema.optional(),
});

// Normalizes module query parameter to a standard key name
function getNormalizedModule(param: string | null): string {
  const p = String(param || "all").toLowerCase().trim();
  if (p === "about" || p === "aboutme") return "aboutMe";
  if (p === "experience" || p === "experiences") return "experience";
  if (p === "project" || p === "projects") return "projects";
  if (p === "skill" || p === "skills") return "skills";
  if (p === "education") return "education";
  if (p === "achievement" || p === "achievements") return "achievements";
  if (p === "certification" || p === "certifications" || p === "cert") return "certifications";
  if (p === "timeline" || p === "timelineentry" || p === "timelineentries") return "timeline";
  if (p === "experiencetenure" || p === "experienceclocks" || p === "experienceclock" || p === "tenure") return "experienceTenure";
  return "all";
}

// GET — Export data for all modules or a single module
export async function GET(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const moduleParam = getNormalizedModule(searchParams.get("module"));

  try {
    await connectDB();

    const fetchAboutMe = async () => {
      const doc = await AboutMe.findOne().lean();
      return doc ? {
        id: String(doc._id),
        name: doc.name,
        title: doc.title,
        taglines: doc.taglines || [],
        bio: doc.bio,
        beyondCodeBio: doc.beyondCodeBio || "",
        location: doc.location,
        phone: doc.phone,
        email: doc.email,
        profileImageUrl: doc.profileImageUrl,
        resumeFileUrl: doc.resumeFileUrl,
        portfolioUrl: doc.portfolioUrl || "",
        openSourceContributions: doc.openSourceContributions || [],
        socialLinks: doc.socialLinks || [],
      } : null;
    };

    const fetchExperience = async () => {
      const docs = await Experience.find().sort({ order: 1, startDate: -1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        role: doc.role,
        company: doc.company,
        startDate: doc.startDate ? new Date(doc.startDate).toISOString() : "",
        endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
        bullets: doc.bullets || [],
        techStack: doc.techStack || [],
        order: doc.order || 0,
      }));
    };

    const fetchProjects = async () => {
      const docs = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        title: doc.title,
        slug: doc.slug,
        techStack: doc.techStack || [],
        description: doc.description,
        bullets: doc.bullets || [],
        imageUrl: doc.imageUrl || "",
        images: doc.images || [],
        category: doc.category || "",
        status: doc.status || "completed",
        featured: doc.featured === true,
        role: doc.role || "",
        duration: doc.duration || "",
        problem: doc.problem || "",
        solution: doc.solution || "",
        features: doc.features || [],
        results: (doc.results || []).map((r: any) => ({
          label: r.label,
          value: r.value,
        })),
        videoUrl: doc.videoUrl || "",
        liveUrl: doc.liveUrl || "",
        githubUrl: doc.githubUrl || "",
        links: (doc.links || []).map((l: any) => ({
          label: l.label,
          url: l.url,
        })),
        directoryStructure: doc.directoryStructure || "",
        readmeMd: doc.readmeMd || "",
        projectType: doc.projectType || "personal",
        company: doc.company || "",
        teamSize: doc.teamSize || "",
        responsibilities: doc.responsibilities || [],
        order: doc.order || 0,
      }));
    };

    const fetchSkills = async () => {
      const docs = await SkillCategory.find().sort({ order: 1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        categoryName: doc.categoryName,
        order: doc.order || 0,
        skills: (doc.skills || []).map((s: any) => ({
          name: s.name,
          proficiency: s.proficiency || 0,
          iconKey: s.iconKey || "",
        })),
      }));
    };

    const fetchEducation = async () => {
      const docs = await Education.find().sort({ year: -1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        degree: doc.degree,
        institution: doc.institution,
        year: doc.year,
        highlights: doc.highlights || [],
      }));
    };

    const fetchAchievements = async () => {
      const docs = await Achievement.find().sort({ order: 1, date: -1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        title: doc.title,
        description: doc.description,
        date: doc.date ? new Date(doc.date).toISOString() : "",
        imageUrl: doc.imageUrl || "",
        order: doc.order || 0,
      }));
    };

    const fetchCertifications = async () => {
      const docs = await Certification.find().sort({ order: 1, date: -1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        title: doc.title,
        provider: doc.provider,
        date: doc.date ? new Date(doc.date).toISOString() : "",
        credentialUrl: doc.credentialUrl || "",
        imageUrl: doc.imageUrl || "",
        order: doc.order || 0,
      }));
    };

    const fetchTimeline = async () => {
      const docs = await TimelineEntry.find().sort({ order: 1, startDate: -1 }).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        category: doc.category,
        role: doc.role,
        company: doc.company || "",
        startDate: doc.startDate ? new Date(doc.startDate).toISOString() : "",
        endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
        description: doc.description || "",
        link: doc.link || "",
        order: doc.order || 0,
      }));
    };

    const fetchExperienceTenure = async () => {
      const doc = await ExperienceTenure.findOne().sort({ updatedAt: -1 }).lean();
      return doc ? {
        id: String(doc._id),
        totalLabel: doc.totalLabel || "Total Experience",
        relevantLabel: doc.relevantLabel || "Relevant Experience",
        periods: (doc.periods || []).map((p: any) => ({
          id: String(p._id),
          title: p.title,
          company: p.company || "",
          startDate: p.startDate ? new Date(p.startDate).toISOString() : "",
          endDate: p.endDate ? new Date(p.endDate).toISOString() : null,
          countsTotal: p.countsTotal !== false,
          countsRelevant: p.countsRelevant === true,
        })),
      } : null;
    };

    if (moduleParam === "all") {
      const [
        aboutMe,
        experience,
        projects,
        skills,
        education,
        achievements,
        certifications,
        timeline,
        experienceTenure,
      ] = await Promise.all([
        fetchAboutMe(),
        fetchExperience(),
        fetchProjects(),
        fetchSkills(),
        fetchEducation(),
        fetchAchievements(),
        fetchCertifications(),
        fetchTimeline(),
        fetchExperienceTenure(),
      ]);
      return NextResponse.json({
        aboutMe,
        experience,
        projects,
        skills,
        education,
        achievements,
        certifications,
        timeline,
        experienceTenure,
      });
    }

    if (moduleParam === "aboutMe") return NextResponse.json(await fetchAboutMe());
    if (moduleParam === "experience") return NextResponse.json(await fetchExperience());
    if (moduleParam === "projects") return NextResponse.json(await fetchProjects());
    if (moduleParam === "skills") return NextResponse.json(await fetchSkills());
    if (moduleParam === "education") return NextResponse.json(await fetchEducation());
    if (moduleParam === "achievements") return NextResponse.json(await fetchAchievements());
    if (moduleParam === "certifications") return NextResponse.json(await fetchCertifications());
    if (moduleParam === "timeline") return NextResponse.json(await fetchTimeline());
    if (moduleParam === "experienceTenure") return NextResponse.json(await fetchExperienceTenure());

    return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  } catch (error) {
    console.error("[json-data] GET failed:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

// POST — Import / Upsert data non-destructively
export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const moduleParam = getNormalizedModule(searchParams.get("module"));

  try {
    const body = await request.json();
    await connectDB();

    // 1. Perform Schema Validation
    let validatedData: any;
    
    if (moduleParam === "all") {
      const result = allSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: "Validation failed: " + result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ")
        }, { status: 400 });
      }
      validatedData = result.data;
    } else if (moduleParam === "aboutMe") {
      const result = aboutMeSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: "Validation failed: " + result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ")
        }, { status: 400 });
      }
      validatedData = result.data;
    } else if (moduleParam === "experienceTenure") {
      const result = experienceTenureSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: "Validation failed: " + result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ")
        }, { status: 400 });
      }
      validatedData = result.data;
    } else {
      let elementSchema;
      if (moduleParam === "experience") elementSchema = experienceSchema;
      else if (moduleParam === "projects") elementSchema = projectSchema;
      else if (moduleParam === "skills") elementSchema = skillCategorySchema;
      else if (moduleParam === "education") elementSchema = educationSchema;
      else if (moduleParam === "achievements") elementSchema = achievementSchema;
      else if (moduleParam === "certifications") elementSchema = certificationSchema;
      else if (moduleParam === "timeline") elementSchema = timelineSchema;

      if (!elementSchema) {
        return NextResponse.json({ error: "Invalid module specified" }, { status: 400 });
      }

      const isArray = Array.isArray(body);
      const result = isArray ? z.array(elementSchema).safeParse(body) : z.array(elementSchema).safeParse([body]);

      if (!result.success) {
        return NextResponse.json({
          error: "Validation failed: " + result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ")
        }, { status: 400 });
      }
      validatedData = result.data;
    }

    // Helper for non-destructive upserts (only insert or update, no delete)
    const performUpserts = async (Model: mongoose.Model<any>, items: any[]) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        const { id, _id, ...data } = item;
        const targetId = id || _id;
        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
          // If ID matches existing item, update it
          await Model.findByIdAndUpdate(targetId, data, { upsert: true });
        } else {
          // Create new record
          await Model.create(data);
        }
      }
    };

    if (moduleParam === "all") {
      // 1. Update AboutMe
      if (validatedData.aboutMe) {
        const { id, _id, ...aboutData } = validatedData.aboutMe;
        await AboutMe.findOneAndUpdate({}, aboutData, { upsert: true, new: true });
      }

      // 2. Experience
      if (validatedData.experience) await performUpserts(Experience, validatedData.experience);
      // 3. Projects
      if (validatedData.projects) await performUpserts(Project, validatedData.projects);
      // 4. Skills
      if (validatedData.skills) await performUpserts(SkillCategory, validatedData.skills);
      // 5. Education
      if (validatedData.education) await performUpserts(Education, validatedData.education);
      // 6. Achievements
      if (validatedData.achievements) await performUpserts(Achievement, validatedData.achievements);
      // 7. Certifications
      if (validatedData.certifications) await performUpserts(Certification, validatedData.certifications);
      // 8. Timeline
      if (validatedData.timeline) await performUpserts(TimelineEntry, validatedData.timeline);

      // 9. Experience Tenure
      if (validatedData.experienceTenure) {
        const tenureData = validatedData.experienceTenure;
        const periods = (tenureData.periods || []).map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: p.endDate ? new Date(p.endDate) : null,
        }));
        const totalStartDate = periods
          .filter((period: any) => period.countsTotal)
          .map((period: any) => period.startDate)
          .sort((a: any, b: any) => a.getTime() - b.getTime())[0];

        const existing = await ExperienceTenure.findOne().sort({ updatedAt: -1 });
        if (existing) {
          existing.totalLabel = tenureData.totalLabel;
          existing.relevantLabel = tenureData.relevantLabel;
          existing.periods = periods;
          existing.totalStartDate = totalStartDate;
          existing.totalPeriods = [];
          existing.relevantPeriods = [];
          existing.markModified("totalPeriods");
          existing.markModified("relevantPeriods");
          await existing.save();
        } else {
          await ExperienceTenure.create({
            totalLabel: tenureData.totalLabel,
            relevantLabel: tenureData.relevantLabel,
            periods,
            totalStartDate,
          });
        }
      }

      return NextResponse.json({ message: "All portfolio data validated and upserted successfully" });
    }

    // Single module upserts
    if (moduleParam === "aboutMe") {
      const { id, _id, ...aboutData } = validatedData;
      await AboutMe.findOneAndUpdate({}, aboutData, { upsert: true, new: true });
      return NextResponse.json({ message: "About Me validated and upserted successfully" });
    }

    if (moduleParam === "experienceTenure") {
      const { id, _id, ...tenureData } = validatedData;
      const periods = (tenureData.periods || []).map((p: any) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: p.endDate ? new Date(p.endDate) : null,
      }));
      const totalStartDate = periods
        .filter((period: any) => period.countsTotal)
        .map((period: any) => period.startDate)
        .sort((a: any, b: any) => a.getTime() - b.getTime())[0];

      const existing = await ExperienceTenure.findOne().sort({ updatedAt: -1 });
      if (existing) {
        existing.totalLabel = tenureData.totalLabel;
        existing.relevantLabel = tenureData.relevantLabel;
        existing.periods = periods;
        existing.totalStartDate = totalStartDate;
        existing.totalPeriods = [];
        existing.relevantPeriods = [];
        existing.markModified("totalPeriods");
        existing.markModified("relevantPeriods");
        await existing.save();
      } else {
        await ExperienceTenure.create({
          totalLabel: tenureData.totalLabel,
          relevantLabel: tenureData.relevantLabel,
          periods,
          totalStartDate,
        });
      }
      return NextResponse.json({ message: "Experience Tenure clocks validated and upserted successfully" });
    }

    let Model: mongoose.Model<any> | null = null;
    if (moduleParam === "experience") Model = Experience;
    if (moduleParam === "projects") Model = Project;
    if (moduleParam === "skills") Model = SkillCategory;
    if (moduleParam === "education") Model = Education;
    if (moduleParam === "achievements") Model = Achievement;
    if (moduleParam === "certifications") Model = Certification;
    if (moduleParam === "timeline") Model = TimelineEntry;

    if (!Model) {
      return NextResponse.json({ error: "Invalid module specified" }, { status: 400 });
    }

    await performUpserts(Model, validatedData);

    return NextResponse.json({
      message: `${moduleParam.slice(0, 1).toUpperCase() + moduleParam.slice(1)} data validated and upserted successfully`,
    });
  } catch (error) {
    console.error("[json-data] POST failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import / upsert data" },
      { status: 500 },
    );
  }
}
