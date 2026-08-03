import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import AboutMe from "@/models/AboutMe";
import Achievement from "@/models/Achievement";
import Certification from "@/models/Certification";
import ContactMessage from "@/models/ContactMessage";
import Education from "@/models/Education";
import Experience from "@/models/Experience";
import Project from "@/models/Project";
import SkillCategory from "@/models/SkillCategory";
import TimelineEntry from "@/models/TimelineEntry";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();

    const [
      projects,
      unreadMessages,
      messages,
      experience,
      education,
      skills,
      achievements,
      certifications,
      timeline,
      about,
    ] = await Promise.all([
      Project.countDocuments(),
      ContactMessage.countDocuments({ isRead: false }),
      ContactMessage.countDocuments(),
      Experience.countDocuments(),
      Education.countDocuments(),
      SkillCategory.countDocuments(),
      Achievement.countDocuments(),
      Certification.countDocuments(),
      TimelineEntry.countDocuments(),
      AboutMe.countDocuments(),
    ]);

    return NextResponse.json({
      stats: {
        projects,
        unreadMessages,
        messages,
        experience,
        education,
        skills,
        achievements,
        certifications,
        timeline,
        about,
      },
    });
  } catch (error) {
    console.error("[admin/stats] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
