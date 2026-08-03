"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SESSION_KEY = "portfolio-splash-seen";
const MIN_DURATION_MS = 1800;
const MAX_DURATION_MS = 2500;

function waitForResources(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SplashLoaderProps = {
  children: React.ReactNode;
};

export function SplashLoader({ children }: SplashLoaderProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const skipSplash =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/offline");

  const [showSplash, setShowSplash] = useState(!skipSplash);
  const [animateExit, setAnimateExit] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (skipSplash) {
      setShowSplash(false);
      return;
    }

    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadySeen) {
      setAnimateExit(false);
      setShowSplash(false);
      return;
    }

    let cancelled = false;
    const duration = prefersReducedMotion
      ? 400
      : MIN_DURATION_MS +
        Math.floor(Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS + 1));

    void (async () => {
      await Promise.all([delay(duration), waitForResources()]);
      if (cancelled) return;

      sessionStorage.setItem(SESSION_KEY, "1");
      setAnimateExit(!prefersReducedMotion);
      setShowSplash(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [prefersReducedMotion, skipSplash]);

  const useStaticImage = Boolean(prefersReducedMotion) || videoFailed;

  return (
    <>
      {children}

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-zinc-950"
            initial={false}
            exit={
              animateExit
                ? { opacity: 0, scale: prefersReducedMotion ? 1 : 1.04 }
                : { opacity: 0, scale: 1 }
            }
            transition={
              animateExit && !prefersReducedMotion
                ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0 }
            }
            role="status"
            aria-label="Loading"
            aria-live="polite"
          >
            <div className="relative flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52">
              {useStaticImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/loader-image.png"
                  alt=""
                  className="h-full w-full rounded-full object-cover shadow-2xl shadow-black/40"
                />
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/loader-image.png"
                  className="h-full w-full rounded-full object-cover shadow-2xl shadow-black/40"
                  onError={() => setVideoFailed(true)}
                >
                  <source src="/loader-video.mp4" type="video/mp4" />
                </video>
              )}
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/abhishek_garg_icon.png"
              alt=""
              className={
                prefersReducedMotion
                  ? "h-8 w-8 rounded-md opacity-70 sm:h-9 sm:w-9"
                  : "h-8 w-8 animate-pulse rounded-md opacity-70 sm:h-9 sm:w-9"
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SplashLoader;
