"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DEFAULT_HERO_TAGLINES } from "@/lib/about-taglines";
import { cn } from "@/lib/utils";

type TypewriterTaglinesProps = {
  taglines: string[];
  className?: string;
};

export function TypewriterTaglines({
  taglines,
  className,
}: TypewriterTaglinesProps) {
  const reduceMotion = useReducedMotion();
  const items = useMemo(() => {
    const cleaned = taglines.map((line) => line.trim()).filter(Boolean);
    return cleaned.length ? cleaned : DEFAULT_HERO_TAGLINES;
  }, [taglines]);

  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const currentLine = items[lineIndex % items.length] ?? items[0] ?? "";

  useEffect(() => {
    setLineIndex(0);
    setText("");
    setDeleting(false);
  }, [items.join("\u0001")]);

  useEffect(() => {
    if (reduceMotion) return;

    const typingSpeed = deleting ? 22 : 36;
    const pauseAtEnd = 2000;
    const pauseBetweenLines = 500;

    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === currentLine) {
      timeout = setTimeout(() => setDeleting(true), pauseAtEnd);
    } else if (deleting && text === "") {
      timeout = setTimeout(() => {
        setDeleting(false);
        setLineIndex((index) => (index + 1) % items.length);
      }, pauseBetweenLines);
    } else {
      timeout = setTimeout(() => {
        setText(
          deleting
            ? currentLine.slice(0, Math.max(0, text.length - 1))
            : currentLine.slice(0, text.length + 1),
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, currentLine, items.length, reduceMotion]);

  if (reduceMotion) {
    return (
      <p
        className={cn(
          "max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg",
          className,
        )}
      >
        {items[0]}
      </p>
    );
  }

  return (
    <p
      className={cn(
        "max-w-xl min-h-[3.25rem] text-base leading-relaxed text-muted-foreground sm:min-h-[3.75rem] sm:text-lg",
        className,
      )}
      aria-live="polite"
    >
      <span>{text}</span>
      <motion.span
        className="ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.12em] bg-teal-500"
        animate={{ opacity: [1, 0.2] }}
        transition={{ duration: 0.75, repeat: Infinity, repeatType: "reverse" }}
        aria-hidden
      />
    </p>
  );
}

export default TypewriterTaglines;
