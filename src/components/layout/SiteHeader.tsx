"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const SITE_NAV = [
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
] as const;

function scrollToSection(id: string, reduceMotion: boolean) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function SiteHeader() {
  const [activeId, setActiveId] = useState<string>("about");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sections = SITE_NAV.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let bestId = "about";
        let bestRatio = -1;
        for (const item of SITE_NAV) {
          const ratio = ratios.get(item.id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = item.id;
          }
        }

        if (bestRatio > 0) {
          setActiveId(bestId);
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleNav = (id: string) => {
    setActiveId(id);
    setMobileOpen(false);
    scrollToSection(id, reduceMotion);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:px-10">
        <a
          href="#about"
          onClick={(event) => {
            event.preventDefault();
            handleNav("about");
          }}
          className="shrink-0 text-sm font-semibold tracking-tight text-foreground"
        >
          Abhishek Garg
        </a>

        <NavigationMenu className="hidden max-w-none flex-1 justify-end lg:flex">
          <NavigationMenuList className="flex-wrap justify-end gap-0.5">
            {SITE_NAV.map((item) => (
              <NavigationMenuItem key={item.id}>
                <NavigationMenuLink
                  href={`#${item.id}`}
                  active={activeId === item.id}
                  aria-current={activeId === item.id ? "location" : undefined}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "h-8 px-2 text-xs",
                    activeId === item.id && "bg-muted text-foreground",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    handleNav(item.id);
                  }}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-sm" className="lg:hidden" />}
            >
              <Menu className="size-4" />
              <span className="sr-only">Open navigation</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[16rem] p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle>Navigate</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {SITE_NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={cn(
                      buttonVariants({
                        variant: activeId === item.id ? "secondary" : "ghost",
                        size: "sm",
                      }),
                      "justify-start",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-3 justify-start",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  Admin login
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
