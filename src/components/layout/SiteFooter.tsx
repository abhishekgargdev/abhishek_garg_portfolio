"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import type { AboutMeData } from "@/lib/about";

type SiteFooterProps = {
  about: AboutMeData | null;
};

export function SiteFooter({ about }: SiteFooterProps) {
  const name = about?.name || "Abhishek Garg";
  const title = about?.title || "Senior Full Stack Engineer";
  const currentYear = new Date().getFullYear();

  const socialLinks = about?.socialLinks ?? [];
  const github = socialLinks.find((link) => link.platform.toLowerCase().includes("github"))?.url;
  const linkedin = socialLinks.find((link) => link.platform.toLowerCase().includes("linkedin"))?.url;
  const email = about?.email || "abhishekgarg2063@gmail.com";

  const navItems = [
    { href: "#about", label: "About" },
    { href: "#journey", label: "Journey" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#beyond", label: "Beyond the Code" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <footer className="relative border-t border-border/80 bg-background py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16">
          {/* Logo & Bio Column */}
          <div className="space-y-4">
            <Link
              href="#about"
              className="text-lg font-bold tracking-tight text-foreground transition-colors hover:text-sky-600 dark:hover:text-sky-400"
            >
              {name}
            </Link>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground/80">
              A passionate engineer crafting scalable, high-performance web applications and AI-integrated solutions.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Connect
            </h4>
            <p className="text-sm text-muted-foreground/80">
              Feel free to reach out for collaborations or inquiries.
            </p>
            <div className="flex items-center gap-3">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-zinc-800 hover:bg-zinc-950 hover:text-white"
                >
                  <FaGithub className="size-4" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                >
                  <FaLinkedin className="size-4" />
                </a>
              )}
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-teal-500 hover:bg-teal-600 hover:text-white"
              >
                <FaEnvelope className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground/60">
          <p>© {currentYear} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
