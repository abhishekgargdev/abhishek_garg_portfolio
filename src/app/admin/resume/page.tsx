import { ResumePreview } from "@/components/resume/ResumePreview";
import { buttonVariants } from "@/components/ui/button";
import { getResumeData } from "@/lib/resume-data";
import { cn } from "@/lib/utils";

export default async function AdminResumePage() {
  const data = await getResumeData().catch((error) => {
    console.error("[admin/resume] Failed to load resume data:", error);
    return null;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live PDF preview generated from your current portfolio data. Edit{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">
              ResumeTemplate.tsx
            </code>{" "}
            to refine layout.
          </p>
        </div>
        <a
          href="/api/resume/download"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Download PDF
        </a>
      </div>

      {data ? (
        <ResumePreview data={data} />
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
          Unable to load resume data. Check your database connection and try
          again.
        </div>
      )}
    </div>
  );
}
