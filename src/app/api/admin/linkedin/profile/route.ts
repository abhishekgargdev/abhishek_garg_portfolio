import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import LinkedInAccount from "@/models/LinkedInAccount";
import AboutMe from "@/models/AboutMe";
import Experience from "@/models/Experience";
import Education from "@/models/Education";
import Project from "@/models/Project";
import SkillCategory from "@/models/SkillCategory";
import Achievement from "@/models/Achievement";
import { compareProfileWithPortfolio } from "@/lib/linkedin";
import { syncOnCreate, syncOnUpdate, reconcileDatabase } from "@/lib/sync";
import { askGeminiJson } from "@/lib/gemini";

export const runtime = "nodejs";

// GET — Retrieve LinkedIn connection status and differences for all sections
export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const account = await LinkedInAccount.findOne();

    if (!account || !account.isConnected) {
      return NextResponse.json({ isConnected: false });
    }

    // Check expiration
    if (new Date() > account.expiresAt) {
      account.isConnected = false;
      await account.save();
      return NextResponse.json({ isConnected: false, reason: "session_expired" });
    }

    // Load all local profile data
    const [about, experiences, education, projects, skills, achievements] = await Promise.all([
      AboutMe.findOne(),
      Experience.find().sort({ startDate: -1 }),
      Education.find(),
      Project.find().sort({ order: 1 }),
      SkillCategory.find().sort({ order: 1 }),
      Achievement.find().sort({ date: -1 }),
    ]);

    const comparison = compareProfileWithPortfolio(account.profile, {
      about,
      experiences,
      education,
      projects,
      skills,
      achievements,
    });

    return NextResponse.json({
      isConnected: true,
      profile: account.profile,
      hasMismatches: comparison.hasMismatches,
      mismatches: comparison.mismatches,
      lastSyncedAt: account.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[api/admin/linkedin/profile] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load LinkedIn profile status." },
      { status: 500 },
    );
  }
}

