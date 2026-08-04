"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion, motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Download, Mail, Code2, Terminal, Cloud, Cpu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AboutMeData } from "@/lib/about";

type HeroProps = {
  about: AboutMeData | null;
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

function DriftingShapes({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute left-[10%] top-[20%] opacity-[0.06] dark:opacity-[0.08]"
        animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Code2 className="size-10 text-teal-600 dark:text-teal-400" />
      </motion.div>
      <motion.div
        className="absolute right-[15%] top-[15%] opacity-[0.06] dark:opacity-[0.08]"
        animate={{ y: [0, 25, 0], rotate: [0, -20, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <Terminal className="size-12 text-indigo-600 dark:text-indigo-400" />
      </motion.div>
      <motion.div
        className="absolute left-[15%] bottom-[20%] opacity-[0.05] dark:opacity-[0.08]"
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Cloud className="size-14 text-sky-600 dark:text-sky-400" />
      </motion.div>
      <motion.div
        className="absolute right-[12%] bottom-[25%] opacity-[0.05] dark:opacity-[0.08]"
        animate={{ y: [0, -25, 0], rotate: [0, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Cpu className="size-10 text-emerald-600 dark:text-emerald-400" />
      </motion.div>
    </div>
  );
}

function AnimatedTagline({
  text,
  reduceMotion,
}: {
  text: string;
  reduceMotion: boolean | null;
}) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (reduceMotion) {
    return (
      <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {text}
      </p>
    );
  }

  return (
    <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="mr-[0.3em] inline-block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.35 + index * 0.045,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
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
        animate={{ x: [0, 20, -10, 0], y: [0, -16, 12, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Hero({ about }: HeroProps) {
  const reduceMotion = useReducedMotion();

  const name = about?.name || "Abhishek Garg";
  const title = about?.title || "Full Stack Developer";
  const tagline =
    about?.tagline ||
    "Building thoughtful web experiences with clean code and clear craft.";
  const profileImage =
    about?.profileImageUrl || "/abhishek_garg.png";
  const socialLinks = about?.socialLinks ?? [];
  const githubUrl = findSocialUrl(socialLinks, "github");
  const linkedinUrl = findSocialUrl(socialLinks, "linkedin");

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  return (
    <section
      id="about"
      className="relative scroll-mt-20 flex min-h-[100svh] items-center overflow-hidden bg-background"
      aria-label="Hero"
    >
      <FloatingBlobs reduceMotion={reduceMotion} />
      <DriftingShapes reduceMotion={reduceMotion} />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 sm:gap-12 sm:px-6 sm:py-24 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-28">
        {/* Copy */}
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
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {name}
          </motion.h1>

          <div className="mt-5">
            <AnimatedTagline text={tagline} reduceMotion={reduceMotion} />
          </div>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
          >
            <a
              href="/api/resume/download"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full min-w-0 sm:w-auto sm:min-w-40 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]",
              )}
            >
              <Download data-icon="inline-start" />
              Download Resume
            </a>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full min-w-0 border-border bg-card/80 backdrop-blur-sm sm:w-auto sm:min-w-40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-muted/50"
              onClick={scrollToContact}
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
                <Link
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 transition-all duration-300 hover:scale-110 hover:bg-zinc-950 hover:text-white hover:border-zinc-800"
                >
                  <FaGithub className="size-5" />
                </Link>
              ) : null}
              {linkedinUrl ? (
                <Link
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white hover:border-blue-500"
                >
                  <FaLinkedin className="size-5" />
                </Link>
              ) : null}
            </motion.div>
          )}
        </div>

        {/* Portrait */}
        <motion.div
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative group w-full max-w-sm sm:max-w-md lg:max-w-lg">
            {/* Soft glowing gradient behind the photo */}
            {!reduceMotion && (
              <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-tr from-teal-500 via-sky-500 to-indigo-500 opacity-20 blur-xl transition duration-1000 group-hover:opacity-35 group-hover:duration-200" />
            )}
            
            <motion.div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-40px_rgba(24,24,27,0.55)] border border-border"
              animate={reduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={profileImage}
                alt={name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 480px"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
