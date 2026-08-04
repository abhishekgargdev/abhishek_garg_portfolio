"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export function VisualEffects() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Scroll Progress Bar */}
      {!reduceMotion && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 origin-left z-50"
          style={{ scaleX }}
        />
      )}

      {/* Floating Animated Background Blobs */}
      {!reduceMotion && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <motion.div
            className="absolute -left-20 top-1/4 size-[30rem] rounded-full bg-teal-200/10 blur-[100px] dark:bg-teal-500/[0.03]"
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -60, 40, 0],
              scale: [1, 1.15, 0.9, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute right-1/4 top-1/3 size-[28rem] rounded-full bg-sky-200/10 blur-[100px] dark:bg-sky-500/[0.03]"
            animate={{
              x: [0, -50, 30, 0],
              y: [0, 40, -50, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -right-20 bottom-1/4 size-[32rem] rounded-full bg-indigo-200/10 blur-[100px] dark:bg-indigo-500/[0.03]"
            animate={{
              x: [0, 30, -40, 0],
              y: [0, 50, -30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}
    </>
  );
}

export default VisualEffects;
