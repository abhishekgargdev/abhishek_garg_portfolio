"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Award, GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CertificationData } from "@/lib/certifications";
import { SiCoursera, SiUdemy, SiDocker, SiGoogle } from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { SectionHeading } from "@/components/layout/SectionHeading";

type CertificationsProps = {
  items: CertificationData[];
};

const providerThemes = {
  aws: {
    icon: FaAws,
    badge: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400",
  },
  udemy: {
    icon: SiUdemy,
    badge: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/50 dark:bg-pink-950/40 dark:text-pink-400",
  },
  coursera: {
    icon: SiCoursera,
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
  },
  google: {
    icon: SiGoogle,
    badge: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-400",
  },
  docker: {
    icon: SiDocker,
    badge: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-400",
  },
  default: {
    icon: Award,
    badge: "border-border bg-muted/50 text-foreground/80",
  },
};

function getCertTheme(provider: string, title: string) {
  const prov = provider.toLowerCase();
  const t = title.toLowerCase();

  if (prov.includes("aws") || prov.includes("amazon")) return providerThemes.aws;
  if (prov.includes("udemy")) return providerThemes.udemy;
  if (prov.includes("coursera")) return providerThemes.coursera;
  if (prov.includes("google")) return providerThemes.google;
  if (t.includes("docker") || t.includes("kubernetes") || prov.includes("kubernetes")) return providerThemes.docker;
  if (prov.includes("great learning") || prov.includes("simplilearn") || prov.includes("chandigarh")) {
    return {
      icon: GraduationCap,
      badge: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-400",
    };
  }

  return providerThemes.default;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Certifications({ items }: CertificationsProps) {
  const reduceMotion = useReducedMotion();

  if (!items.length) {
    return null;
  }

  return (
    <section
      id="certifications"
      aria-labelledby="certifications-heading"
      className="relative scroll-mt-20 bg-background py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Credentials"
          title="Certifications"
          description="Verified learning and professional credentials."
        />

        <motion.div
          className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => {
            const theme = getCertTheme(item.provider, item.title);
            const Icon = theme.icon;

            return (
              <motion.div
                key={item.id}
                variants={reduceMotion ? undefined : itemVariants}
              >
                <Card className="group relative h-full flex flex-col justify-between overflow-hidden border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-foreground/20">
                  {/* Subtle CSS shine sweep line */}
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

                  <CardHeader className="gap-3.5 pb-3">
                    <span className={cn("flex size-11 items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-105", theme.badge)}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {item.title}
                      </CardTitle>
                      <p className="text-xs font-semibold tracking-wide text-teal-600 uppercase">
                        {item.provider}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="mt-auto pb-4">
                    <p className="text-xs text-muted-foreground">
                      Issued {formatDate(item.date)}
                    </p>
                  </CardContent>

                  {item.credentialUrl ? (
                    <CardFooter className="pt-2.5 pb-3 border-t border-border/50 bg-muted/10">
                      <Link
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                      >
                        View Credential
                        <ExternalLink className="size-3" />
                      </Link>
                    </CardFooter>
                  ) : null}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Certifications;
