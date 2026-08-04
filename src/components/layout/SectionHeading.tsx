"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

const headingContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const headingItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={cn("mx-auto max-w-2xl text-center", className)}>
        <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("mx-auto max-w-2xl text-center", className)}
      variants={headingContainerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.p
        className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase"
        variants={headingItemVariants}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        variants={headingItemVariants}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          className="mt-3 text-base text-muted-foreground sm:text-lg"
          variants={headingItemVariants}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

export default SectionHeading;
