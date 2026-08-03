import { Hero } from "@/components/sections/Hero";
import { getAboutMe } from "@/lib/about";

export default async function Home() {
  const about = await getAboutMe().catch((error) => {
    console.error("[home] Failed to load AboutMe:", error);
    return null;
  });

  return (
    <main className="flex flex-1 flex-col">
      <Hero about={about} />
      {/* Scroll target for Hero "Contact Me" — full Contact section lands here later */}
      <section id="contact" aria-label="Contact" className="scroll-mt-20" />
    </main>
  );
}
