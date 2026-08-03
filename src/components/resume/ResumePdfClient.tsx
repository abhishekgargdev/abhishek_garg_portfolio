"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { ResumeTemplate } from "@/components/resume/ResumeTemplate";
import type { ResumeData } from "@/lib/resume-types";

type ResumePdfClientProps = {
  data: ResumeData;
};

export function ResumePdfClient({ data }: ResumePdfClientProps) {
  return (
    <PDFViewer
      width="100%"
      height="75vh"
      showToolbar
      style={{ border: "none", minHeight: "70vh" }}
    >
      <ResumeTemplate data={data} />
    </PDFViewer>
  );
}

export default ResumePdfClient;
