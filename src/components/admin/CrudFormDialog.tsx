"use client";

import { useEffect } from "react";
import {
  Controller,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { CloudinaryUploader } from "@/components/admin/CloudinaryUploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UploadSection } from "@/lib/upload-sections";

export type CrudFieldType =
  | "text"
  | "email"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "string-list"
  | "image"
  | "select";

export type CrudFieldConfig<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type: CrudFieldType;
  placeholder?: string;
  description?: string;
  uploadSection?: UploadSection;
  /** Options for `type: "select"`. */
  options?: { value: string; label: string }[];
};

type CrudFormDialogProps<TSchema extends z.ZodType> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: TSchema;
  fields: CrudFieldConfig<z.infer<TSchema> & FieldValues>[];
  defaultValues: DefaultValues<z.infer<TSchema> & FieldValues>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
  submitting?: boolean;
};

function toDateInputValue(value: unknown): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function CrudFormDialog<TSchema extends z.ZodType>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitting = false,
}: CrudFormDialogProps<TSchema>) {
  type FormValues = z.infer<TSchema> & FieldValues;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {fields.map((field) => {
            const error = errors[field.name];
            const message =
              error && typeof error === "object" && "message" in error
                ? String(error.message ?? "")
                : "";

            if (field.type === "image") {
              const value = watch(field.name);
              return (
                <div key={String(field.name)} className="space-y-2">
                  <CloudinaryUploader
                    section={field.uploadSection ?? "general"}
                    label={field.label}
                    value={typeof value === "string" ? value : ""}
                    onUploadComplete={(url) =>
                      setValue(field.name, url as never, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={submitting}
                  />
                  {message ? (
                    <p className="text-sm text-destructive">{message}</p>
                  ) : null}
                </div>
              );
            }

            if (field.type === "string-list") {
              return (
                <div key={String(field.name)} className="space-y-2">
                  <Label htmlFor={String(field.name)}>{field.label}</Label>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: controllerField }) => (
                      <Textarea
                        id={String(field.name)}
                        placeholder={
                          field.placeholder ?? "One item per line"
                        }
                        disabled={submitting}
                        aria-invalid={Boolean(message)}
                        value={
                          Array.isArray(controllerField.value)
                            ? controllerField.value.join("\n")
                            : ""
                        }
                        onChange={(event) => {
                          const lines = event.target.value
                            .split("\n")
                            .map((line) => line.trimEnd());
                          controllerField.onChange(lines);
                        }}
                      />
                    )}
                  />
                  {field.description ? (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}
                  {message ? (
                    <p className="text-sm text-destructive">{message}</p>
                  ) : null}
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={String(field.name)} className="space-y-2">
                  <Label htmlFor={String(field.name)}>{field.label}</Label>
                  <select
                    id={String(field.name)}
                    disabled={submitting}
                    aria-invalid={Boolean(message)}
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                    {...register(field.name)}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {field.description ? (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  ) : null}
                  {message ? (
                    <p className="text-sm text-destructive">{message}</p>
                  ) : null}
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={String(field.name)} className="space-y-2">
                  <Label htmlFor={String(field.name)}>{field.label}</Label>
                  <Textarea
                    id={String(field.name)}
                    placeholder={field.placeholder}
                    disabled={submitting}
                    aria-invalid={Boolean(message)}
                    {...register(field.name)}
                  />
                  {message ? (
                    <p className="text-sm text-destructive">{message}</p>
                  ) : null}
                </div>
              );
            }

            if (field.type === "date") {
              return (
                <div key={String(field.name)} className="space-y-2">
                  <Label htmlFor={String(field.name)}>{field.label}</Label>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: controllerField }) => (
                      <Input
                        id={String(field.name)}
                        type="date"
                        disabled={submitting}
                        aria-invalid={Boolean(message)}
                        value={toDateInputValue(controllerField.value)}
                        onChange={(event) =>
                          controllerField.onChange(event.target.value)
                        }
                      />
                    )}
                  />
                  {message ? (
                    <p className="text-sm text-destructive">{message}</p>
                  ) : null}
                </div>
              );
            }

            return (
              <div key={String(field.name)} className="space-y-2">
                <Label htmlFor={String(field.name)}>{field.label}</Label>
                <Input
                  id={String(field.name)}
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "email"
                        ? "email"
                        : field.type === "url"
                          ? "url"
                          : "text"
                  }
                  placeholder={field.placeholder}
                  disabled={submitting}
                  aria-invalid={Boolean(message)}
                  {...register(field.name, {
                    valueAsNumber: field.type === "number",
                  })}
                />
                {message ? (
                  <p className="text-sm text-destructive">{message}</p>
                ) : null}
              </div>
            );
          })}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CrudFormDialog;
