"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CertificationData } from "@/lib/certifications";

type CertificationsProps = {
  items: CertificationData[];
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function providerInitials(provider: string): string {
  return provider
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
      className="relative bg-zinc-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Credentials
          </p>
          <h2
            id="certifications-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            Certifications
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:text-lg">
            Verified learning and professional credentials.
          </p>
        </div>

        <motion.ul
          className="mt-12 divide-y divide-zinc-200/80 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 shadow-sm sm:mt-14"
          variants={reduceMotion ? undefined : containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => (
            <motion.li
              key={item.id}
              variants={reduceMotion ? undefined : itemVariants}
              className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
            >
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold tracking-wide text-zinc-700"
                  aria-hidden
                >
                  {providerInitials(item.provider) || "C"}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold tracking-tight text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {item.provider}
                    <span className="mx-2 text-zinc-300" aria-hidden>
                      ·
                    </span>
                    <span>{formatDate(item.date)}</span>
                  </p>
                </div>
              </div>

              {item.credentialUrl ? (
                <Link
                  href={item.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0 self-start sm:self-center",
                  )}
                >
                  View Credential
                  <ExternalLink data-icon="inline-end" />
                </Link>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

export default Certifications;
