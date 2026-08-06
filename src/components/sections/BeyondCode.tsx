"use client";

import Image from "next/image";
import { useReducedMotion, motion } from "framer-motion";
import {
  Brain,
  Users,
  Code,
  Sparkles,
  Heart,
  Music,
  Compass,
  HelpCircle,
} from "lucide-react";
import type { AboutMeData } from "@/lib/about";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { cn } from "@/lib/utils";

// Mapping string icon keys to Lucide React components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  users: Users,
  code: Code,
  sparkles: Sparkles,
  heart: Heart,
  music: Music,
  compass: Compass,
};

function getTraitIcon(key: string) {
  const normalizedKey = key.toLowerCase().trim();
  return ICON_MAP[normalizedKey] || HelpCircle;
}

type BeyondCodeProps = {
  about: AboutMeData | null;
};

export function BeyondCode({ about }: BeyondCodeProps) {
  const reduceMotion = useReducedMotion();

  const bio =
    about?.beyondCodeBio ||
    "Outside the digital realm of databases, servers, and components, I am passionate about exploring things that keep me creative, active, and grounded. Whether it is solving logical mathematics puzzles, diving into scientific blogs, or sharing knowledge with the dev community, I find joy in continuous discovery.";
  const imageUrl =
    about?.beyondCodeImageUrl ||
    "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop";
  const traits = about?.beyondCodeTraits || [
    {
      title: "Problem Solving",
      description: "Applying logical thinking and analytical skills to resolve complex architectural challenges.",
      icon: "Brain",
    },
    {
      title: "Collaboration",
      description: "Fostering productive team environments and aligning stakeholder visions.",
      icon: "Users",
    },
    {
      title: "Clean Code",
      description: "Writing self-documenting, maintainable, and test-driven implementations.",
      icon: "Code",
    },
    {
      title: "Continuous Learning",
      description: "Constantly upgrading my tech stack and learning emerging AI technologies.",
      icon: "Sparkles",
    },
  ];

  return (
    <section
      id="beyond"
      aria-labelledby="beyond-code-heading"
      className="relative scroll-mt-20 overflow-hidden bg-background py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Interests"
          title="Beyond the Code"
          description="What keeps me driven, creative, and curious outside of software engineering."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-center">
          {/* Left Column: Image Container */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-md md:aspect-[4/3] lg:max-w-md lg:justify-self-center"
          >
            <Image
              src={imageUrl}
              alt="Beyond the Code workspace or interest showcase"
              fill
              sizes="(max-width: 1024px) 90vw, 450px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </motion.div>

          {/* Right Column: Content & Traits Grid */}
          <div className="space-y-8">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base leading-relaxed text-muted-foreground"
            >
              {bio}
            </motion.p>

            <div className="grid gap-4 sm:grid-cols-2">
              {traits.map((trait, index) => {
                const Icon = getTraitIcon(trait.icon);
                return (
                  <motion.div
                    key={trait.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{
                      duration: 0.5,
                      delay: reduceMotion ? 0 : index * 0.08,
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -4, transition: { duration: 0.2 } }
                    }
                    className="group flex flex-col rounded-xl border border-border bg-card/50 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-teal-500/30 hover:shadow-md hover:shadow-teal-500/[0.02]"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {trait.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {trait.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeyondCode;
