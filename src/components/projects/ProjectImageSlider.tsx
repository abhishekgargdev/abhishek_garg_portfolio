"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectImageSliderProps = {
  images: string[];
  title: string;
};

export function ProjectImageSlider({ images, title }: ProjectImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = images.length;
  const current = images[index] ?? images[0];

  const go = (direction: -1 | 1) => {
    if (count < 2) return;
    setIndex((prev) => (prev + direction + count) % count);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, count]);

  if (!count) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 font-mono text-sm text-muted-foreground">
        {title}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="relative aspect-[16/9] w-full bg-muted">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={current}
                alt={`${title} screenshot ${index + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70"
          >
            <Expand className="size-3.5" />
            View
          </button>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                aria-label="Next image"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index ? "w-6 bg-white" : "w-1.5 bg-white/50",
                    )}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="flex gap-2 overflow-x-auto border-t border-border bg-muted/20 p-3">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2",
                  i === index
                    ? "border-teal-500"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setLightbox(false)}
            >
              <X className="size-6" />
            </button>
            <div
              className="relative flex w-full max-w-5xl flex-1 items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {count > 1 ? (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-0 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-7" />
                </button>
              ) : null}
              <div className="relative h-[72vh] w-full">
                <Image
                  src={current}
                  alt={`${title} full size`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              {count > 1 ? (
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-0 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-7" />
                </button>
              ) : null}
            </div>
            <p className="mt-3 font-mono text-sm text-white/60">
              {index + 1} / {count}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
