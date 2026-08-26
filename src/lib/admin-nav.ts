import type { LucideIcon } from "lucide-react";
import {
  Award,
  Brain,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Route,
  Sparkles,
  Timer,
  Trophy,
  UserRound,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ai-assistant", label: "AI Assistant", icon: Brain },
  { href: "/admin/linkedin", label: "LinkedIn Connect", icon: FaLinkedin },
  { href: "/admin/about", label: "About", icon: UserRound },

  { href: "/admin/experience-clocks", label: "Experience Clocks", icon: Timer },
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

