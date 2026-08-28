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

export const runtime = "nodejs";

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
        description: doc.description,
        bullets: doc.bullets || [],
        techStack: doc.techStack || [],
        liveUrl: doc.liveUrl || "",
        githubUrl: doc.githubUrl || "",
        links: doc.links || [],
        directoryStructure: doc.directoryStructure || "",
        readmeMd: doc.readmeMd || "",
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
      ] = await Promise.all([
        fetchAboutMe(),
        fetchExperience(),
        fetchProjects(),
        fetchSkills(),
        fetchEducation(),
        fetchAchievements(),
        fetchCertifications(),
        fetchTimeline(),
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
      if (body.aboutMe) {
        const { id, _id, ...aboutData } = body.aboutMe;
        await AboutMe.findOneAndUpdate({}, aboutData, { upsert: true, new: true });
      }

      // 2. Experience
      if (body.experience) await performUpserts(Experience, body.experience);
      // 3. Projects
      if (body.projects) await performUpserts(Project, body.projects);
      // 4. Skills
      if (body.skills) await performUpserts(SkillCategory, body.skills);
      // 5. Education
      if (body.education) await performUpserts(Education, body.education);
      // 6. Achievements
      if (body.achievements) await performUpserts(Achievement, body.achievements);
      // 7. Certifications
      if (body.certifications) await performUpserts(Certification, body.certifications);
      // 8. Timeline
      if (body.timeline) await performUpserts(TimelineEntry, body.timeline);

      return NextResponse.json({ message: "All portfolio data upserted successfully" });
    }

    // Single module upserts
    if (moduleParam === "aboutMe") {
      const { id, _id, ...aboutData } = body;
      await AboutMe.findOneAndUpdate({}, aboutData, { upsert: true, new: true });
      return NextResponse.json({ message: "About Me upserted successfully" });
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

    const arrayPayload = Array.isArray(body) ? body : [body];
    await performUpserts(Model, arrayPayload);

    return NextResponse.json({
      message: `${moduleParam.slice(0, 1).toUpperCase() + moduleParam.slice(1)} data upserted successfully`,
    });
  } catch (error) {
    console.error("[json-data] POST failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import / upsert data" },
      { status: 500 },
    );
  }
}
