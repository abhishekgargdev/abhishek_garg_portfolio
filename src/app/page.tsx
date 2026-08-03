import { CareerJourney } from "@/components/sections/CareerJourney";
import { Education } from "@/components/sections/Education";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { StatsCounters } from "@/components/sections/StatsCounters";
import { WorkExperience } from "@/components/sections/WorkExperience";
import { getAboutMe } from "@/lib/about";
import { getEducationRecords } from "@/lib/education";
import { getExperienceRecords } from "@/lib/experience";
import { getProjects } from "@/lib/projects";
import { getSkillCategories } from "@/lib/skills";
import { getStats } from "@/lib/stats";
import { getTimelineEntries } from "@/lib/timeline";

export default async function Home() {
  const [about, timeline, stats, education, experience, projects, skills] =
    await Promise.all([
      getAboutMe().catch((error) => {
        console.error("[home] Failed to load AboutMe:", error);
        return null;
      }),
      getTimelineEntries().catch((error) => {
        console.error("[home] Failed to load TimelineEntry:", error);
        return [] as Awaited<ReturnType<typeof getTimelineEntries>>;
      }),
      getStats().catch((error) => {
        console.error("[home] Failed to load Stats:", error);
        return [] as Awaited<ReturnType<typeof getStats>>;
      }),
      getEducationRecords().catch((error) => {
        console.error("[home] Failed to load Education:", error);
        return [] as Awaited<ReturnType<typeof getEducationRecords>>;
      }),
      getExperienceRecords().catch((error) => {
        console.error("[home] Failed to load Experience:", error);
        return [] as Awaited<ReturnType<typeof getExperienceRecords>>;
      }),
      getProjects().catch((error) => {
        console.error("[home] Failed to load Projects:", error);
        return [] as Awaited<ReturnType<typeof getProjects>>;
      }),
      getSkillCategories().catch((error) => {
        console.error("[home] Failed to load SkillCategories:", error);
        return [] as Awaited<ReturnType<typeof getSkillCategories>>;
      }),
    ]);

  return (
    <main className="flex flex-1 flex-col">
      <Hero about={about} />
      <StatsCounters stats={stats} />
      <CareerJourney entries={timeline} />
      <WorkExperience items={experience} />
      <Education items={education} />
      <Projects projects={projects} />
      <Skills categories={skills} />
      {/* Scroll target for Hero "Contact Me" — full Contact section lands here later */}
      <section id="contact" aria-label="Contact" className="scroll-mt-20" />
    </main>
  );
}
