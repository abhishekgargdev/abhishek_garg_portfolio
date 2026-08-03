import type { ComponentType, SVGProps } from "react";
import {
  SiAnthropic,
  SiCss,
  SiCypress,
  SiDjango,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFirebase,
  SiFlask,
  SiFramer,
  SiGit,
  SiGithubactions,
  SiGo,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiKubernetes,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRedux,
  SiRust,
  SiSass,
  SiSupabase,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVitest,
  SiVuedotjs,
} from "react-icons/si";
import {
  Code2,
  Database,
  Server,
  TestTube2,
  Brain,
  Cloud,
  type LucideProps,
} from "lucide-react";

export type SkillIconProps = SVGProps<SVGSVGElement> & {
  className?: string;
  size?: string | number;
};

type IconComponent = ComponentType<SkillIconProps | LucideProps>;

const SKILL_ICON_MAP: Record<string, IconComponent> = {
  // Languages
  typescript: SiTypescript,
  ts: SiTypescript,
  javascript: SiJavascript,
  js: SiJavascript,
  python: SiPython,
  go: SiGo,
  golang: SiGo,
  rust: SiRust,
  html: SiHtml5,
  html5: SiHtml5,
  css: SiCss,
  sass: SiSass,
  scss: SiSass,

  // Frontend
  react: SiReact,
  reactjs: SiReact,
  next: SiNextdotjs,
  nextjs: SiNextdotjs,
  nextdotjs: SiNextdotjs,
  vue: SiVuedotjs,
  vuejs: SiVuedotjs,
  vuedotjs: SiVuedotjs,
  redux: SiRedux,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  framer: SiFramer,
  framermotion: SiFramer,

  // Backend
  node: SiNodedotjs,
  nodejs: SiNodedotjs,
  nodedotjs: SiNodedotjs,
  express: SiExpress,
  expressjs: SiExpress,
  nest: SiNestjs,
  nestjs: SiNestjs,
  django: SiDjango,
  flask: SiFlask,
  fastapi: SiFastapi,
  graphql: SiGraphql,
  prisma: SiPrisma,
  server: Server,

  // Databases
  mongodb: SiMongodb,
  mongo: SiMongodb,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  mysql: SiMysql,
  redis: SiRedis,
  firebase: SiFirebase,
  supabase: SiSupabase,
  database: Database,

  // DevOps
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  git: SiGit,
  githubactions: SiGithubactions,
  linux: SiLinux,
  cloud: Cloud,

  // AI / ML
  tensorflow: SiTensorflow,
  anthropic: SiAnthropic,
  ai: Brain,
  ml: Brain,
  brain: Brain,

  // Testing
  jest: SiJest,
  vitest: SiVitest,
  cypress: SiCypress,
  testing: TestTube2,
  test: TestTube2,
};

export function normalizeSkillIconKey(iconKey: string): string {
  return iconKey.toLowerCase().replace(/[\s._+/-]/g, "");
}

export function getSkillIcon(iconKey: string): IconComponent {
  const normalized = normalizeSkillIconKey(iconKey);
  return SKILL_ICON_MAP[normalized] ?? Code2;
}
