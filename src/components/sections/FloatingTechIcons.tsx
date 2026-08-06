"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  SiDocker,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { cn } from "@/lib/utils";

type TechIcon = {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  iconClass: string;
  glowClass: string;
  position: string;
  size: "sm" | "md" | "lg";
  floatDuration: number;
  floatDelay: number;
  y: number[];
  x?: number[];
  rotate?: number[];
};

const TECH_ORBIT: TechIcon[] = [
  {
    key: "react",
    label: "React",
    Icon: SiReact,
    iconClass: "text-[#61DAFB]",
    glowClass: "bg-[#61DAFB]/35",
    position: "-left-3 top-[8%] sm:-left-5 lg:-left-8",
    size: "lg",
    floatDuration: 5.5,
    floatDelay: 0,
    y: [0, -14, 0],
    rotate: [0, 8, -6, 0],
  },
  {
    key: "next",
    label: "Next.js",
    Icon: SiNextdotjs,
    iconClass: "text-foreground",
    glowClass: "bg-foreground/15",
    position: "-right-2 top-[12%] sm:-right-4 lg:-right-7",
    size: "md",
    floatDuration: 6.2,
    floatDelay: 0.4,
    y: [0, 12, 0],
    x: [0, 6, 0],
  },
  {
    key: "typescript",
    label: "TypeScript",
    Icon: SiTypescript,
    iconClass: "text-[#3178C6]",
    glowClass: "bg-[#3178C6]/30",
    position: "-left-4 top-[38%] sm:-left-6 lg:-left-10",
    size: "md",
    floatDuration: 7,
    floatDelay: 0.8,
    y: [0, -10, 0],
    x: [0, -5, 0],
  },
  {
    key: "node",
    label: "Node.js",
    Icon: SiNodedotjs,
    iconClass: "text-[#339933]",
    glowClass: "bg-[#339933]/30",
    position: "-right-4 top-[40%] sm:-right-6 lg:-right-9",
    size: "lg",
    floatDuration: 5.8,
    floatDelay: 0.2,
    y: [0, 16, 0],
    rotate: [0, -10, 6, 0],
  },
  {
    key: "mongodb",
    label: "MongoDB",
    Icon: SiMongodb,
    iconClass: "text-[#47A248]",
    glowClass: "bg-[#47A248]/30",
    position: "-left-2 bottom-[28%] sm:-left-5 lg:-left-8",
    size: "sm",
    floatDuration: 6.5,
    floatDelay: 1.1,
    y: [0, -12, 0],
  },
  {
    key: "docker",
    label: "Docker",
    Icon: SiDocker,
    iconClass: "text-[#2496ED]",
    glowClass: "bg-[#2496ED]/30",
    position: "-right-3 bottom-[24%] sm:-right-5 lg:-right-8",
    size: "md",
    floatDuration: 7.4,
    floatDelay: 0.6,
    y: [0, 10, 0],
    x: [0, 4, 0],
  },
  {
    key: "tailwind",
    label: "Tailwind CSS",
    Icon: SiTailwindcss,
    iconClass: "text-[#06B6D4]",
    glowClass: "bg-[#06B6D4]/30",
    position: "left-[12%] -bottom-3 sm:-bottom-4",
    size: "sm",
    floatDuration: 5.2,
    floatDelay: 0.3,
    y: [0, -8, 0],
  },
  {
    key: "aws",
    label: "AWS",
    Icon: FaAws,
    iconClass: "text-[#FF9900]",
    glowClass: "bg-[#FF9900]/30",
    position: "right-[10%] -bottom-2 sm:-bottom-4",
    size: "md",
    floatDuration: 6.8,
    floatDelay: 1.4,
    y: [0, 9, 0],
    rotate: [0, 6, -4, 0],
  },
  {
    key: "postgres",
    label: "PostgreSQL",
    Icon: SiPostgresql,
    iconClass: "text-[#4169E1]",
    glowClass: "bg-[#4169E1]/30",
    position: "left-[42%] -top-3 sm:-top-4",
    size: "sm",
    floatDuration: 8,
    floatDelay: 0.9,
    y: [0, -11, 0],
  },
];

const SIZE_CLASS = {
  sm: "size-9 sm:size-10",
  md: "size-10 sm:size-11",
  lg: "size-11 sm:size-12",
} as const;

const ICON_SIZE = {
  sm: "size-4 sm:size-[1.15rem]",
  md: "size-[1.15rem] sm:size-5",
  lg: "size-5 sm:size-6",
} as const;

type FloatingTechIconsProps = {
  reduceMotion: boolean | null;
  className?: string;
};

export function FloatingTechIcons({
  reduceMotion,
  className,
}: FloatingTechIconsProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-20 hidden lg:block", className)}
    >
      {TECH_ORBIT.map((tech) => {
        const Icon = tech.Icon;

        return (
          <motion.div
            key={tech.key}
            className={cn("absolute", tech.position)}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: tech.y,
                    x: tech.x ?? [0, 0, 0],
                    rotate: tech.rotate ?? [0, 0, 0],
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.5, delay: tech.floatDelay * 0.2 },
                    scale: { duration: 0.5, delay: tech.floatDelay * 0.2 },
                    y: {
                      duration: tech.floatDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: tech.floatDelay,
                    },
                    x: {
                      duration: tech.floatDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: tech.floatDelay,
                    },
                    rotate: {
                      duration: tech.floatDuration * 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: tech.floatDelay,
                    },
                  }
            }
          >
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 -z-10 rounded-2xl blur-md",
                  tech.glowClass,
                )}
              />
              <div
                title={tech.label}
                className={cn(
                  "flex items-center justify-center rounded-2xl border border-white/60 bg-white/85 shadow-[0_12px_28px_-10px_rgba(24,24,27,0.5)] backdrop-blur-md",
                  "ring-1 ring-black/5 dark:border-white/10 dark:bg-zinc-900/85 dark:ring-white/10",
                  SIZE_CLASS[tech.size],
                )}
              >
                <Icon className={cn(ICON_SIZE[tech.size], tech.iconClass)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default FloatingTechIcons;
