"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Mail, Check } from "lucide-react";
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

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      className="relative scroll-mt-20 bg-muted/30 py-20 sm:py-28 overflow-hidden"
    >
      {/* Decorative floating mail icon */}
      <div className="absolute top-10 right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none hidden lg:block z-0">
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Mail className="size-60" />
        </motion.div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-10 relative z-10">
        <SectionHeading
          eyebrow="Get in touch"
          title="Contact"
          description="Have a project or question? Send a message and I'll get back to you."
        />

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-12 space-y-5 rounded-2xl border border-border bg-card/80 p-5 shadow-sm sm:mt-14 sm:p-8 backdrop-blur-sm"
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
                className="focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-card/50"
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
                className="focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-card/50"
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
              className="focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-card/50"
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
              className="min-h-32 resize-y focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-card/50"
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
              "w-full sm:w-auto shadow-sm transition-all duration-300",
              isSuccess ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
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
      </div>
    </section>
  );
}

export default Contact;