// PUT — Sync LinkedIn data to the Portfolio (modular or bulk)
export async function PUT(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "all";

    await connectDB();
    const account = await LinkedInAccount.findOne();

    if (!account || !account.isConnected) {
      return NextResponse.json({ error: "LinkedIn account not connected." }, { status: 400 });
    }

    const { profile } = account;

    // 1. Sync AboutMe
    if (section === "all" || section === "about") {
      let about = await AboutMe.findOne();
      if (!about) {
        about = new AboutMe({
          name: profile.name,
          title: profile.headline,
          bio: profile.bio,
          email: profile.email || "developer@example.com",
        });
        await about.save();
        await syncOnCreate("about", about);
      } else {
        about.name = profile.name;
        about.title = profile.headline;
        about.bio = profile.bio;
        if (profile.email) about.email = profile.email;
        await about.save();
        await syncOnUpdate("about", about._id, about);
      }
    }

    // 2. Sync Experiences
    if (section === "all" || section === "experience") {
      for (const exp of profile.experiences) {
        const match = await Experience.findOne({
          company: { $regex: new RegExp(`^${exp.company.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
          role: { $regex: new RegExp(`^${exp.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
        });

        const startDate = exp.startDate ? new Date(exp.startDate) : new Date();
        const endDate = exp.endDate ? new Date(exp.endDate) : null;

        if (match) {
          match.description = exp.description;
          match.startDate = startDate;
          match.endDate = endDate;
          await match.save();
          await syncOnUpdate("experience", match._id, match);
        } else {
          const created = await Experience.create({
            role: exp.title,
            company: exp.company,
            startDate,
            endDate,
            description: exp.description,
            bullets: [],
            techStack: [],
            order: 0,
          });
          await syncOnCreate("experience", created);
        }
      }
    }

    // 3. Sync Education
    if (section === "all" || section === "education") {
      for (const edu of profile.education) {
        // Clean degree name from honors tags for comparisons
        const cleanDegree = edu.degree.replace(/\s*\(with honors\)/i, "").trim();
        const match = await Education.findOne({
          institution: { $regex: new RegExp(`^${edu.institution.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
          degree: { $regex: new RegExp(`^${cleanDegree.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
        });

        if (match) {
          match.year = edu.year;
          match.highlights = edu.highlights;
          await match.save();
          await syncOnUpdate("education", match._id, match);
        } else {
          const created = await Education.create({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year,
            highlights: edu.highlights,
          });
          await syncOnCreate("education", created);
        }
      }
    }

    // 4. Sync Projects
    if (section === "all" || section === "projects") {
      for (const proj of profile.projects) {
        const match = await Project.findOne({
          title: { $regex: new RegExp(`^${proj.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
        });

        if (match) {
          match.description = proj.description;
          match.techStack = proj.techStack;
          if (proj.liveUrl) match.liveUrl = proj.liveUrl;
          if (proj.githubUrl) match.githubUrl = proj.githubUrl;
          await match.save();
          await syncOnUpdate("projects", match._id, match);
        } else {
          const slug = proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const created = await Project.create({
            title: proj.title,
            slug,
            description: proj.description,
            techStack: proj.techStack,
            liveUrl: proj.liveUrl,
            githubUrl: proj.githubUrl,
            bullets: [],
            imageUrl: "",
            order: 0,
          });
          await syncOnCreate("projects", created);
        }
      }
    }

    // 5. Sync Skills
    if (section === "all" || section === "skills") {
      // Find a Technical Skills category, or create one if none exist
      let category = await SkillCategory.findOne();
      if (!category) {
        category = await SkillCategory.create({
          categoryName: "Technical Skills",
          skills: [],
          order: 0,
        });
      }

      for (const skill of profile.skills) {
        // Check if skill exists in any category
        const exists = await SkillCategory.exists({
          "skills.name": { $regex: new RegExp(`^${skill.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
        });

        if (!exists) {
          category.skills.push({
            name: skill.name,
            proficiency: 80,
            iconKey: skill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          });
        }
      }
      await category.save();
      await syncOnUpdate("skills", category._id, category);
    }

    // 6. Sync Achievements (Honors & Awards)
    if (section === "all" || section === "achievements") {
      for (const ach of profile.achievements) {
        const cleanTitle = ach.title.replace(/\s*\(gold medalist\)/i, "").trim();
        const match = await Achievement.findOne({
          title: { $regex: new RegExp(`^${cleanTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") },
        });

        const date = ach.date ? new Date(ach.date) : new Date();

        if (match) {
          match.description = ach.description;
          match.date = date;
          await match.save();
          await syncOnUpdate("achievements", match._id, match);
        } else {
          const created = await Achievement.create({
            title: ach.title,
            description: ach.description,
            date,
            imageUrl: "",
            order: 0,
          });
          await syncOnCreate("achievements", created);
        }
      }
    }

    // Reconcile changes
    await reconcileDatabase();

    account.updatedAt = new Date();
    await account.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/linkedin/profile] PUT failed:", error);
    return NextResponse.json(
      { error: "Failed to sync LinkedIn data to Portfolio." },
      { status: 500 },
    );
  }
}

// POST — Handle profile updates (simulations) & share posts & AI optimization
export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { action, message, section, fieldName, localValue, remoteValue, instruction } = body;

    await connectDB();
    const account = await LinkedInAccount.findOne();

    if (!account || !account.isConnected) {
      return NextResponse.json({ error: "LinkedIn account not connected." }, { status: 400 });
    }

    // 1. UGC Post Share Action
    if (action === "post_share") {
      if (!message?.trim()) {
        return NextResponse.json({ error: "Share message is required." }, { status: 400 });
      }

      try {
        let personUrn = "urn:li:person:unknown";
        const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${account.accessToken}` },
        });
        if (userInfoResponse.ok) {
          const userData = await userInfoResponse.json();
          if (userData.sub) {
            personUrn = `urn:li:person:${userData.sub}`;
          }
        }

        const shareResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author: personUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text: message,
                },
                shareMediaCategory: "NONE",
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        });

        const shareData = await shareResponse.json();
        if (shareResponse.ok) {
          return NextResponse.json({
            success: true,
            postId: shareData.id,
            msg: "Successfully posted share to LinkedIn!",
          });
        }
      } catch (err) {
        console.warn("[linkedin] ugcPost failed, falling back to simulation.", err);
      }

      return NextResponse.json({
        success: true,
        simulated: true,
        msg: "Successfully shared post to LinkedIn! (Simulated fallback)",
      });
    }

    // 2. Sync Portfolio to LinkedIn Action (updates cache to match local MongoDB)
    if (action === "sync_portfolio_to_linkedin") {
      const syncSection = section || "all";

      const [about, experiences, education, projects, skills, achievements] = await Promise.all([
        AboutMe.findOne(),
        Experience.find().sort({ startDate: -1 }),
        Education.find(),
        Project.find(),
        SkillCategory.find(),
        Achievement.find(),
      ]);

      if (syncSection === "all" || syncSection === "about") {
        if (about) {
          account.profile.name = about.name;
          account.profile.headline = about.title;
          account.profile.bio = about.bio;
        }
      }

      if (syncSection === "all" || syncSection === "experience") {
        account.profile.experiences = experiences.map((exp) => ({
          title: exp.role,
          company: exp.company,
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : null,
          description: exp.description || "",
        }));
      }

      if (syncSection === "all" || syncSection === "education") {
        account.profile.education = education.map((edu) => ({
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          highlights: edu.highlights || [],
        }));
      }

      if (syncSection === "all" || syncSection === "projects") {
        account.profile.projects = projects.map((proj) => ({
          title: proj.title,
          description: proj.description || "",
          techStack: proj.techStack || [],
          liveUrl: proj.liveUrl || "",
          githubUrl: proj.githubUrl || "",
        }));
      }

      if (syncSection === "all" || syncSection === "skills") {
        account.profile.skills = skills
          .flatMap((cat) => cat.skills || [])
          .map((s) => ({ name: s.name }));
      }

      if (syncSection === "all" || syncSection === "achievements") {
        account.profile.achievements = achievements.map((ach) => ({
          title: ach.title,
          description: ach.description || "",
          date: ach.date ? new Date(ach.date).toISOString().slice(0, 10) : "",
        }));
      }

      await account.save();

      return NextResponse.json({
        success: true,
        simulated: true,
        msg: `LinkedIn profile cache updated successfully for section "${syncSection}".`,
      });
    }

    // 3. AI Mismatch Optimizer Action
    if (action === "optimize_mismatch") {
      if (!fieldName || !localValue || !remoteValue) {
        return NextResponse.json({ error: "Missing optimization parameters." }, { status: 400 });
      }

      const prompt = `You are an expert technical resume writer and ATS optimization copywriter.
A mismatch was detected between the local Portfolio database and the remote LinkedIn profile for the field "${fieldName}".

Local Portfolio Value:
"${JSON.stringify(localValue, null, 2)}"

LinkedIn Profile Value:
"${JSON.stringify(remoteValue, null, 2)}"

User Guidelines / Instructions:
"${instruction || "Merge the best parts of both summaries, maintaining a professional and human tone, and formatting it cleanly."}"

Please generate an optimized, combined, and polished version of the value.
If the input was an array of bullet points or strings, return an array of strings in suggestedValue. If the input was a single string, return a single string in suggestedValue.

Return valid JSON matching this schema:
{
  "suggestedValue": "the optimized string or array of strings"
}`;

      const { data } = await askGeminiJson<{ suggestedValue: string | string[] }>({
        purpose: "linkedin-mismatch-optimize",
        prompt,
        systemInstruction: "You are a professional resume copywriter. Output JSON matching the schema.",
        temperature: 0.45,
      });

      return NextResponse.json({ suggestedValue: data.suggestedValue });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("[api/admin/linkedin/profile] POST failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to perform LinkedIn action." },
      { status: 502 },
    );
  }
}

// DELETE — Disconnect LinkedIn integration
export async function DELETE() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    await LinkedInAccount.deleteMany({});
    return NextResponse.json({ success: true, msg: "Disconnected LinkedIn account successfully." });
  } catch (error) {
    console.error("[api/admin/linkedin/profile] DELETE failed:", error);
    return NextResponse.json(
      { error: "Failed to disconnect LinkedIn account." },
      { status: 500 },
    );
  }
}
