"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion, motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Download, Mail } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FloatingTechIcons } from "@/components/sections/FloatingTechIcons";
import { TypewriterTaglines } from "@/components/sections/TypewriterTaglines";
import { DEFAULT_HERO_TAGLINES } from "@/lib/about-taglines";
import type { AboutMeData } from "@/lib/about";
import { cn } from "@/lib/utils";

type HeroProps = {
  about: AboutMeData | null;
  /** Admin preview: same layout, non-navigating actions. */
  preview?: boolean;
};

function findSocialUrl(
  links: AboutMeData["socialLinks"],
  platform: string,
): string | undefined {
  const match = links.find((link) =>
    link.platform.toLowerCase().includes(platform.toLowerCase()),
  );
  return match?.url;
}

function FloatingBlobs({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-16 size-[28rem] rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute -right-20 bottom-10 size-[24rem] rounded-full bg-teal-100/25 blur-3xl" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute -left-24 top-10 size-[28rem] rounded-full bg-sky-200/25 blur-3xl"
        animate={{ x: [0, 36, 0], y: [0, 28, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-0 size-[26rem] rounded-full bg-teal-100/25 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -24, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/3 size-40 rounded-full bg-muted-foreground/20 blur-2xl"
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -16, 12, 0],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Hero({ about, preview = false }: HeroProps) {
  const reduceMotion = useReducedMotion();

  const name = about?.name || "Abhishek Garg";
  const title = about?.title || "Full Stack Developer";
  const taglines =
    about?.taglines?.filter((line) => line.trim()) ?? DEFAULT_HERO_TAGLINES;
  const profileImage = about?.profileImageUrl || "/abhishek_garg.png";
  const socialLinks = about?.socialLinks ?? [];
  const githubUrl = findSocialUrl(socialLinks, "github");
  const linkedinUrl = findSocialUrl(socialLinks, "linkedin");

  const scrollToContact = () => {
    if (preview) return;
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  return (
    <section
      id={preview ? undefined : "about"}
      className={cn(
        "relative flex items-center overflow-hidden bg-background",
        preview ? "min-h-[100svh]" : "scroll-mt-20 min-h-[100svh]",
      )}
      aria-label="Hero"
    >
      <FloatingBlobs reduceMotion={reduceMotion} />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:gap-12 sm:px-6 sm:py-24 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <motion.p
            className="mb-3 text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            {title}
          </motion.p>

          <motion.h1
            className="font-heading max-w-2xl text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {name}
          </motion.h1>

          <div className="mt-5">
            <TypewriterTaglines taglines={taglines} />
          </div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
          >
            {preview ? (
              <span
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full min-w-0 sm:w-auto sm:min-w-40 bg-gradient-to-r from-teal-600 to-sky-600 shadow-md sm:pointer-events-none",
                )}
              >
                <Download data-icon="inline-start" />
                Download Resume
              </span>
            ) : (
              <a
                href="/api/resume/download"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full min-w-0 sm:w-auto sm:min-w-40 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-lg",
                )}
              >
                <Download data-icon="inline-start" />
                Download Resume
              </a>
            )}

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full min-w-0 border-border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:bg-muted/50 hover:shadow-md sm:w-auto sm:min-w-40"
              onClick={scrollToContact}
              disabled={preview}
            >
              <Mail data-icon="inline-start" />
              Contact Me
            </Button>
          </motion.div>

          {(githubUrl || linkedinUrl) && (
            <motion.div
              className="mt-8 flex items-center gap-3"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              {githubUrl ? (
                preview ? (
                  <span
                    aria-label="GitHub"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80"
                  >
                    <FaGithub className="size-5" />
                  </span>
                ) : (
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 transition-all duration-300 hover:scale-110 hover:border-zinc-800 hover:bg-zinc-950 hover:text-white"
                  >
                    <FaGithub className="size-5" />
                  </Link>
                )
              ) : null}
              {linkedinUrl ? (
                preview ? (
                  <span
                    aria-label="LinkedIn"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80"
                  >
                    <FaLinkedin className="size-5" />
                  </span>
                ) : (
                  <Link
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 transition-all duration-300 hover:scale-110 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                  >
                    <FaLinkedin className="size-5" />
                  </Link>
                )
              ) : null}
            </motion.div>
          )}
        </div>

        <motion.div
          className="order-1 flex justify-center items-center lg:order-2 lg:justify-end"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="group relative flex items-center justify-center size-[18rem] sm:size-[22rem] md:size-[24rem] lg:size-[28rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            {!reduceMotion && (
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-teal-500 via-sky-500 to-indigo-500 opacity-20 blur-2xl transition duration-1000 group-hover:opacity-35 group-hover:duration-200" />
            )}

            {!reduceMotion && (
              <>
                {/* Orbit Path 1 */}
                <motion.div
                  className="absolute border border-dashed border-muted-foreground/20 rounded-full pointer-events-none size-[112%]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                {/* Orbit Path 2 */}
                <motion.div
                  className="absolute border border-dotted border-muted-foreground/15 rounded-full pointer-events-none size-[124%]"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}

            <FloatingTechIcons reduceMotion={reduceMotion} />

            <motion.div
              className="relative z-10 aspect-square w-full overflow-hidden rounded-full border-4 border-card shadow-[0_20px_50px_-20px_rgba(24,24,27,0.45)]"
              animate={reduceMotion ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={profileImage}
                alt={name}
                fill
                priority={!preview}
                sizes="(max-width: 1024px) 80vw, 400px"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-transparent"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
