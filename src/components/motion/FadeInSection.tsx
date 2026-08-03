"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type FadeInSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Fraction of element that must be visible (0–1). */
  amount?: number;
  as?: "div" | "section";
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function FadeInSection({
  children,
  className,
  delay = 0,
  amount = 0.18,
  as = "div",
}: FadeInSectionProps) {
  const reduceMotion = useReducedMotion();
  const Component = as === "section" ? motion.section : motion.div;

  return (
    <Component
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </Component>
  );
}

export default FadeInSection;
