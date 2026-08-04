export const dynamic = "force-dynamic";

import { Achievements } from "@/components/sections/Achievements";
import { CareerJourney } from "@/components/sections/CareerJourney";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { StatsCounters } from "@/components/sections/StatsCounters";
import { WorkExperience } from "@/components/sections/WorkExperience";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FadeInSection } from "@/components/motion/FadeInSection";
import { getAboutMe } from "@/lib/about";
import { getAchievements } from "@/lib/achievements";
import { getCertifications } from "@/lib/certifications";
import { getEducationRecords } from "@/lib/education";
import { getExperienceRecords } from "@/lib/experience";
import { getProjects } from "@/lib/projects";
import { getSkillCategories } from "@/lib/skills";
import { getStats } from "@/lib/stats";
import { getTimelineEntries } from "@/lib/timeline";

export default async function Home() {
  const [
    about,
    timeline,
    stats,
    education,
    experience,
    projects,
    skills,
    achievements,
    certifications,
  ] = await Promise.all([
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
    getAchievements().catch((error) => {
      console.error("[home] Failed to load Achievements:", error);
      return [] as Awaited<ReturnType<typeof getAchievements>>;
    }),
    getCertifications().catch((error) => {
      console.error("[home] Failed to load Certifications:", error);
      return [] as Awaited<ReturnType<typeof getCertifications>>;
    }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero about={about} />
        <FadeInSection>
          <StatsCounters stats={stats} />
        </FadeInSection>
        <FadeInSection>
          <CareerJourney entries={timeline} />
        </FadeInSection>
        <FadeInSection>
          <WorkExperience items={experience} />
        </FadeInSection>
        <FadeInSection>
          <Education items={education} />
        </FadeInSection>
        <FadeInSection>
          <Projects projects={projects} />
        </FadeInSection>
        <FadeInSection>
          <Skills categories={skills} />
        </FadeInSection>
        <FadeInSection>
          <Achievements items={achievements} />
        </FadeInSection>
        <FadeInSection>
          <Certifications items={certifications} />
        </FadeInSection>
        <FadeInSection>
          <Contact />
        </FadeInSection>
      </main>
    </>
  );
}
