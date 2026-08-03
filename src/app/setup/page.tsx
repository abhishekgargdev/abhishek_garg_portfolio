"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLoader } from "@/components/loader/SectionLoader";
import { cn } from "@/lib/utils";

const setupSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetupValues = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const router = useRouter();
  const [statusLoading, setStatusLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/auth/setup/status");
        const data = (await response.json()) as {
          configured?: boolean;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to check setup status");
        }

        if (!cancelled) {
          setConfigured(Boolean(data.configured));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to check setup status",
          );
        }
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        toast.error(data.error || "Setup failed");
        if (response.status === 403) {
          setConfigured(true);
        }
        return;
      }

      toast.success(data.message || "Admin account created");
      setConfigured(true);
      router.push("/login");
    } catch {
      toast.error("Unable to complete setup right now");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">One-time admin setup</CardTitle>
          <CardDescription>
            Create the single admin account for this portfolio. This can only be
            done once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <SectionLoader variant="text" count={2} />
          ) : configured ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="size-6 text-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">
                  Setup already complete
                </p>
                <p className="text-sm text-muted-foreground">
                  An admin account already exists. Use the login page to sign
                  in.
                </p>
              </div>
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Creating admin…
                  </>
                ) : (
                  "Create admin account"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
