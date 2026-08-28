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

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();

    const [
      aboutMeDoc,
      experiences,
      projects,
      skills,
      education,
      achievements,
      certifications,
      timelineEntries,
    ] = await Promise.all([
      AboutMe.findOne().lean(),
      Experience.find().sort({ order: 1, startDate: -1 }).lean(),
      Project.find().sort({ order: 1, createdAt: -1 }).lean(),
      SkillCategory.find().sort({ order: 1 }).lean(),
      Education.find().sort({ year: -1 }).lean(),
      Achievement.find().sort({ order: 1, date: -1 }).lean(),
      Certification.find().sort({ order: 1, date: -1 }).lean(),
      TimelineEntry.find().sort({ order: 1, startDate: -1 }).lean(),
    ]);

    return NextResponse.json({
      aboutMe: aboutMeDoc ? {
        id: String(aboutMeDoc._id),
        name: aboutMeDoc.name,
        title: aboutMeDoc.title,
        taglines: aboutMeDoc.taglines || [],
        bio: aboutMeDoc.bio,
        beyondCodeBio: aboutMeDoc.beyondCodeBio || "",
        location: aboutMeDoc.location,
        phone: aboutMeDoc.phone,
        email: aboutMeDoc.email,
        profileImageUrl: aboutMeDoc.profileImageUrl,
        resumeFileUrl: aboutMeDoc.resumeFileUrl,
        portfolioUrl: aboutMeDoc.portfolioUrl || "",
        openSourceContributions: aboutMeDoc.openSourceContributions || [],
        socialLinks: aboutMeDoc.socialLinks || [],
      } : null,
      experience: experiences.map((doc) => ({
        id: String(doc._id),
        role: doc.role,
        company: doc.company,
        startDate: doc.startDate ? new Date(doc.startDate).toISOString() : "",
        endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
        bullets: doc.bullets || [],
        techStack: doc.techStack || [],
        order: doc.order || 0,
      })),
      projects: projects.map((doc) => ({
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
      })),
      skills: skills.map((doc) => ({
        id: String(doc._id),
        categoryName: doc.categoryName,
        order: doc.order || 0,
        skills: (doc.skills || []).map((s: any) => ({
          name: s.name,
          proficiency: s.proficiency || 0,
          iconKey: s.iconKey || "",
        })),
      })),
      education: education.map((doc) => ({
        id: String(doc._id),
        degree: doc.degree,
        institution: doc.institution,
        year: doc.year,
        highlights: doc.highlights || [],
      })),
      achievements: achievements.map((doc) => ({
        id: String(doc._id),
        title: doc.title,
        description: doc.description,
        date: doc.date ? new Date(doc.date).toISOString() : "",
        imageUrl: doc.imageUrl || "",
        order: doc.order || 0,
      })),
      certifications: certifications.map((doc) => ({
        id: String(doc._id),
        title: doc.title,
        provider: doc.provider,
        date: doc.date ? new Date(doc.date).toISOString() : "",
        credentialUrl: doc.credentialUrl || "",
        imageUrl: doc.imageUrl || "",
        order: doc.order || 0,
      })),
      timeline: timelineEntries.map((doc) => ({
        id: String(doc._id),
        category: doc.category,
        role: doc.role,
        company: doc.company || "",
        startDate: doc.startDate ? new Date(doc.startDate).toISOString() : "",
        endDate: doc.endDate ? new Date(doc.endDate).toISOString() : null,
        description: doc.description || "",
        link: doc.link || "",
        order: doc.order || 0,
      })),
    });
  } catch (error) {
    console.error("[portfolio-data] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    await connectDB();

    // 1. Update AboutMe
    if (body.aboutMe) {
      await AboutMe.findOneAndUpdate({}, body.aboutMe, { upsert: true, new: true });
    }

    // Helper for smart upserts
    const performUpserts = async (
      Model: mongoose.Model<any>,
      items: any[],
    ) => {
      const activeIds: string[] = [];
      for (const item of items) {
        const { id, ...data } = item;
        if (id && mongoose.Types.ObjectId.isValid(id)) {
          await Model.findByIdAndUpdate(id, data);
          activeIds.push(id);
        } else {
          const doc = await Model.create(data);
          activeIds.push(String(doc._id));
        }
      }
      // Delete any documents not provided in payload
      await Model.deleteMany({ _id: { $nin: activeIds } });
    };

    // 2. Experience
    if (Array.isArray(body.experience)) {
      await performUpserts(Experience, body.experience);
    }

    // 3. Projects
    if (Array.isArray(body.projects)) {
      await performUpserts(Project, body.projects);
    }

    // 4. Skills (SkillCategory)
    if (Array.isArray(body.skills)) {
      await performUpserts(SkillCategory, body.skills);
    }

    // 5. Education
    if (Array.isArray(body.education)) {
      await performUpserts(Education, body.education);
    }

    // 6. Achievements
    if (Array.isArray(body.achievements)) {
      await performUpserts(Achievement, body.achievements);
    }

    // 7. Certifications
    if (Array.isArray(body.certifications)) {
      await performUpserts(Certification, body.certifications);
    }

    // 8. Timeline
    if (Array.isArray(body.timeline)) {
      await performUpserts(TimelineEntry, body.timeline);
    }

    return NextResponse.json({ message: "Portfolio updated successfully" });
  } catch (error) {
    console.error("[portfolio-data] POST failed:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio data" },
      { status: 500 },
    );
  }
}
