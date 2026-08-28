"use client";

import { useEffect, useState, useRef } from "react";
import {
  FileJson,
  Upload,
  Download,
  Copy,
  Check,
  Brain,
  Sparkles,
  Info,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionLoader } from "@/components/loader/SectionLoader";

// Define constant templates and samples for copy/pasting
const SAMPLES: Record<string, unknown> = {
  aboutMe: {
    name: "Abhishek Garg",
    title: "Senior Full Stack Engineer",
    location: "Delhi, India",
    phone: "+91 98765 43210",
    email: "abhishekgargdev959@gmail.com",
    bio: "Passionate developer building premium web apps.",
    beyondCodeBio: "I enjoy writing technical blogs and contributing to open-source projects.",
    portfolioUrl: "https://abhishekgarg.dev",
    openSourceContributions: [
      "Contributed to Next.js docs",
      "Created a custom Next.js MongoDB template"
    ],
    taglines: [
      "Crafting Digital Masterpieces",
      "Full Stack Innovator"
    ],
    socialLinks: [
      { "platform": "github", "url": "https://github.com/Abhishek2063" },
      { "platform": "linkedin", "url": "https://linkedin.com/in/abhishekgargdev" }
    ]
  },
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Innovate Inc",
      startDate: "2023-01-01",
      endDate: null,
      bullets: [
        "Led team of 4 developers to redesign the core e-commerce backend architecture.",
        "Reduced database query times by 35% using Redis caching and index optimization."
      ],
      techStack: ["React", "Node.js", "Redis", "MongoDB"],
      order: 0
    }
  ],
  projects: [
    {
      title: "Project Forge",
      description: "An AI-powered SaaS tool for code synthesis and deployment.",
      bullets: [
        "Integrated Gemini API to automate readme generation.",
        "Deployed on Vercel with serverless function handlers."
      ],
      techStack: ["Next.js", "TailwindCSS", "Gemini AI"],
      liveUrl: "https://forge.example.com",
      githubUrl: "https://github.com/user/forge",
      order: 0
    }
  ],
  skills: [
    {
      categoryName: "Languages & Frameworks",
      order: 0,
      skills: [
        { "name": "TypeScript", "proficiency": 95, "iconKey": "typescript" },
        { "name": "React", "proficiency": 90, "iconKey": "react" }
      ]
    }
  ],
  education: [
    {
      degree: "B.Tech in Computer Science",
      institution: "Technical University",
      year: "2018 - 2022",
      highlights: [
        "Graduated with CGPA 9.2/10",
        "Won First Place in National College Hackathon 2021"
      ]
    }
  ],
  achievements: [
    {
      title: "Best Performer Award 2025",
      description: "Recognized for driving engineering excellence and on-time shipments.",
      date: "2025-12-15",
      imageUrl: "",
      order: 0
    }
  ],
  certifications: [
    {
      title: "Google Cloud Certified Professional Cloud Architect",
      provider: "Google Cloud",
      date: "2026-05-10",
      credentialUrl: "https://google.com/verify/123",
      imageUrl: "",
      order: 0
    }
  ],
  timeline: [
    {
      category: "experience",
      role: "Senior Full Stack Engineer",
      company: "Innovate Inc",
      startDate: "2023-01-01",
      endDate: null,
      description: "Joined the engineering department to lead the digital transformation project.",
      link: "",
      order: 0
    }
  ]
};

// Create a combined schema sample
SAMPLES.all = {
  aboutMe: SAMPLES.aboutMe,
  experience: SAMPLES.experience,
  projects: SAMPLES.projects,
  skills: SAMPLES.skills,
  education: SAMPLES.education,
  achievements: SAMPLES.achievements,
  certifications: SAMPLES.certifications,
  timeline: SAMPLES.timeline
};

const MODULE_OPTIONS = [
  { value: "all", label: "📦 All Portfolio Combined" },
  { value: "aboutMe", label: "👤 About Me" },
  { value: "experience", label: "💼 Experience" },
  { value: "projects", label: "📂 Projects" },
  { value: "skills", label: "⚡ Skills" },
  { value: "education", label: "🎓 Education" },
  { value: "achievements", label: "🏆 Achievements" },
  { value: "certifications", label: "📜 Certifications" },
  { value: "timeline", label: "🗺️ Timeline Entries" },
];

