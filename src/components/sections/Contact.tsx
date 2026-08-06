"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Mail, Check, Phone, MapPin, Download } from "lucide-react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/contact-schema";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { AboutMeData } from "@/lib/about";

type ContactProps = {
  about: AboutMeData | null;
};

export function Contact({ about }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const socialLinks = about?.socialLinks ?? [];
  const github = socialLinks.find((link) => link.platform.toLowerCase().includes("github"))?.url;
  const linkedin = socialLinks.find((link) => link.platform.toLowerCase().includes("linkedin"))?.url;
  const email = about?.email || "abhishekgarg2063@gmail.com";
  const phone = about?.phone || "+91-8708292063";
  const location = about?.location || "Kaithal, Haryana, India";
  const resumeUrl = about?.resumeFileUrl || "/api/resume/download";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        toast.error(data.error || "Failed to send message");
        return;
      }

      toast.success(data.message || "Message sent successfully");
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 3000);
    } catch {
      toast.error("Unable to send your message right now");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-20 bg-muted/10 py-20 sm:py-28 overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 relative z-10">
        <SectionHeading
          eyebrow="Get in touch"
          title="Let's Connect"
          description="Have a project in mind, a question, or just want to say hello? Drop a message."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-start">
          {/* Left Column: Form */}
          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 rounded-2xl border border-border bg-card/85 p-5 shadow-sm sm:p-8 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  placeholder="Your name"
                  aria-invalid={Boolean(errors.name)}
                  disabled={isSubmitting}
                  className="focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-300 bg-card/50"
                  {...register("name")}
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  disabled={isSubmitting}
                  className="focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-300 bg-card/50"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                placeholder="What's this about?"
                aria-invalid={Boolean(errors.subject)}
                disabled={isSubmitting}
                className="focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-300 bg-card/50"
                {...register("subject")}
              />
              {errors.subject ? (
                <p className="text-sm text-destructive">
                  {errors.subject.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                rows={6}
                placeholder="Tell me a bit about your project or question…"
                className="min-h-32 resize-y focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all duration-300 bg-card/50"
                aria-invalid={Boolean(errors.message)}
                disabled={isSubmitting}
                {...register("message")}
              />
              {errors.message ? (
                <p className="text-sm text-destructive">
                  {errors.message.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full sm:w-auto shadow-sm bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white transition-all duration-300 hover:scale-[1.02]",
                isSuccess ? "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" : ""
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Sending…
                </>
              ) : isSuccess ? (
                <>
                  <Check className="size-4 animate-bounce" data-icon="inline-start" />
                  Sent!
                </>
              ) : (
                <>
                  <Send data-icon="inline-start" />
                  Send message
                </>
              )}
            </Button>
          </form>

          {/* Right Column: Contact Info Cards & Resume Box */}
          <div className="space-y-6">
            {/* Info card */}
            <div className="rounded-2xl border border-border bg-card/85 p-6 shadow-sm backdrop-blur-sm space-y-6">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Contact Info
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <a href={`mailto:${email}`} className="text-sm font-semibold hover:text-sky-600 dark:hover:text-sky-400 break-all transition-colors">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phone</p>
                    <a href={`tel:${phone}`} className="text-sm font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Location</p>
                    <p className="text-sm font-semibold text-foreground">
                      {location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social icons connection */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-3">Connect on Socials</p>
                <div className="flex items-center gap-3">
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-zinc-800 hover:bg-zinc-950 hover:text-white"
                    >
                      <FaGithub className="size-4" />
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                    >
                      <FaLinkedin className="size-4" />
                    </a>
                  )}
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-all duration-300 hover:scale-110 hover:border-teal-500 hover:bg-teal-600 hover:text-white"
                  >
                    <FaEnvelope className="size-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Resume CTA Box */}
            <div className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-sky-600 to-indigo-600 p-6 text-white shadow-md">
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <Download className="size-40" />
              </div>
              <div className="relative z-10">
                <h4 className="text-lg font-bold tracking-tight">Looking for my full credentials?</h4>
                <p className="mt-2 text-sm text-sky-100/90 leading-relaxed">
                  Download my official resume to view my complete professional history, certifications, and technical experience in detail.
                </p>
                <a
                  href={resumeUrl}
                  download
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md hover:bg-sky-50 cursor-pointer"
                >
                  <Download className="size-4 shrink-0" />
                  Download Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
