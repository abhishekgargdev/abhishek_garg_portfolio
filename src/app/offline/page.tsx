import Link from "next/link";
import { WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Offline",
  description: "You appear to be offline.",
};

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm">
        <WifiOff className="size-6" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        You&apos;re offline
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
        This page isn&apos;t available without a connection. Check your network
        and try again — previously visited pages may still work.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
        Back to home
      </Link>
    </main>
  );
}
