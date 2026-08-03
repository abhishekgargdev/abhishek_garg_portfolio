"use client";

import dynamic from "next/dynamic";
import type { ResumeData } from "@/lib/resume-types";
import { SectionLoader } from "@/components/loader/SectionLoader";

const ResumePdfClient = dynamic(
  () =>
    import("@/components/resume/ResumePdfClient").then(
      (mod) => mod.ResumePdfClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-xl border border-border bg-card">
        <SectionLoader
          variant="text"
          count={2}
          className="w-full max-w-md px-6"
        />
      </div>
    ),
  },
);

type ResumePreviewProps = {
  data: ResumeData;
};

export function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
      <ResumePdfClient data={data} />
    </div>
  );
}

export default ResumePreview;
