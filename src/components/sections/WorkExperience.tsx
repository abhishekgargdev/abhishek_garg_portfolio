"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ExperienceData } from "@/lib/experience";
import { getSkillIcon } from "@/lib/skill-icons";
import { SectionHeading } from "@/components/layout/SectionHeading";

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
      className="relative scroll-mt-20 bg-muted/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-10">
        <SectionHeading
          eyebrow="Work"
          title="Experience"
          description="Roles, impact, and the tools used along the way."
        />

        <Accordion
          defaultValue={defaultOpenId ? [defaultOpenId] : []}
          className="mt-12 rounded-2xl border border-border bg-card/80 px-4 shadow-sm backdrop-blur-sm sm:mt-14 sm:px-5"
        >
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-border border-l-2 border-l-transparent data-[state=open]:border-l-teal-500 data-[open]:border-l-teal-500 transition-all duration-300 pl-2 sm:pl-4"
            >
              <AccordionTrigger className="py-4 hover:no-underline sm:py-5">
                <div className="pr-4">
                  <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {item.role}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {item.company}
                    <span className="mx-2 text-muted-foreground/40" aria-hidden>
                      ·
                    </span>
                    <span className="font-normal text-muted-foreground">
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
                        className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.techStack.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.techStack.map((tech) => {
                      const Icon = getSkillIcon(tech);
                      return (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1">
                          <Icon className="size-3.5" />
                          {tech}
                        </Badge>
                      );
                    })}
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
