"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  FolderKanban,
  GraduationCap,
  MessageSquare,
  Route,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { SectionLoader } from "@/components/loader/SectionLoader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminStats = {
  projects: number;
  unreadMessages: number;
  messages: number;
  experience: number;
  education: number;
  skills: number;
  achievements: number;
  certifications: number;
  timeline: number;
  about: number;
};

const STAT_CARDS: {
  key: keyof AdminStats;
  label: string;
  href: string;
  icon: typeof FolderKanban;
}[] = [
  { key: "projects", label: "Projects", href: "/admin/projects", icon: FolderKanban },
  {
    key: "unreadMessages",
    label: "Unread messages",
    href: "/admin/messages",
    icon: MessageSquare,
  },
  { key: "experience", label: "Experience roles", href: "/admin/experience", icon: Briefcase },
  { key: "education", label: "Education", href: "/admin/education", icon: GraduationCap },
  { key: "skills", label: "Skill categories", href: "/admin/skills", icon: Sparkles },
  { key: "achievements", label: "Achievements", href: "/admin/achievements", icon: Trophy },
  { key: "certifications", label: "Certifications", href: "/admin/certifications", icon: Award },
  { key: "timeline", label: "Timeline entries", href: "/admin/timeline", icon: Route },
  { key: "about", label: "About profiles", href: "/admin/about", icon: UserRound },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = (await response.json()) as {
          stats?: AdminStats;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || "Failed to load stats");
        }
        if (!cancelled) setStats(data.stats ?? null);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load stats",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick overview of your portfolio content.
          </p>
        </div>
        <Link
          href="/admin/messages"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          View messages
        </Link>
      </div>

      {loading || !stats ? (
        <SectionLoader variant="card" count={6} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.key} href={card.href} className="block">
                <Card className="h-full transition-colors hover:ring-zinc-300">
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div>
                      <CardDescription>{card.label}</CardDescription>
                      <CardTitle className="mt-1 text-3xl tabular-nums">
                        {stats[card.key]}
                      </CardTitle>
                    </div>
                    <span className="flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
                      <Icon className="size-4 text-zinc-700" />
                    </span>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
