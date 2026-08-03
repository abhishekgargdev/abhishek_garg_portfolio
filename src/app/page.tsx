import { CareerJourney } from "@/components/sections/CareerJourney";
import { Hero } from "@/components/sections/Hero";
import { StatsCounters } from "@/components/sections/StatsCounters";
import { getAboutMe } from "@/lib/about";
import { getStats } from "@/lib/stats";
import { getTimelineEntries } from "@/lib/timeline";

export default async function Home() {
  const [about, timeline, stats] = await Promise.all([
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
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <Hero about={about} />
      <StatsCounters stats={stats} />
      <CareerJourney entries={timeline} />
      {/* Scroll target for Hero "Contact Me" — full Contact section lands here later */}
      <section id="contact" aria-label="Contact" className="scroll-mt-20" />
    </main>
  );
}
