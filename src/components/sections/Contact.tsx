"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/contact-schema";

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      reset();
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
      className="relative scroll-mt-20 bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-500 uppercase">
            Get in touch
          </p>
          <h2
            id="contact-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            Contact
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:text-lg">
            Have a project or question? Send a message and I&apos;ll get back to
            you.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-12 space-y-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 shadow-sm sm:mt-14 sm:p-8"
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
              className="min-h-32 resize-y"
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
            className="w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Sending…
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
