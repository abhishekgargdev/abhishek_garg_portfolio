"use client";

import { useState } from "react";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ResumeFieldAiDialogProps = {
  open: boolean;
  fieldName: string;
  currentValue: string | string[];
  onClose: () => void;
  onApply: (value: string | string[]) => void;
};

export function ResumeFieldAiDialog({
  open,
  fieldName,
  currentValue,
  onClose,
  onApply,
}: ResumeFieldAiDialogProps) {
  const [instruction, setInstruction] = useState(
    "Optimize this field for ATS-friendliness and professional tone. Use strong action verbs, concrete metrics where appropriate, and keep it natural and human-written.",
  );
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | string[] | null>(null);

  const generate = async () => {
    setGenerating(true);
    setSuggestion(null);
    try {
      const response = await fetch("/api/admin/portfolio-data/optimize-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldName,
          currentValue,
          instruction,
        }),
      });
      const data = (await response.json()) as {
        suggestedValue?: string | string[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestion");
      }
      setSuggestion(data.suggestedValue ?? null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate suggestion",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setSuggestion(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="gap-4 sm:max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 text-lg font-bold">
            <Brain className="size-5 text-teal-600 dark:text-teal-400" />
            AI Resume Optimizer
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400">
            Enhance <strong>{fieldName}</strong> with ATS-friendly, professional
            copy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Value
            </span>
            <div className="max-h-36 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-muted/30 p-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              {Array.isArray(currentValue) ? (
                <ul className="list-inside list-disc space-y-0.5">
                  {currentValue.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                currentValue
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="resume-ai-instruction"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Instructions
            </label>
            <textarea
              id="resume-ai-instruction"
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              disabled={generating}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 p-2.5 text-xs focus:border-teal-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {suggestion ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                AI Recommendation
              </span>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-teal-200 dark:border-teal-900/50 bg-teal-50/20 dark:bg-teal-950/20 p-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                {Array.isArray(suggestion) ? (
                  <ul className="list-inside list-disc space-y-0.5">
                    {suggestion.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  suggestion
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={generate}
            disabled={generating || !instruction.trim()}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {generating ? "Optimizing..." : "Generate"}
          </Button>
          {suggestion ? (
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                onApply(suggestion);
                handleClose();
                toast.success("Applied AI suggestion");
              }}
            >
              Apply
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
