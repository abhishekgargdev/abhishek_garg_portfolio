import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Route,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "About", icon: UserRound },
  { href: "/admin/timeline", label: "Timeline", icon: Route },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/resume", label: "Resume", icon: FileText },
];
