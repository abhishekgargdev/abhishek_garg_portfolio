"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducedMotion, motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Download, Mail } from "lucide-react";
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
      className="relative scroll-mt-20 flex min-h-[100svh] items-center overflow-hidden bg-muted/50"
      aria-label="Hero"
    >
      <FloatingBlobs reduceMotion={reduceMotion} />

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
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
          >
            <a
              href="/api/resume/download"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full min-w-0 sm:w-auto sm:min-w-40",
              )}
            >
              <Download data-icon="inline-start" />
              Download Resume
            </a>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full min-w-0 border-border bg-card/80 backdrop-blur-sm sm:w-auto sm:min-w-40"
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
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
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
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
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
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-40px_rgba(24,24,27,0.55)] sm:max-w-md lg:max-w-lg">
            <Image
              src={profileImage}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 480px"
              className="object-cover object-top"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
