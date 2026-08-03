"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ExperienceData } from "@/lib/experience";

type WorkExperienceProps = {
  items: ExperienceData[];
};

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatMonthYear(startDate);
  if (!endDate) return `${start} — Present`;
  return `${start} — ${formatMonthYear(endDate)}`;
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function WorkExperience({ items }: WorkExperienceProps) {
  if (!items.length) {
    return null;
  }

  const defaultOpenId = items[0]?.id;

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative bg-zinc-50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Work
          </p>
          <h2
            id="experience-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            Experience
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:text-lg">
            Roles, impact, and the tools used along the way.
          </p>
        </div>

        <Accordion
          defaultValue={defaultOpenId ? [defaultOpenId] : []}
          className="mt-12 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 shadow-sm backdrop-blur-sm sm:mt-14 sm:px-5"
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-zinc-200/80">
              <AccordionTrigger className="py-4 hover:no-underline sm:py-5">
                <div className="pr-4">
                  <p className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
                    {item.role}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    {item.company}
                    <span className="mx-2 text-zinc-300" aria-hidden>
                      ·
                    </span>
                    <span className="font-normal text-zinc-500">
                      {formatDateRange(item.startDate, item.endDate)}
                    </span>
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-5">
                {item.bullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2.5 text-sm leading-relaxed text-zinc-600"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-400"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.techStack.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default WorkExperience;
