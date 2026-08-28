"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Send,
  User,
  Briefcase,
  AlertCircle,
  GraduationCap,
  FolderKanban,
  Sparkles,
  Trophy,
  Award,
  Check,
  Plus,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionLoader } from "@/components/loader/SectionLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ILinkedInExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

interface ILinkedInEducation {
  degree: string;
  institution: string;
  year: string;
  highlights: string[];
}

interface ILinkedInProject {
  title: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
}

interface ILinkedInSkill {
  name: string;
}

interface ILinkedInAchievement {
  title: string;
  description: string;
  date: string;
}

interface ILinkedInProfile {
  name: string;
  headline: string;
  bio: string;
  imageUrl: string;
  email: string;
  experiences: ILinkedInExperience[];
  education: ILinkedInEducation[];
  projects: ILinkedInProject[];
  skills: ILinkedInSkill[];
  achievements: ILinkedInAchievement[];
}

interface IMismatch {
  field: string;
  label: string;
  localValue: string | string[];
  remoteValue: string | string[];
  type: "mismatch" | "missing_local" | "missing_remote";
  section: "about" | "experience" | "education" | "projects" | "skills" | "achievements";
  id?: string;
}

function LinkedInAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState<ILinkedInProfile | null>(null);
  const [mismatches, setMismatches] = useState<IMismatch[]>([]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Form & action states
  const [syncingSection, setSyncingSection] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareText, setShareText] = useState("");

  // AI Optimizer States
  const [optimizeTarget, setOptimizeTarget] = useState<IMismatch | null>(null);
  const [aiInstruction, setAiInstruction] = useState(
    "Merge the best parts of both summaries, maintaining a professional and human tone, and formatting it cleanly.",
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | string[] | null>(null);
  const [applyingSuggestion, setApplyingSuggestion] = useState(false);

  const MAX_CHARACTERS = 2500;

  const fetchLinkedInStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/linkedin/profile");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load LinkedIn status");
      }
      setConnected(data.isConnected ?? false);
      if (data.isConnected) {
        setProfile(data.profile || null);
        setMismatches(data.mismatches || []);
        setLastSynced(data.lastSyncedAt || null);
      } else {
        setProfile(null);
        setMismatches([]);
        setLastSynced(null);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load LinkedIn integration.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLinkedInStatus();

    // Check query params for alerts/successes
    const connectedParam = searchParams.get("connected");
    const errorParam = searchParams.get("error");
    const errorMsg = searchParams.get("msg");

    if (connectedParam === "true") {
      toast.success("Successfully connected LinkedIn account!");
      router.replace("/admin/linkedin");
    } else if (errorParam) {
      toast.error(`OAuth Error: ${errorMsg || "Authorization failed"}`);
      router.replace("/admin/linkedin");
    }
  }, [searchParams, router, fetchLinkedInStatus]);

  const handleConnect = () => {
    window.location.href = "/api/admin/linkedin/connect";
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your LinkedIn account?")) return;
    setDisconnecting(true);
    try {
      const response = await fetch("/api/admin/linkedin/profile", {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect account.");
      }
      toast.success("LinkedIn account disconnected.");
      setConnected(false);
      setProfile(null);
      setMismatches([]);
      setLastSynced(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect.");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSyncToLocal = async (section: string) => {
    const isBulk = section === "all";
    const msg = isBulk
      ? "This will sync ALL LinkedIn sections to your local Portfolio database, overwriting existing conflicts. Proceed?"
      : `This will overwrite your local "${section}" database records with details from LinkedIn. Proceed?`;

    if (!confirm(msg)) return;

    setSyncingSection(section);
    try {
      const response = await fetch(`/api/admin/linkedin/profile?section=${section}`, {
        method: "PUT",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync to local Portfolio.");
      }
      toast.success(
        isBulk
          ? "All sections successfully synced from LinkedIn!"
          : `Portfolio "${section}" section synced from LinkedIn!`,
      );
      await fetchLinkedInStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed.");
    } finally {
      setSyncingSection(null);
    }
  };

  const handleSyncToRemote = async (section: string) => {
    const isBulk = section === "all";
    setSyncingSection(section);
    try {
      const response = await fetch("/api/admin/linkedin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_portfolio_to_linkedin", section }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync to LinkedIn.");
      }
      toast.success(
        data.simulated
          ? `Sync simulation complete! LinkedIn cached "${section}" matches Portfolio.`
          : `LinkedIn profile "${section}" updated successfully!`,
      );
      await fetchLinkedInStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed.");
    } finally {
      setSyncingSection(null);
    }
  };

  const handlePostShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareText.trim()) return;
    if (shareText.length > MAX_CHARACTERS) {
      toast.error(`Post exceeds the limit of ${MAX_CHARACTERS} characters.`);
      return;
    }
    setSharing(true);
    try {
      const response = await fetch("/api/admin/linkedin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "post_share", message: shareText }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to post share.");
      }
      toast.success(data.msg || "Post shared to LinkedIn!");
      setShareText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post.");
    } finally {
      setSharing(false);
    }
  };

  // AI Optimization Action
  const generateAiOptimization = async () => {
    if (!optimizeTarget) return;
    setAiGenerating(true);
    setAiSuggestion(null);

    try {
      const response = await fetch("/api/admin/linkedin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize_mismatch",
          fieldName: optimizeTarget.field,
          localValue: optimizeTarget.localValue,
          remoteValue: optimizeTarget.remoteValue,
          instruction: aiInstruction,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI optimization.");
      }
      setAiSuggestion(data.suggestedValue);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load AI recommendation.",
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const applyAiSuggestion = async () => {
    if (!optimizeTarget || !aiSuggestion) return;
    setApplyingSuggestion(true);

    try {
      // 1. Fetch current portfolio data
      const getRes = await fetch("/api/admin/portfolio-data");
      const currentData = await getRes.json();
      if (!getRes.ok) {
        throw new Error("Failed to load current Portfolio data for editing.");
      }

      const payload: Record<string, any> = {};

      if (optimizeTarget.section === "about") {
        payload.aboutMe = {
          ...currentData.aboutMe,
          [optimizeTarget.field]: aiSuggestion,
        };
      } else {
        const keyMap: Record<string, string> = {
          experience: "experience",
          education: "education",
          projects: "projects",
          achievements: "achievements",
        };
        const apiKey = keyMap[optimizeTarget.section];

        if (apiKey && Array.isArray(currentData[apiKey])) {
          payload[apiKey] = currentData[apiKey].map((item: any) => {
            if (item.id === optimizeTarget.id) {
              return {
                ...item,
                [optimizeTarget.field]: aiSuggestion,
              };
            }
            return item;
          });
        }
      }

      // 2. Post updated payload
      const postRes = await fetch("/api/admin/portfolio-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const postData = await postRes.json();
      if (!postRes.ok) {
        throw new Error(postData.error || "Failed to apply suggestion to Database.");
      }

      toast.success(`Successfully applied AI optimized ${optimizeTarget.label}!`);
      setOptimizeTarget(null);
      setAiSuggestion(null);
      setAiInstruction(
        "Merge the best parts of both summaries, maintaining a professional and human tone, and formatting it cleanly.",
      );
      await fetchLinkedInStatus();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to write updates to Database.",
      );
    } finally {
      setApplyingSuggestion(false);
    }
  };

  const renderSectionHeader = (sectionKey: string, label: string) => {
    const isMismatched = mismatches.some((m) => m.section === sectionKey);
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          {isMismatched ? (
            <Badge variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px]">
              Requires Sync
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50 text-[10px]">
              Matched
            </Badge>
          )}
          <span className="text-xs text-zinc-500 font-medium">Reconcile {label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSyncToRemote(sectionKey)}
            disabled={syncingSection !== null}
            className="text-[10px] h-7 px-3 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          >
            {syncingSection === sectionKey ? "Syncing..." : "Sync Portfolio to LinkedIn"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleSyncToLocal(sectionKey)}
            disabled={syncingSection !== null}
            className="text-[10px] h-7 px-3 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            {syncingSection === sectionKey ? "Syncing..." : "Sync LinkedIn to Portfolio"}
          </Button>
        </div>
      </div>
    );
  };

  const renderAiOptimizeButton = (mismatch: IMismatch) => {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOptimizeTarget(mismatch)}
        className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-50 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-900/50 px-2 py-0.5 h-6 rounded mt-2 shrink-0 transition-colors"
      >
        <Sparkles className="size-3 text-teal-500 dark:text-teal-400" />
        <span>Optimize Mismatch with AI</span>
      </Button>
    );
  };

  if (loading) {
    return <SectionLoader variant="table" count={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">LinkedIn Integration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Synchronize profile details, experiences, projects, education, skills, and publish updates.
          </p>
        </div>
        {connected && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSyncToLocal("all")}
              disabled={syncingSection !== null}
              className="gap-1.5 h-8 bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
            >
              <RefreshCw className={`size-3.5 ${syncingSection === "all" ? "animate-spin" : ""}`} />
              <span>Sync All Sections</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchLinkedInStatus()}
              className="gap-1.5 h-8"
            >
              <RefreshCw className="size-3.5" />
              <span>Refresh Status</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="gap-1.5 h-8"
            >
              <Trash2 className="size-3.5" />
              <span>Disconnect</span>
            </Button>
          </div>
        )}
      </div>

      {!connected ? (
        /* Not Connected Layout */
        <Card className="max-w-xl mx-auto border border-zinc-200 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden mt-10">
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 animate-pulse">
              <FaLinkedin className="size-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold">Connect your LinkedIn Account</CardTitle>
              <CardDescription className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Connect your LinkedIn profile to run side-by-side data audits, highlight mismatches between your portfolio and profile, and publish updates directly.
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-xs"
            >
              <FaLinkedin className="size-4 mr-2" />
              Connect to LinkedIn
            </Button>
          </div>
        </Card>
      ) : (
        /* Connected Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Comparison Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="about" className="flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="border-b border-zinc-200 bg-zinc-50/50 p-2">
                <TabsList className="flex flex-wrap gap-1 justify-start border-none bg-transparent h-auto p-0">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="achievements">Honors & Awards</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* --- 1. About Section Tab --- */}
                <TabsContent value="about" className="space-y-6 mt-0">
                  {renderSectionHeader("about", "About Profile")}

                  <div className="space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/30">
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Portfolio Name</p>
                        <p className="text-sm font-medium mt-0.5">
                          {mismatches.find((m) => m.section === "about" && m.field === "name")?.localValue as string || profile?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">LinkedIn Name</p>
                        <p className="text-sm font-medium mt-0.5">
                          {mismatches.find((m) => m.section === "about" && m.field === "name")?.remoteValue as string || profile?.name}
                        </p>
                      </div>
                      {mismatches.some((m) => m.section === "about" && m.field === "name") && (
                        <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between border border-amber-100 bg-amber-50/30 px-3 py-2 rounded text-xs text-amber-700">
                          <span>Name mismatch detected.</span>
                          {renderAiOptimizeButton(mismatches.find((m) => m.section === "about" && m.field === "name")!)}
                        </div>
                      )}
                    </div>

                    {/* Headline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/30">
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Portfolio Headline</p>
                        <p className="text-sm font-medium mt-0.5">
                          {mismatches.find((m) => m.section === "about" && m.field === "title")?.localValue as string || profile?.headline}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">LinkedIn Headline</p>
                        <p className="text-sm font-medium mt-0.5">
                          {mismatches.find((m) => m.section === "about" && m.field === "title")?.remoteValue as string || profile?.headline}
                        </p>
                      </div>
                      {mismatches.some((m) => m.section === "about" && m.field === "title") && (
                        <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between border border-amber-100 bg-amber-50/30 px-3 py-2 rounded text-xs text-amber-700">
                          <span>Headline / Title mismatch detected.</span>
                          {renderAiOptimizeButton(mismatches.find((m) => m.section === "about" && m.field === "title")!)}
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border border-zinc-100 bg-zinc-50/30">
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Portfolio Bio</p>
                        <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">
                          {mismatches.find((m) => m.section === "about" && m.field === "bio")?.localValue as string || profile?.bio}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">LinkedIn Summary</p>
                        <p className="text-xs text-zinc-600 mt-1 whitespace-pre-wrap">
                          {mismatches.find((m) => m.section === "about" && m.field === "bio")?.remoteValue as string || profile?.bio}
                        </p>
                      </div>
                      {mismatches.some((m) => m.section === "about" && m.field === "bio") && (
                        <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between border border-amber-100 bg-amber-50/30 px-3 py-2 rounded text-xs text-amber-700">
                          <span>Bio summary mismatch detected.</span>
                          {renderAiOptimizeButton(mismatches.find((m) => m.section === "about" && m.field === "bio")!)}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* --- 2. Experience Section Tab --- */}
                <TabsContent value="experience" className="space-y-6 mt-0">
                  {renderSectionHeader("experience", "Work Experiences")}

                  <div className="space-y-4">
                    {profile?.experiences.map((exp, idx) => {
                      const localMismatch = mismatches.find(
                        (m) =>
                          m.section === "experience" &&
                          m.label.toLowerCase().includes(exp.company.toLowerCase()) &&
                          m.label.toLowerCase().includes(exp.title.toLowerCase()),
                      );

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${
                            localMismatch
                              ? "border-amber-250 bg-amber-50/10"
                              : "border-zinc-100 bg-zinc-50/30"
                          } space-y-3`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                              <p className="font-semibold text-sm text-zinc-900">{exp.title}</p>
                              <p className="text-xs text-zinc-500 font-medium">
                                {exp.company} · {exp.startDate} - {exp.endDate || "Present"}
                              </p>
                            </div>
                            {localMismatch ? (
                              <Badge variant="destructive" className="bg-amber-105 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px] w-fit">
                                Out of Sync
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50 text-[10px] w-fit">
                                Matched
                              </Badge>
                            )}
                          </div>

                          {localMismatch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed border-zinc-100 text-xs">
                              <div>
                                <p className="font-semibold text-zinc-400">Portfolio Description:</p>
                                <p className="text-zinc-650 mt-1 whitespace-pre-wrap bg-white p-2 rounded border border-zinc-100">
                                  {localMismatch.localValue as string}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-400">LinkedIn Description:</p>
                                <p className="text-zinc-650 mt-1 whitespace-pre-wrap bg-white p-2 rounded border border-zinc-100">
                                  {localMismatch.remoteValue as string}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                {renderAiOptimizeButton(localMismatch)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* --- 3. Education Section Tab --- */}
                <TabsContent value="education" className="space-y-6 mt-0">
                  {renderSectionHeader("education", "Education Details")}

                  <div className="space-y-4">
                    {profile?.education.map((edu, idx) => {
                      const cleanDegree = edu.degree.replace(/\s*\(with honors\)/i, "").trim();
                      const localMismatch = mismatches.find(
                        (m) =>
                          m.section === "education" &&
                          m.label.toLowerCase().includes(edu.institution.toLowerCase()) &&
                          m.label.toLowerCase().includes(cleanDegree.toLowerCase()),
                      );

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${
                            localMismatch
                              ? "border-amber-250 bg-amber-50/10"
                              : "border-zinc-100 bg-zinc-50/30"
                          } space-y-3`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                              <p className="font-semibold text-sm text-zinc-900">{edu.degree}</p>
                              <p className="text-xs text-zinc-500 font-medium">
                                {edu.institution} · {edu.year}
                              </p>
                            </div>
                            {localMismatch ? (
                              <Badge variant="destructive" className="bg-amber-105 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px] w-fit">
                                Out of Sync
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50 text-[10px] w-fit">
                                Matched
                              </Badge>
                            )}
                          </div>

                          {localMismatch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed border-zinc-100 text-xs">
                              <div>
                                <p className="font-semibold text-zinc-400">Portfolio Highlights:</p>
                                <ul className="list-disc list-inside text-zinc-650 mt-1 bg-white p-2 rounded border border-zinc-100 space-y-0.5">
                                  {(localMismatch.localValue as string[] || []).map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-400">LinkedIn Highlights:</p>
                                <ul className="list-disc list-inside text-zinc-650 mt-1 bg-white p-2 rounded border border-zinc-100 space-y-0.5">
                                  {(localMismatch.remoteValue as string[] || []).map((h, i) => (
                                    <li key={i}>{h}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="md:col-span-2">
                                {renderAiOptimizeButton(localMismatch)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* --- 4. Projects Section Tab --- */}
                <TabsContent value="projects" className="space-y-6 mt-0">
                  {renderSectionHeader("projects", "Projects")}

                  <div className="space-y-4">
                    {profile?.projects.map((proj, idx) => {
                      const localMismatch = mismatches.find(
                        (m) => m.section === "projects" && m.label.toLowerCase().includes(proj.title.toLowerCase()),
                      );

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${
                            localMismatch
                              ? "border-amber-250 bg-amber-50/10"
                              : "border-zinc-100 bg-zinc-50/30"
                          } space-y-3`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                              <p className="font-semibold text-sm text-zinc-900">{proj.title}</p>
                              {proj.techStack && proj.techStack.length > 0 && (
                                <p className="text-[10px] text-zinc-550 mt-0.5">
                                  Stack: {proj.techStack.join(", ")}
                                </p>
                              )}
                            </div>
                            {localMismatch ? (
                              <Badge variant="destructive" className="bg-amber-105 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px] w-fit">
                                Out of Sync
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50 text-[10px] w-fit">
                                Matched
                              </Badge>
                            )}
                          </div>

                          {localMismatch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed border-zinc-100 text-xs">
                              <div>
                                <p className="font-semibold text-zinc-400">Portfolio Description:</p>
                                <p className="text-zinc-650 mt-1 whitespace-pre-wrap bg-white p-2 rounded border border-zinc-100">
                                  {localMismatch.localValue as string}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-400">LinkedIn Description:</p>
                                <p className="text-zinc-650 mt-1 whitespace-pre-wrap bg-white p-2 rounded border border-zinc-100">
                                  {localMismatch.remoteValue as string}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                {renderAiOptimizeButton(localMismatch)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* --- 5. Skills Section Tab --- */}
                <TabsContent value="skills" className="space-y-6 mt-0">
                  {renderSectionHeader("skills", "Skills Inventory")}

                  <div className="space-y-4">
                    <div className="rounded-xl border border-zinc-150 bg-zinc-50/20 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">LinkedIn Skills List</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills.map((skill, idx) => {
                          const isMissingLocal = mismatches.some(
                            (m) => m.section === "skills" && m.type === "missing_local" && m.label.toLowerCase() === skill.name.toLowerCase(),
                          );
                          return (
                            <Badge
                              key={idx}
                              variant={isMissingLocal ? "destructive" : "secondary"}
                              className={
                                isMissingLocal
                                  ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 flex items-center gap-1 text-[11px]"
                                  : "text-zinc-700 border-zinc-200 hover:bg-zinc-100 text-[11px]"
                              }
                            >
                              {skill.name}
                              {isMissingLocal && <AlertTriangle className="size-3" />}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {mismatches.some((m) => m.section === "skills") && (
                      <Card className="border border-amber-200 bg-amber-50/10 p-4 text-xs space-y-2">
                        <div className="font-semibold text-amber-800 flex items-center gap-1">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>Skill discrepancies detected:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-zinc-650">
                          {mismatches
                            .filter((m) => m.section === "skills")
                            .map((m, idx) => (
                              <li key={idx}>
                                {m.type === "missing_local" ? (
                                  <span>Skill <strong>{m.label}</strong> is present on LinkedIn but missing in your portfolio.</span>
                                ) : (
                                  <span>Skill <strong>{m.label}</strong> is in your portfolio but missing on LinkedIn.</span>
                                )}
                              </li>
                            ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* --- 6. Achievements Section Tab --- */}
                <TabsContent value="achievements" className="space-y-6 mt-0">
                  {renderSectionHeader("achievements", "Honors & Awards")}

                  <div className="space-y-4">
                    {profile?.achievements.map((ach, idx) => {
                      const cleanTitle = ach.title.replace(/\s*\(gold medalist\)/i, "").trim();
                      const localMismatch = mismatches.find(
                        (m) =>
                          m.section === "achievements" &&
                          (m.label.toLowerCase().includes(ach.title.toLowerCase()) ||
                            ach.title.toLowerCase().includes(m.label.toLowerCase())),
                      );

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${
                            localMismatch
                              ? "border-amber-250 bg-amber-50/10"
                              : "border-zinc-100 bg-zinc-50/30"
                          } space-y-3`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <div>
                              <p className="font-semibold text-sm text-zinc-900">{ach.title}</p>
                              <p className="text-xs text-zinc-500 font-medium">
                                Date awarded: {ach.date}
                              </p>
                            </div>
                            {localMismatch ? (
                              <Badge variant="destructive" className="bg-amber-105 text-amber-800 border-amber-200 hover:bg-amber-100 text-[10px] w-fit">
                                Out of Sync
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50 text-[10px] w-fit">
                                Matched
                              </Badge>
                            )}
                          </div>

                          {localMismatch && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-dashed border-zinc-100 text-xs">
                              <div>
                                <p className="font-semibold text-zinc-400">Portfolio Description:</p>
                                <p className="text-zinc-650 mt-1 whitespace-pre-wrap bg-white p-2 rounded border border-zinc-100">
                                  {localMismatch.localValue as string}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-400">LinkedIn Description:</p>
                                <p className="text-zinc-650 mt-1 whitespace-pre-wrap bg-white p-2 rounded border border-zinc-100">
                                  {localMismatch.remoteValue as string}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                {renderAiOptimizeButton(localMismatch)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sync Actions & Share Composer Sidebar */}
          <div className="space-y-6">
            {/* Connected Card */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 bg-zinc-100 flex items-center justify-center">
                  {profile?.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="size-8 text-zinc-400" />
                  )}
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                    <FaLinkedin className="size-2.5" />
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-sm text-zinc-900">{profile?.name}</h2>
                  <p className="text-[10px] text-zinc-500 font-medium truncate max-w-[200px] mx-auto">
                    {profile?.email}
                  </p>
                  {lastSynced && (
                    <p className="text-[9px] text-zinc-400 mt-1">
                      Last Checked: {new Date(lastSynced).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sync Tools */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="py-4 px-6 border-b border-zinc-100">
                <CardTitle className="text-sm font-semibold">Synchronization Actions</CardTitle>
                <CardDescription className="text-xs">
                  Sync all information at once bidirectionally.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={() => handleSyncToLocal("all")}
                  disabled={syncingSection !== null}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium py-2 rounded-lg gap-2"
                >
                  <RefreshCw className={`size-3.5 ${syncingSection === "all" ? "animate-spin" : ""}`} />
                  <span>Sync LinkedIn to Portfolio</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSyncToRemote("all")}
                  disabled={syncingSection !== null}
                  className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium py-2 rounded-lg gap-2"
                >
                  <RefreshCw className={`size-3.5 ${syncingSection === "all" ? "animate-spin" : ""}`} />
                  <span>Sync Portfolio to LinkedIn</span>
                </Button>
              </CardContent>
            </Card>

            {/* Share composer */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
              <CardHeader className="py-4 px-6 border-b border-zinc-100">
                <CardTitle className="text-sm font-semibold">Publish Share Update</CardTitle>
                <CardDescription className="text-xs">
                  Post professional status updates directly to LinkedIn feed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePostShare} className="space-y-4">
                  <div className="space-y-2">
                    <textarea
                      id="linkedin-share-textarea"
                      rows={5}
                      value={shareText}
                      onChange={(e) => setShareText(e.target.value)}
                      disabled={sharing}
                      placeholder="Share a professional milestone or write your post..."
                      className="w-full rounded-lg border border-zinc-200 p-3 text-xs focus:border-blue-500 focus:outline-none bg-white text-zinc-800 disabled:opacity-50 transition-colors placeholder:text-zinc-400 resize-none"
                    />
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className={`${shareText.length > MAX_CHARACTERS ? "text-destructive" : "text-zinc-400"}`}>
                        {shareText.length} / {MAX_CHARACTERS} chars
                      </span>
                      {shareText.length > MAX_CHARACTERS && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3" /> Exceeds LinkedIn limit
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={sharing || !shareText.trim() || shareText.length > MAX_CHARACTERS}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg gap-2"
                  >
                    <Send className="size-3.5" />
                    <span>{sharing ? "Publishing..." : "Publish Post"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Mismatch Optimizer Dialog Modal */}
      <Dialog
        open={Boolean(optimizeTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setOptimizeTarget(null);
            setAiSuggestion(null);
            setAiInstruction(
              "Merge the best parts of both summaries, maintaining a professional and human tone, and formatting it cleanly.",
            );
          }
        }}
      >
        <DialogContent className="sm:max-w-lg gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl">
          {optimizeTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 text-lg font-bold">
                  <Sparkles className="size-5 text-teal-500 dark:text-teal-400 animate-pulse" />
                  AI Mismatch Resolver
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-550 dark:text-zinc-400">
                  Optimize and merge field: <strong className="text-zinc-800 dark:text-zinc-250 font-semibold">{optimizeTarget.label}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Portfolio Local Value</span>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 p-2.5 mt-1 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-[120px] overflow-y-auto leading-relaxed">
                      {Array.isArray(optimizeTarget.localValue) ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {optimizeTarget.localValue.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        optimizeTarget.localValue
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">LinkedIn Remote Value</span>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 p-2.5 mt-1 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-[120px] overflow-y-auto leading-relaxed">
                      {Array.isArray(optimizeTarget.remoteValue) ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {optimizeTarget.remoteValue.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        optimizeTarget.remoteValue
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="ai-instructions-textarea" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Merging / Writing Guidelines
                  </label>
                  <textarea
                    id="ai-instructions-textarea"
                    rows={3}
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    disabled={aiGenerating}
                    placeholder="Merge the best points, maintain professional tone..."
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-650 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {aiSuggestion && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">AI Recommendation</span>
                    <div className="rounded-lg border border-teal-200 dark:border-teal-900/50 bg-teal-50/10 dark:bg-teal-950/20 p-3 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap max-h-[120px] overflow-y-auto text-xs leading-relaxed">
                      {Array.isArray(aiSuggestion) ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {aiSuggestion.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        aiSuggestion
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-150 dark:border-zinc-800 pt-3.5 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={aiGenerating || applyingSuggestion}
                  onClick={() => {
                    setOptimizeTarget(null);
                    setAiSuggestion(null);
                    setAiInstruction(
                      "Merge the best parts of both summaries, maintaining a professional and human tone, and formatting it cleanly.",
                    );
                  }}
                  className="text-xs h-9"
                >
                  Close
                </Button>
                
                <Button
                  type="button"
                  onClick={generateAiOptimization}
                  disabled={aiGenerating || applyingSuggestion || !aiInstruction.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9"
                >
                  {aiGenerating ? "Generating..." : "Generate AI Merge"}
                </Button>

                {aiSuggestion && (
                  <Button
                    type="button"
                    onClick={applyAiSuggestion}
                    disabled={applyingSuggestion}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 gap-1.5"
                  >
                    {applyingSuggestion ? (
                      "Applying..."
                    ) : (
                      <>
                        <Check className="size-4" />
                        <span>Apply Suggestion</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LinkedInAdminPage() {
  return (
    <Suspense fallback={<SectionLoader variant="table" count={6} />}>
      <LinkedInAdminContent />
    </Suspense>
  );
}
