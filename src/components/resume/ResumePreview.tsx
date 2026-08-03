"use client";

import dynamic from "next/dynamic";
import type { ResumeData } from "@/lib/resume-data";
import { ResumeTemplate } from "@/components/resume/ResumeTemplate";
import { SectionLoader } from "@/components/loader/SectionLoader";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-xl border border-zinc-200 bg-white">
        <SectionLoader variant="text" count={2} className="w-full max-w-md px-6" />
      </div>
    ),
  },
);

type ResumePreviewProps = {
  data: ResumeData;
};

export function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm">
      <PDFViewer
        width="100%"
        height="75vh"
        showToolbar
        style={{ border: "none", minHeight: "70vh" }}
      >
        <ResumeTemplate data={data} />
      </PDFViewer>
    </div>
  );
}

export default ResumePreview;
