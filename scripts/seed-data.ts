/**
 * Seed MongoDB with portfolio content.
 *
 * Usage:
 *   npx tsx scripts/seed-data.ts
 *   npx tsx scripts/seed-data.ts --reset
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import mongoose from "mongoose";

import AboutMe from "../src/models/AboutMe";
import Achievement from "../src/models/Achievement";
import Certification from "../src/models/Certification";
import Education from "../src/models/Education";
import Experience from "../src/models/Experience";
import Project from "../src/models/Project";
import SkillCategory from "../src/models/SkillCategory";
import Stat from "../src/models/Stat";
import TimelineEntry from "../src/models/TimelineEntry";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const RESET = process.argv.includes("--reset");

const SEED = {
  aboutMe: {
    name: "Abhishek Garg",
    title:
      "Senior Full Stack Engineer | MERN | Next.js | Node.js | TypeScript",
    taglines: [
      "Building scalable, AI-powered web applications with modern full-stack architectures",
      "Leading full-stack teams to ship production-grade MERN and Next.js products",
      "Architecting microservices, real-time systems, and AI-powered applications",
      "Delivering measurable impact with 99.9% uptime and faster release cycles",
    ],
    bio: "Senior Full Stack Engineer with 4+ years of progressive experience designing and delivering scalable, production-grade web and mobile-adjacent applications using the MERN stack, Next.js, TypeScript, NestJS, Golang, and FastAPI. Proven track record leading cross-functional teams, owning client relationships, and architecting microservices, real-time systems, and AI-powered applications (OpenAI GPT-4, Anthropic Claude API). Delivered measurable impact including a 40% reduction in application load times, a 30% reduction in deployment time, and 99.9% uptime across client and enterprise systems. Recognized with multiple performance awards, including Outstanding Achiever and Valuable Contributor, at Talentelgia Technologies.",
    profileImageUrl: "",
    resumeFileUrl: "",
    portfolioUrl: "https://abhishekgarg.dev",
    openSourceContributions: [
      "Contributed bug fixes and performance improvements to React ecosystem UI component libraries.",
      "Published reusable npm utilities for API error handling and response normalization; open-sourced boilerplates for NestJS and FastAPI microservices on GitHub.",
    ],
    socialLinks: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/abhishek-garg-89b9611b3",
      },
      { platform: "GitHub", url: "https://github.com/Abhishek2063" },
    ],
    location: "Kaithal, Haryana, India (Open to Relocation)",
    phone: "+91-8708292063",
    email: "abhishekgarg2063@gmail.com",
    beyondCodeBio: "Outside the digital realm of databases, servers, and components, I am passionate about exploring things that keep me creative, active, and grounded. Whether it is solving logical mathematics puzzles, diving into scientific blogs, or sharing knowledge with the dev community, I find joy in continuous discovery.",
    beyondCodeImageUrl: "",
    beyondCodeTraits: [
      {
        title: "Problem Solving",
        description: "Applying logical thinking and analytical skills to resolve complex architectural challenges.",
        icon: "Brain",
      },
      {
        title: "Collaboration",
        description: "Fostering productive team environments and aligning stakeholder visions.",
        icon: "Users",
      },
      {
        title: "Clean Code",
        description: "Writing self-documenting, maintainable, and test-driven implementations.",
        icon: "Code",
      },
      {
        title: "Continuous Learning",
        description: "Constantly upgrading my tech stack and learning emerging AI technologies.",
        icon: "Sparkles",
      },
    ],
    stats: {
      yearsExperience: 4,
      projectsDelivered: 8,
      uptimePercent: 99.9,
      developersMentored: 6,
    },
  },

  timelineEntries: [
    {
      category: "experience" as const,
      role: "Senior AI Engineer",
      company: "Talentelgia Technologies",
      startDate: "2026-06-01",
      endDate: null as string | null,
      description:
        "Designing and developing AI-powered chatbot solutions handling ~8,000+ customer conversations per month, reducing response time by ~35%.",
      link: "",
      order: 1,
    },
    {
      category: "experience" as const,
      role: "Senior Software Engineer",
      company: "Talentelgia Technologies",
      startDate: "2026-01-01",
      endDate: "2026-05-31",
      description:
        "Built the backend for a real-time multiplayer gaming app (1,000+ concurrent players) and a healthcare data platform serving 2,000+ active users.",
      link: "",
      order: 2,
    },
    {
      category: "experience" as const,
      role: "Senior Software Engineer L1 (Promoted through 5 Levels)",
      company: "Talentelgia Technologies",
      startDate: "2022-01-01",
      endDate: "2025-12-31",
      description:
        "Progressed from Software Engineering Intern to Senior Software Engineer L1 over 4 years, leading teams of 3-5 engineers across multiple enterprise projects.",
      link: "",
      order: 3,
    },
    {
      category: "education" as const,
      role: "Master of Computer Applications (MCA)",
      company: "Chandigarh University",
      startDate: "2020-07-01",
      endDate: "2022-06-30",
      description:
        "Distinguished Guest Speaker and Shield of Honor recipient (2022). CUCAT Scholarship awardee; ranked in top 5 for innovative JARVIS AI project.",
      link: "",
      order: 4,
    },
    {
      category: "education" as const,
      role: "Bachelor of Arts in Mathematics",
      company: "Kurukshetra University",
      startDate: "2017-07-01",
      endDate: "2020-10-31",
      description:
        "2nd Rank Overall in B.A. program; 1st Rank in Mathematics at university level. Graduated with distinction.",
      link: "",
      order: 5,
    },
    {
      category: "achievement" as const,
      role: "Outstanding Achiever Award",
      company: "Talentelgia Technologies",
      startDate: "2025-01-01",
      endDate: "2025-01-01",
      description:
        "Recognized for exceptional technical contributions and high-impact project delivery.",
      link: "",
      order: 6,
    },
    {
      category: "achievement" as const,
      role: "Shield of Honor & Distinguished Guest Speaker",
      company: "Chandigarh University",
      startDate: "2022-06-01",
      endDate: "2022-06-01",
      description:
        "Distinguished Guest Speaker; awarded Shield of Honor and CUCAT Scholarship for academic excellence.",
      link: "",
      order: 7,
    },
    {
      category: "certificate" as const,
      role: "Docker & Kubernetes",
      company: "Chandigarh University",
      startDate: "2022-01-01",
      endDate: "2022-01-01",
      description:
        "Hands-on certification covering containerization, orchestration, and deployment workflows.",
      link: "",
      order: 8,
    },
    {
      category: "certificate" as const,
      role: "AWS CloudFormation",
      company: "Udemy",
      startDate: "2023-01-01",
      endDate: "2023-01-01",
      description:
        "Infrastructure as code with AWS CloudFormation for repeatable cloud deployments.",
      link: "",
      order: 9,
    },
  ],

  education: [
    {
      degree: "Master of Computer Applications (MCA)",
      institution: "Chandigarh University",
      year: "June 2022",
      highlights: [
        "Distinguished Guest Speaker and recipient of the Shield of Honor (2022)",
        "CUCAT Scholarship awardee for academic excellence",
        "Ranked in top 5 for innovative JARVIS AI project implementation",
      ],
    },
    {
      degree: "Bachelor of Arts in Mathematics",
      institution: "Kurukshetra University",
      year: "October 2020",
      highlights: [
        "2nd Rank Overall in B.A. program",
        "1st Rank in Mathematics at university level",
        "Graduated with distinction",
      ],
    },
  ],

  experience: [
    {
      role: "Senior AI Engineer",
      company: "Talentelgia Technologies",
      startDate: "2026-06-01",
      endDate: null as string | null,
      bullets: [
        "Design and develop AI-powered chatbot solutions handling ~8,000+ customer conversations per month, reducing average response time by ~35% and cutting repetitive query volume reaching human agents by ~25%.",
        "Collaborate with cross-functional stakeholders to align conversational AI flows and integrations with business and customer-experience goals, contributing to improved customer satisfaction scores.",
      ],
      techStack: ["AI Chatbots", "Conversational AI", "Prompt Engineering"],
      order: 1,
    },
    {
      role: "Senior Software Engineer",
      company: "Talentelgia Technologies",
      startDate: "2026-01-01",
      endDate: "2026-05-31",
      bullets: [
        "Built the backend for a real-time multiplayer gaming application supporting 1,000+ concurrent players, using AWS services, Node.js, Express.js, and PlayFab for matchmaking, live session management, and core game services; reduced average matchmaking time by ~20%.",
        "Developed a healthcare data platform (Node.js, Express.js, Python, RabbitMQ) serving 2,000+ active users to track fitness/nutrition, workouts, mindfulness, and recovery metrics; asynchronous processing via message queues improved data-sync throughput by ~30%.",
        "Implemented CI/CD pipeline standards and security best practices (JWT authentication, RBAC, input validation) across services, reducing deployment time by ~25%.",
      ],
      techStack: [
        "Node.js",
        "Express.js",
        "AWS",
        "PlayFab",
        "Python",
        "RabbitMQ",
        "JWT",
        "RBAC",
      ],
      order: 2,
    },
    {
      role: "Senior Software Engineer L1 (Promoted through 5 Levels)",
      company: "Talentelgia Technologies",
      startDate: "2022-01-01",
      endDate: "2025-12-31",
      bullets: [
        "Progressed from Software Engineering Intern to Senior Software Engineer L1 over 4 years, leading teams of 3-5 engineers and taking on full-stack development, team leadership, and direct client-handling responsibilities across multiple enterprise projects.",
        "Led a transportation and logistics management platform as full-stack developer, team lead, and client handler, using React.js and Redux Saga to track 500+ shipments/vehicles daily, improving data-tracking accuracy by ~30%.",
        "Directed development of an ammunition inventory management system for a defense-sector client, using Electron.js, React, Node.js, Express.js, MySQL, and Sequelize ORM to track 10,000+ inventory records, cutting manual reconciliation time by ~40%.",
        "Built a productivity add-on extending a popular workspace/collaboration tool, using Next.js, adopted by 1,000+ users, as sole full-stack developer.",
        "Contributed to a healthcare diagnostics and treatment platform built with Next.js and Golang, supporting 500+ patient records with improved workflow turnaround.",
        "Achieved a 40% reduction in application load times through Redis caching, database indexing, and code refactoring; integrated Stripe, Paddle, PayPal, and Razorpay across multiple SaaS products processing thousands of transactions monthly.",
        "Mentored 6+ junior and mid-level developers; established coding standards, TDD practices, and code review processes; delivered all sprint milestones on time with zero critical post-release defects.",
        "Earned Outstanding Achiever, IT Team Spirit of the Quarter, Valuable Contributor, and Bright Beginner awards.",
      ],
      techStack: [
        "React.js",
        "Redux Saga",
        "Electron.js",
        "Node.js",
        "Express.js",
        "MySQL",
        "Sequelize ORM",
        "Next.js",
        "Golang",
        "Redis",
        "Stripe",
        "Paddle",
        "PayPal",
        "Razorpay",
      ],
      order: 3,
    },
  ],

  projects: [
    {
      title: "PostForge AI",
      techStack: [
        "Next.js 14",
        "Node.js",
        "FastAPI",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "OpenAI GPT-4",
        "Anthropic Claude API",
        "AWS",
      ],
      description: "AI-powered content creation and scheduling SaaS platform.",
      bullets: [
        "Built an AI-powered content creation and scheduling SaaS platform integrating OpenAI GPT-4 and Anthropic Claude API via LangChain, with OAuth 2.0 (Passport.js) authentication and automated publishing.",
        "Designed a microservices architecture (Node.js/Express.js + FastAPI) with real-time scheduling (Socket.io, BullMQ) and tiered Stripe subscription billing with usage-based metering, cutting manual content-scheduling effort by ~50%.",
      ],
      liveUrl: "",
      githubUrl: "",
      imageUrl: "",
      order: 1,
    },
    {
      title: "HubSyncMaster",
      techStack: [
        "Next.js",
        "NestJS",
        "PostgreSQL",
        "BullMQ",
        "Redis",
        "Docker",
        "AWS",
        "WebSockets",
      ],
      description: "SaaS platform for CRM data synchronization.",
      bullets: [
        "Developed a SaaS platform for CRM data synchronization with RBAC, JWT authentication, and multi-tenant data isolation for enterprise clients.",
        "Built a real-time WebSocket sync-status dashboard, reducing customer support tickets related to sync visibility by ~30%.",
      ],
      liveUrl: "",
      githubUrl: "",
      imageUrl: "",
      order: 2,
    },
    {
      title: "CostEclipse",
      techStack: [
        "Next.js",
        "Node.js",
        "Express.js",
        "PostgreSQL",
        "Redis",
        "Socket.io",
        "Python",
      ],
      description: "Cross-platform financial tracking application.",
      bullets: [
        "Engineered a cross-platform financial tracking application with real-time notifications, multi-user collaboration, and analytics dashboards.",
        "Built a Python-based data aggregation microservice for financial summaries, reducing report-generation time by ~35% via Redis caching.",
      ],
      liveUrl: "",
      githubUrl: "",
      imageUrl: "",
      order: 3,
    },
    {
      title: "BudgetKeeper",
      techStack: [
        "FastAPI",
        "React.js",
        "Redux Saga",
        "PostgreSQL",
        "SQLAlchemy",
      ],
      description: "Expense tracking application.",
      bullets: [
        "Architected an expense tracking application achieving 99.9% uptime and a 40% reduction in data retrieval time via optimized PostgreSQL queries and Redux Saga async state management.",
      ],
      liveUrl: "",
      githubUrl: "",
      imageUrl: "",
      order: 4,
    },
  ],

  skillCategories: [
    {
      categoryName: "Languages",
      order: 1,
      skills: [
        { name: "JavaScript (ES6+)", iconKey: "javascript", proficiency: 95 },
        { name: "TypeScript", iconKey: "typescript", proficiency: 90 },
        { name: "Python", iconKey: "python", proficiency: 80 },
        { name: "Golang", iconKey: "go", proficiency: 70 },
        { name: "SQL", iconKey: "database", proficiency: 85 },
        { name: "C", iconKey: "c", proficiency: 60 },
        { name: "C++", iconKey: "cplusplus", proficiency: 60 },
      ],
    },
    {
      categoryName: "Frontend",
      order: 2,
      skills: [
        { name: "React.js", iconKey: "react", proficiency: 95 },
        { name: "Next.js", iconKey: "nextjs", proficiency: 95 },
        { name: "Redux Toolkit", iconKey: "redux", proficiency: 85 },
        { name: "Redux Thunk", iconKey: "redux", proficiency: 80 },
        { name: "Redux Saga", iconKey: "redux", proficiency: 85 },
        { name: "Electron.js", iconKey: "electron", proficiency: 75 },
        { name: "HTML5", iconKey: "html5", proficiency: 95 },
        { name: "CSS3", iconKey: "css3", proficiency: 90 },
        { name: "Tailwind CSS", iconKey: "tailwindcss", proficiency: 90 },
        { name: "Bootstrap", iconKey: "bootstrap", proficiency: 80 },
        { name: "Material UI", iconKey: "mui", proficiency: 80 },
        { name: "Ant Design", iconKey: "antdesign", proficiency: 75 },
        { name: "Shadcn UI", iconKey: "shadcnui", proficiency: 85 },
        { name: "PWA", iconKey: "pwa", proficiency: 75 },
      ],
    },
    {
      categoryName: "Backend & APIs",
      order: 3,
      skills: [
        { name: "Node.js", iconKey: "nodejs", proficiency: 95 },
        { name: "Express.js", iconKey: "express", proficiency: 95 },
        { name: "NestJS", iconKey: "nestjs", proficiency: 85 },
        { name: "FastAPI", iconKey: "fastapi", proficiency: 80 },
        { name: "REST APIs", iconKey: "api", proficiency: 95 },
        { name: "GraphQL", iconKey: "graphql", proficiency: 70 },
        {
          name: "WebSockets (Socket.io)",
          iconKey: "socketio",
          proficiency: 85,
        },
        { name: "API Gateway", iconKey: "api", proficiency: 75 },
        { name: "Serverless", iconKey: "serverless", proficiency: 75 },
      ],
    },
    {
      categoryName: "Databases & ORM",
      order: 4,
      skills: [
        { name: "MongoDB", iconKey: "mongodb", proficiency: 90 },
        { name: "MySQL", iconKey: "mysql", proficiency: 85 },
        { name: "PostgreSQL", iconKey: "postgresql", proficiency: 90 },
        { name: "DynamoDB", iconKey: "dynamodb", proficiency: 70 },
        { name: "Redis", iconKey: "redis", proficiency: 85 },
        { name: "Prisma ORM", iconKey: "prisma", proficiency: 75 },
        { name: "Sequelize ORM", iconKey: "sequelize", proficiency: 80 },
        { name: "SQLAlchemy", iconKey: "sqlalchemy", proficiency: 75 },
      ],
    },
    {
      categoryName: "DevOps & Cloud",
      order: 5,
      skills: [
        { name: "Docker", iconKey: "docker", proficiency: 85 },
        { name: "CI/CD", iconKey: "cicd", proficiency: 85 },
        { name: "GitHub Actions", iconKey: "githubactions", proficiency: 80 },
        { name: "Jenkins", iconKey: "jenkins", proficiency: 75 },
        { name: "Git", iconKey: "git", proficiency: 95 },
        { name: "GitHub", iconKey: "github", proficiency: 95 },
        { name: "GitLab", iconKey: "gitlab", proficiency: 75 },
        { name: "Bitbucket", iconKey: "bitbucket", proficiency: 70 },
      ],
    },
    {
      categoryName: "Architecture & Messaging",
      order: 6,
      skills: [
        { name: "Microservices", iconKey: "microservices", proficiency: 90 },
        { name: "Distributed Systems", iconKey: "network", proficiency: 80 },
        {
          name: "Event-Driven Architecture",
          iconKey: "workflow",
          proficiency: 80,
        },
        { name: "Multi-Tenant SaaS", iconKey: "layers", proficiency: 85 },
        { name: "BullMQ", iconKey: "queue", proficiency: 80 },
        { name: "RabbitMQ", iconKey: "rabbitmq", proficiency: 75 },
      ],
    },
    {
      categoryName: "AI & ML",
      order: 7,
      skills: [
        { name: "OpenAI GPT-4 API", iconKey: "openai", proficiency: 85 },
        { name: "Anthropic Claude API", iconKey: "anthropic", proficiency: 85 },
        { name: "PlayFab", iconKey: "playfab", proficiency: 70 },
        { name: "Prompt Engineering", iconKey: "sparkles", proficiency: 85 },
        { name: "GitHub Copilot", iconKey: "github", proficiency: 85 },
        { name: "Cursor AI", iconKey: "cursor", proficiency: 85 },
      ],
    },
    {
      categoryName: "Testing & Quality",
      order: 8,
      skills: [
        { name: "Unit Testing", iconKey: "checkcircle", proficiency: 80 },
        { name: "TDD", iconKey: "checkcircle", proficiency: 80 },
        { name: "Mocha", iconKey: "mocha", proficiency: 70 },
        { name: "Swagger/OpenAPI", iconKey: "swagger", proficiency: 80 },
        { name: "Code Reviews", iconKey: "codereview", proficiency: 90 },
        {
          name: "Performance Optimization",
          iconKey: "gauge",
          proficiency: 85,
        },
      ],
    },
    {
      categoryName: "Tools & Methods",
      order: 9,
      skills: [
        { name: "Agile Scrum", iconKey: "agile", proficiency: 90 },
        { name: "Jira", iconKey: "jira", proficiency: 85 },
        { name: "Trello", iconKey: "trello", proficiency: 80 },
        { name: "Postman", iconKey: "postman", proficiency: 90 },
        { name: "VS Code", iconKey: "vscode", proficiency: 95 },
        { name: "DSA", iconKey: "dsa", proficiency: 80 },
      ],
    },
  ],

  achievements: [
    {
      title: "Outstanding Achiever Award",
      description:
        "Recognized for exceptional technical contributions and high-impact project delivery at Talentelgia Technologies.",
      date: "",
      imageUrl: "",
      order: 1,
    },
    {
      title: "IT Team Spirit of the Quarter Award",
      description:
        "Honored for outstanding cross-functional teamwork and collaboration.",
      date: "",
      imageUrl: "",
      order: 2,
    },
    {
      title: "Valuable Contributor Award",
      description:
        "Acknowledged for significant contributions to product quality and rapid professional growth.",
      date: "",
      imageUrl: "",
      order: 3,
    },
    {
      title: "Bright Beginner Award",
      description:
        "Recognized for exceptional early-career performance and rapid skill development.",
      date: "",
      imageUrl: "",
      order: 4,
    },
    {
      title: "Shield of Honor & Distinguished Guest Speaker",
      description:
        "Distinguished Guest Speaker at Chandigarh University; awarded Shield of Honor (2022) and CUCAT Scholarship.",
      date: "2022",
      imageUrl: "",
      order: 5,
    },
    {
      title: "1st Rank in Mathematics & 2nd Rank Overall (B.A.)",
      description:
        "Kurukshetra University — 1st Rank in Mathematics and 2nd Rank Overall in B.A. program.",
      date: "2020",
      imageUrl: "",
      order: 6,
    },
  ],

  certifications: [
    {
      title: "AWS CloudFormation",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 1,
    },
    {
      title: "Serverless Computing in AWS",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 2,
    },
    {
      title: "CI/CD Pipeline with Jenkins, Python & Docker",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 3,
    },
    {
      title: "Docker & Kubernetes",
      provider: "Chandigarh University",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 4,
    },
    {
      title: "Introduction to DevOps",
      provider: "Great Learning",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 5,
    },
    {
      title: "Crash Course on Python",
      provider: "Google (Coursera)",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 6,
    },
    {
      title: "MERN Stack Bootcamp",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 7,
    },
    {
      title: "Go (Golang): Web Server with PostgreSQL",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 8,
    },
    {
      title: "SQL for Data Analytics",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 9,
    },
    {
      title: "Agile Methodologies Overview",
      provider: "Udemy",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 10,
    },
    {
      title: "Front-End Web Development",
      provider: "Udemy / Simplilearn",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 11,
    },
    {
      title: "Basics of Data Structures & Algorithms",
      provider: "Udemy / Simplilearn",
      date: "",
      credentialUrl: "",
      imageUrl: "",
      order: 12,
    },
  ],
} as const;

/** Parse ISO dates, year-only strings, or empty → required Date fallback. */
function toDate(value: string | null | undefined): Date | null {
  if (value === null) return null;
  if (value === undefined || value.trim() === "") {
    // Schema requires Date; use Jan 1 of a neutral year when unknown.
    return new Date(Date.UTC(2020, 0, 1));
  }
  const trimmed = value.trim();
  if (/^\d{4}$/.test(trimmed)) {
    return new Date(Date.UTC(Number(trimmed), 0, 1));
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${JSON.stringify(value)}`);
  }
  return parsed;
}

function toRequiredDate(value: string | null | undefined): Date {
  return toDate(value) ?? new Date(Date.UTC(2020, 0, 1));
}

type CountSummary = Record<string, number>;

async function seedAboutMe(counts: CountSummary) {
  const { stats: _stats, ...about } = SEED.aboutMe;
  const result = await AboutMe.findOneAndUpdate(
    { email: about.email.toLowerCase() },
    {
      $set: {
        ...about,
        tagline: "",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
  counts.AboutMe = result ? 1 : 0;
}

async function seedStats(counts: CountSummary) {
  const { stats } = SEED.aboutMe;
  const rows = [
    {
      label: "Years of Experience",
      value: stats.yearsExperience,
      suffix: "+",
      iconKey: "calendar",
      order: 0,
    },
    {
      label: "Projects Delivered",
      value: stats.projectsDelivered,
      suffix: "+",
      iconKey: "folders",
      order: 1,
    },
    {
      label: "Uptime",
      value: stats.uptimePercent,
      suffix: "%",
      iconKey: "activity",
      order: 2,
    },
    {
      label: "Developers Mentored",
      value: stats.developersMentored,
      suffix: "+",
      iconKey: "users",
      order: 3,
    },
  ];

  let n = 0;
  for (const row of rows) {
    await Stat.findOneAndUpdate(
      { label: row.label },
      { $set: row },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.Stat = n;
}

async function seedTimeline(counts: CountSummary) {
  let n = 0;
  for (const entry of SEED.timelineEntries) {
    await TimelineEntry.findOneAndUpdate(
      { role: entry.role, company: entry.company, category: entry.category },
      {
        $set: {
          category: entry.category,
          role: entry.role,
          company: entry.company,
          startDate: toRequiredDate(entry.startDate),
          endDate: toDate(entry.endDate),
          description: entry.description,
          link: entry.link ?? "",
          order: entry.order,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.TimelineEntry = n;
}

async function seedEducation(counts: CountSummary) {
  let n = 0;
  for (const item of SEED.education) {
    await Education.findOneAndUpdate(
      { degree: item.degree, institution: item.institution },
      { $set: item },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.Education = n;
}

async function seedExperience(counts: CountSummary) {
  let n = 0;
  for (const item of SEED.experience) {
    await Experience.findOneAndUpdate(
      { role: item.role, company: item.company },
      {
        $set: {
          role: item.role,
          company: item.company,
          startDate: toRequiredDate(item.startDate),
          endDate: toDate(item.endDate),
          bullets: [...item.bullets],
          techStack: [...item.techStack],
          order: item.order,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.Experience = n;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

async function seedProjects(counts: CountSummary) {
  let n = 0;
  for (const item of SEED.projects) {
    await Project.findOneAndUpdate(
      { title: item.title },
      {
        $set: {
          title: item.title,
          slug: slugify(item.title),
          techStack: [...item.techStack],
          description: item.description,
          bullets: [...item.bullets],
          liveUrl: item.liveUrl,
          githubUrl: item.githubUrl,
          imageUrl: item.imageUrl,
          order: item.order,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.Project = n;
}

async function seedSkills(counts: CountSummary) {
  let n = 0;
  for (const item of SEED.skillCategories) {
    await SkillCategory.findOneAndUpdate(
      { categoryName: item.categoryName },
      {
        $set: {
          categoryName: item.categoryName,
          order: item.order,
          skills: item.skills.map((s) => ({ ...s })),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.SkillCategory = n;
}

async function seedAchievements(counts: CountSummary) {
  let n = 0;
  for (const item of SEED.achievements) {
    await Achievement.findOneAndUpdate(
      { title: item.title },
      {
        $set: {
          title: item.title,
          description: item.description,
          date: toRequiredDate(item.date),
          imageUrl: item.imageUrl,
          order: item.order,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.Achievement = n;
}

async function seedCertifications(counts: CountSummary) {
  let n = 0;
  for (const item of SEED.certifications) {
    await Certification.findOneAndUpdate(
      { title: item.title, provider: item.provider },
      {
        $set: {
          title: item.title,
          provider: item.provider,
          date: toRequiredDate(item.date),
          credentialUrl: item.credentialUrl,
          imageUrl: item.imageUrl,
          order: item.order,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    n += 1;
  }
  counts.Certification = n;
}

async function resetCollections() {
  // Never touch Admin (or ContactMessage).
  const results = await Promise.all([
    AboutMe.deleteMany({}),
    TimelineEntry.deleteMany({}),
    Education.deleteMany({}),
    Experience.deleteMany({}),
    Project.deleteMany({}),
    SkillCategory.deleteMany({}),
    Achievement.deleteMany({}),
    Certification.deleteMany({}),
    Stat.deleteMany({}),
  ]);

  console.log("[seed] --reset: cleared collections");
  console.log(
    Object.fromEntries(
      [
        "AboutMe",
        "TimelineEntry",
        "Education",
        "Experience",
        "Project",
        "SkillCategory",
        "Achievement",
        "Certification",
        "Stat",
      ].map((name, i) => [name, results[i]?.deletedCount ?? 0]),
    ),
  );
}

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Add it to .env.local before seeding.",
    );
  }

  console.log(`[seed] Connecting… (reset=${RESET})`);
  await mongoose.connect(uri, { bufferCommands: false });

  if (RESET) {
    await resetCollections();
  }

  const counts: CountSummary = {};

  await seedAboutMe(counts);
  await seedStats(counts);
  await seedTimeline(counts);
  await seedEducation(counts);
  await seedExperience(counts);
  await seedProjects(counts);
  await seedSkills(counts);
  await seedAchievements(counts);
  await seedCertifications(counts);

  console.log("[seed] Done. Documents upserted/inserted per collection:");
  for (const [name, count] of Object.entries(counts)) {
    console.log(`  ${name}: ${count}`);
  }
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
