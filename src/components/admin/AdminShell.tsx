"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, Menu, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {ADMIN_NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              buttonVariants({
                variant: active ? "secondary" : "ghost",
                size: "sm",
              }),
              "justify-start gap-2",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("justify-start gap-2", className)}
      onClick={logout}
      disabled={loading}
    >
      <LogOut className="size-4" />
      {loading ? "Logging out…" : "Logout"}
    </Button>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hasMismatches, setHasMismatches] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const res = await fetch("/api/admin/linkedin/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.isConnected && data.hasMismatches) {
            setHasMismatches(true);
          }
        }
      } catch {
        // Silently ignore errors
      }
    };
    void checkSyncStatus();
  }, []);

  return (
    <div className="min-h-svh bg-zinc-50 text-zinc-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
            Admin
          </p>
          <p className="mt-1 text-sm font-semibold">Portfolio CMS</p>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          <NavLinks />
          <div className="mt-auto pt-2">
            <LogoutButton className="w-full" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="outline" size="icon-sm" />}
            >
              <Menu className="size-4" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[18rem] p-0">
              <SheetHeader className="border-b border-zinc-200">
                <SheetTitle>Admin</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col gap-4 p-3">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <LogoutButton className="mt-auto w-full" />
              </div>
            </SheetContent>
          </Sheet>
          <p className="text-sm font-semibold">Portfolio CMS</p>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {hasMismatches && !bannerDismissed && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-medium text-amber-800 shadow-sm animate-in slide-in-from-top-4 duration-300 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 animate-bounce" />
                <span>
                  Your LinkedIn Profile and Portfolio data are out of sync.{" "}
                  <Link href="/admin/linkedin" className="font-semibold underline hover:text-amber-900 transition-colors">
                    Review and sync differences
                  </Link>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="rounded-lg p-1 hover:bg-amber-100 transition-colors shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="size-3.5 text-amber-600" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