export default function JsonDataManagerPage() {
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [jsonText, setJsonText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [sampleOpen, setSampleOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current database data for selected module
  const loadModuleData = async (moduleName: string) => {
    setLoading(true);
    setSyntaxError(null);
    try {
      const response = await fetch(`/api/admin/portfolio-data/json?module=${moduleName}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load database records.");
      }
      setJsonText(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load database records.");
      // Fallback to sample if fetch fails
      setJsonText(JSON.stringify(SAMPLES[moduleName], null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadModuleData(selectedModule);
  }, [selectedModule]);

  // Real-time JSON validation
  const handleTextChange = (text: string) => {
    setJsonText(text);
    if (!text.trim()) {
      setSyntaxError("JSON content cannot be empty.");
      return;
    }
    try {
      JSON.parse(text);
      setSyntaxError(null);
    } catch (e) {
      setSyntaxError(e instanceof Error ? e.message : "Invalid JSON syntax.");
    }
  };

  // Prettify/Format code
  const handlePrettify = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setSyntaxError(null);
      toast.success("JSON prettified!");
    } catch (e) {
      toast.error("Cannot prettify: JSON contains syntax errors.");
    }
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      toast.success("JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy text.");
    }
  };

  // Trigger JSON download file
  const handleDownload = () => {
    try {
      // Validate first
      JSON.parse(jsonText);
      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedModule}-portfolio-export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (e) {
      toast.error("Cannot download: JSON contains syntax errors.");
    }
  };

  // File Upload trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleTextChange(result);
      toast.success(`Loaded JSON file: ${file.name}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
  };

  // Import / Save to DB
  const handleImport = async () => {
    if (syntaxError || !jsonText.trim()) {
      toast.error("Please resolve syntax errors before importing.");
      return;
    }

    setSaving(true);
    try {
      const parsed = JSON.parse(jsonText);
      const response = await fetch(`/api/admin/portfolio-data/json?module=${selectedModule}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to import JSON data.");
      }

      toast.success(data.message || "Data imported successfully!");
      // Reload database values
      await loadModuleData(selectedModule);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import JSON data.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to current database state
  const handleReset = () => {
    void loadModuleData(selectedModule);
  };

  // Load sample template into workspace
  const handleLoadSample = () => {
    const sample = SAMPLES[selectedModule];
    handleTextChange(JSON.stringify(sample, null, 2));
    toast.success("Loaded template sample into editor!");
    setSampleOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">JSON Data Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Export database records or import/update entries using raw JSON objects. Non-destructive: missing records are not deleted.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor (8/12) */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[620px] transition-all duration-300">
          
          {/* Editor Header Bar */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label htmlFor="module-select" className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Scope:</label>
              <select
                id="module-select"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={loading || saving}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-teal-500 focus:outline-none cursor-pointer"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrettify}
                disabled={loading || saving || !jsonText}
                className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 bg-transparent shrink-0"
              >
                Prettify
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={loading || !jsonText}
                className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 bg-transparent shrink-0 gap-1.5"
              >
                {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={loading || !jsonText}
                className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 bg-transparent shrink-0 gap-1.5"
              >
                <Download className="size-3" />
                Export
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || saving}
                className="h-8 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700 bg-transparent shrink-0 gap-1.5"
              >
                <Upload className="size-3" />
                Upload
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Editor Textarea Workspace */}
          <div className="flex-1 relative flex flex-col">
            {loading ? (
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center z-10">
                <SectionLoader variant="grid" count={4} />
              </div>
            ) : null}

            <div className="flex-1 flex flex-col p-4 bg-zinc-950">
              <textarea
                value={jsonText}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={loading || saving}
                rows={22}
                className="w-full flex-1 min-h-[420px] bg-transparent text-zinc-200 font-mono text-xs focus:outline-none resize-y leading-relaxed whitespace-pre select-text caret-teal-400"
                placeholder={`// Enter or paste JSON data for ${selectedModule}...`}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Editor Footer / Validation Panel */}
          <div className="bg-zinc-900 border-t border-zinc-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {syntaxError ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-950/30 border border-rose-900/50 px-3 py-1.5 rounded-lg animate-pulse">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>{syntaxError}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/20 border border-emerald-900/40 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>JSON Syntax Valid</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={loading || saving}
                className="h-9 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 shrink-0 gap-1.5 bg-transparent"
              >
                <RotateCcw className="size-3.5" />
                Reset changes
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={loading || saving || Boolean(syntaxError) || !jsonText.trim()}
                className="h-9 px-5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 shrink-0 shadow-lg shadow-teal-900/20"
              >
                {saving ? "Importing..." : "Import & Upsert Data"}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Info & Templates (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Instructions Block */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-100 rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-teal-400">
              <Info className="size-5" />
              <h2 className="text-sm font-semibold tracking-wider uppercase">How Import Works</h2>
            </div>
            <ul className="text-xs text-zinc-400 space-y-2.5 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-zinc-200">Non-Destructive Update</strong>: This import processes items incrementally. Any matching ID will update fields, and missing records in your JSON are <strong className="text-zinc-200">not deleted</strong> from the database.
              </li>
              <li>
                <strong className="text-zinc-200">Creating Entries</strong>: To insert a brand new entry, simply delete its <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-[10px]">id</code> property (or exclude it) from the JSON object.
              </li>
              <li>
                <strong className="text-zinc-200">Format Scope</strong>: Ensure your JSON structure corresponds to the selected Scope dropdown in the editor.
              </li>
              <li>
                <strong className="text-zinc-200">Date Formats</strong>: Dates should follow the standard <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded text-[10px]">YYYY-MM-DD</code> ISO layout.
              </li>
            </ul>
          </div>

          {/* Sample Drawer Selector */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col">
            <div className="flex items-center gap-2 text-zinc-200">
              <BookOpen className="size-5 text-indigo-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase">Reference Template</h2>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              Stuck on the JSON structure? Toggle our reference templates helper showing clean arrays and parameter configurations.
            </p>

            <Button
              type="button"
              onClick={() => setSampleOpen(!sampleOpen)}
              className="w-full text-xs bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700"
            >
              {sampleOpen ? "Hide Template Panel" : "Show Template Panel"}
            </Button>

            {sampleOpen ? (
              <div className="space-y-3 mt-3 pt-3 border-t border-zinc-850 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">
                    Template: {MODULE_OPTIONS.find(o => o.value === selectedModule)?.label.split(" ").slice(1).join(" ")}
                  </span>
                  <button
                    onClick={handleLoadSample}
                    className="text-[10px] bg-teal-950 text-teal-300 hover:bg-teal-900 border border-teal-800 px-2 py-0.5 rounded font-semibold transition-colors"
                  >
                    Load into Workspace
                  </button>
                </div>
                <div className="rounded-lg bg-zinc-950 p-3 max-h-[220px] overflow-y-auto border border-zinc-800 text-[10px] font-mono leading-relaxed text-zinc-400 whitespace-pre">
                  {JSON.stringify(SAMPLES[selectedModule], null, 2)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
