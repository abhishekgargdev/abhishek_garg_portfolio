import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { exchangeCodeForToken, fetchLinkedInProfile } from "@/lib/linkedin";
import LinkedInAccount from "@/models/LinkedInAccount";
import AboutMe from "@/models/AboutMe";
import Experience from "@/models/Experience";
import Education from "@/models/Education";
import Project from "@/models/Project";
import SkillCategory from "@/models/SkillCategory";
import Achievement from "@/models/Achievement";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Retrieve site base URL (protocol + host)
  const baseUrl = new URL(request.url).origin;

  if (error) {
    console.error("[api/accounts/linkedin/callback] LinkedIn returned OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${baseUrl}/admin/linkedin?error=${error}&msg=${encodeURIComponent(errorDescription || "User denied access.")}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/admin/linkedin?error=missing_code&msg=${encodeURIComponent("No authorization code provided.")}`,
    );
  }

  try {
    await connectDB();

    // 1. Exchange code for access token
    const { accessToken, expiresIn } = await exchangeCodeForToken(code);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 2. Fetch local data to help generate realistic profile defaults
    const [about, experiences, education, projects, skills, achievements] = await Promise.all([
      AboutMe.findOne().lean(),
      Experience.find().sort({ startDate: -1 }).lean(),
      Education.find().lean(),
      Project.find().lean(),
      SkillCategory.find().lean(),
      Achievement.find().lean(),
    ]);

    // Parse data to match typings
    const typedAbout = about ? (about as any) : null;
    const typedExperiences = experiences.map((exp: any) => ({
      ...exp,
      _id: String(exp._id),
    }));
    const typedEducation = education.map((edu: any) => ({
      ...edu,
      _id: String(edu._id),
    }));
    const typedProjects = projects.map((proj: any) => ({
      ...proj,
      _id: String(proj._id),
    }));
    const typedSkills = skills.map((cat: any) => ({
      ...cat,
      _id: String(cat._id),
    }));
    const typedAchievements = achievements.map((ach: any) => ({
      ...ach,
      _id: String(ach._id),
    }));

    // 3. Fetch LinkedIn profile
    const profile = await fetchLinkedInProfile(
      accessToken,
      typedAbout,
      typedExperiences,
      typedEducation,
      typedProjects,
      typedSkills,
      typedAchievements,
    );

    // 4. Save/update the LinkedIn account model
    await LinkedInAccount.findOneAndUpdate(
      {},
      {
        accessToken,
        expiresAt,
        isConnected: true,
        profile,
      },
      { upsert: true, new: true },
    );

    return NextResponse.redirect(`${baseUrl}/admin/linkedin?connected=true`);

  } catch (err) {
    console.error("[api/accounts/linkedin/callback] Token exchange or profile fetch failed:", err);
    const msg = err instanceof Error ? err.message : "Internal authentication error";
    return NextResponse.redirect(
      `${baseUrl}/admin/linkedin?error=token_exchange_failed&msg=${encodeURIComponent(msg)}`,
    );
  }
}
