"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { CloudinaryUploader } from "@/components/admin/CloudinaryUploader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { getSkillIcon } from "@/lib/skill-icons";

export type CrudFieldType =
  | "text"
  | "email"
  | "url"
  | "number"
  | "date"
  | "textarea"
  | "string-list"
  | "tech-select"
  | "multi-image"
  | "results-list"
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
  tab?: string;
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

const TECH_SUGGESTIONS = [
  { key: "typescript", label: "TypeScript" },
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "go", label: "Go" },
  { key: "rust", label: "Rust" },
  { key: "react", label: "React" },
  { key: "nextjs", label: "Next.js" },
  { key: "nodejs", label: "Node.js" },
  { key: "express", label: "Express" },
  { key: "nestjs", label: "NestJS" },
  { key: "django", label: "Django" },
  { key: "flask", label: "Flask" },
  { key: "fastapi", label: "FastAPI" },
  { key: "graphql", label: "GraphQL" },
  { key: "mongodb", label: "MongoDB" },
  { key: "postgresql", label: "PostgreSQL" },
  { key: "mysql", label: "MySQL" },
  { key: "redis", label: "Redis" },
  { key: "firebase", label: "Firebase" },
  { key: "supabase", label: "Supabase" },
  { key: "docker", label: "Docker" },
  { key: "kubernetes", label: "Kubernetes" },
  { key: "aws", label: "AWS" },
  { key: "git", label: "Git" },
  { key: "github", label: "GitHub" },
  { key: "githubactions", label: "GitHub Actions" },
  { key: "tailwindcss", label: "TailwindCSS" },
  { key: "framermotion", label: "Framer Motion" },
  { key: "electron", label: "Electron" },
  { key: "openai", label: "OpenAI" },
  { key: "promptengineering", label: "Prompt Engineering" },
];

function StringListInput({
  value = [],
  onChange,
  placeholder,
  disabled,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const handleUpdate = (index: number, text: string) => {
    const copy = [...list];
    copy[index] = text;
    onChange(copy);
  };

  const handleAdd = () => {
    onChange([...list, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(list.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === list.length - 1) return;
    const copy = [...list];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      {list.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground animate-in fade-in duration-200">
            {index + 1}.
          </span>
          <Input
            value={item}
            onChange={(e) => handleUpdate(index, e.target.value)}
            placeholder={placeholder ?? `Item ${index + 1}`}
            disabled={disabled}
            className="h-9 flex-1 text-sm bg-background/50 dark:bg-input/20"
          />
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === 0 || disabled}
              onClick={() => handleMove(index, "up")}
              title="Move up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === list.length - 1 || disabled}
              onClick={() => handleMove(index, "down")}
              title="Move down"
            >
              <ChevronDown className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
              disabled={disabled}
              onClick={() => handleRemove(index)}
              title="Delete item"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={disabled}
        className="mt-1 h-8 w-full border-dashed text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="mr-1 size-3.5" />
        Add Item
      </Button>
    </div>
  );
}

function TechStackSelect({
  value = [],
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const list = Array.isArray(value) ? value : [];

  const handleAdd = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    if (!list.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...list, trimmed]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const handleRemove = (tech: string) => {
    onChange(list.filter((t) => t !== tech));
  };

  const filteredSuggestions = TECH_SUGGESTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) &&
      !list.some((t) => t.toLowerCase() === s.label.toLowerCase()),
  );

  const POPULAR_ITEMS = [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Docker",
    "AWS",
    "TailwindCSS",
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 min-h-[2.5rem] p-1.5 rounded-lg border border-input bg-background/50 dark:bg-input/10">
        {list.length === 0 ? (
          <span className="text-xs text-muted-foreground pl-1 py-1">
            No items selected
          </span>
        ) : (
          list.map((tech) => {
            const Icon = getSkillIcon(tech);
            return (
              <Badge
                key={tech}
                variant="secondary"
                className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 text-xs font-normal"
              >
                <Icon className="size-3.5" />
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(tech)}
                  disabled={disabled}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })
        )}
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search or add technology..."
            disabled={disabled}
            className="pl-9 h-9 bg-background/50 dark:bg-input/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (search.trim()) {
                  const exactMatch = TECH_SUGGESTIONS.find(
                    (s) => s.label.toLowerCase() === search.trim().toLowerCase(),
                  );
                  handleAdd(exactMatch ? exactMatch.label : search);
                }
              }
            }}
          />
        </div>

        {isOpen && (search.trim() || filteredSuggestions.length > 0) && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-40 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {filteredSuggestions.map((s) => {
                const Icon = getSkillIcon(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleAdd(s.label)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                  >
                    <Icon className="size-4" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
              {search.trim() &&
                !filteredSuggestions.some(
                  (s) => s.label.toLowerCase() === search.trim().toLowerCase(),
                ) && (
                  <button
                    type="button"
                    onClick={() => handleAdd(search)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-accent hover:text-accent-foreground text-left font-medium cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>Add custom &quot;{search}&quot;</span>
                  </button>
                )}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-1 select-none">
          Quick Add:
        </span>
        {POPULAR_ITEMS.map((item) => {
          const isSelected = list.some(
            (t) => t.toLowerCase() === item.toLowerCase(),
          );
          const Icon = getSkillIcon(item);
          if (isSelected) return null;
          return (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => handleAdd(item)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <Icon className="size-3" />
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiImageInput({
  value = [],
  onChange,
  disabled,
  section = "general",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  section?: UploadSection;
}) {
  const list = Array.isArray(value) ? value : [];

  const handleUploadComplete = (url: string) => {
    if (url && !list.includes(url)) {
      onChange([...list, url]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(list.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === list.length - 1) return;
    const copy = [...list];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <CloudinaryUploader
        section={section}
        onUploadComplete={handleUploadComplete}
        disabled={disabled}
        label=""
      />
      {list.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={index === 0 || disabled}
                  onClick={() => handleMove(index, "left")}
                  className="size-7 rounded-full"
                  title="Move left"
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={index === list.length - 1 || disabled}
                  onClick={() => handleMove(index, "right")}
                  className="size-7 rounded-full"
                  title="Move right"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                  className="size-7 rounded-full bg-destructive text-white hover:bg-destructive/90"
                  title="Remove image"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white select-none">
                {index === 0 ? "Cover" : index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsListInput({
  value = [],
  onChange,
  disabled,
}: {
  value: { label: string; value: string }[];
  onChange: (val: { label: string; value: string }[]) => void;
  disabled?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const handleUpdate = (index: number, key: "label" | "value", text: string) => {
    const copy = [...list];
    copy[index] = { ...copy[index], [key]: text };
    onChange(copy);
  };

  const handleAdd = () => {
    onChange([...list, { label: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(list.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === list.length - 1) return;
    const copy = [...list];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {list.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 border p-2 rounded-lg bg-muted/10"
        >
          <div className="grid grid-cols-2 gap-2 flex-1">
            <Input
              value={item.value}
              onChange={(e) => handleUpdate(index, "value", e.target.value)}
              placeholder="Value (e.g. 50%, 10k+)"
              disabled={disabled}
              className="h-9 text-sm"
            />
            <Input
              value={item.label}
              onChange={(e) => handleUpdate(index, "label", e.target.value)}
              placeholder="Label (e.g. Load time reduced)"
              disabled={disabled}
              className="h-9 text-sm"
            />
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === 0 || disabled}
              onClick={() => handleMove(index, "up")}
              title="Move up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === list.length - 1 || disabled}
              onClick={() => handleMove(index, "down")}
              title="Move down"
            >
              <ChevronDown className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
              disabled={disabled}
              onClick={() => handleRemove(index)}
              title="Delete metric"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={disabled}
        className="mt-1 h-8 w-full border-dashed text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="mr-1 size-3.5" />
        Add Metric / KPI
      </Button>
    </div>
  );
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

  const renderField = (field: CrudFieldConfig<FormValues>) => {
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
              <StringListInput
                placeholder={field.placeholder}
                disabled={submitting}
                value={
                  Array.isArray(controllerField.value)
                    ? controllerField.value
                    : []
                }
                onChange={(val) => controllerField.onChange(val)}
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

    if (field.type === "tech-select") {
      return (
        <div key={String(field.name)} className="space-y-2">
          <Label htmlFor={String(field.name)}>{field.label}</Label>
          <Controller
            control={control}
            name={field.name}
            render={({ field: controllerField }) => (
              <TechStackSelect
                disabled={submitting}
                value={
                  Array.isArray(controllerField.value)
                    ? controllerField.value
                    : []
                }
                onChange={(val) => controllerField.onChange(val)}
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

    if (field.type === "multi-image") {
      return (
        <div key={String(field.name)} className="space-y-2">
          <Label htmlFor={String(field.name)}>{field.label}</Label>
          <Controller
            control={control}
            name={field.name}
            render={({ field: controllerField }) => (
              <MultiImageInput
                section={field.uploadSection ?? "general"}
                disabled={submitting}
                value={
                  Array.isArray(controllerField.value)
                    ? controllerField.value
                    : []
                }
                onChange={(urls) => controllerField.onChange(urls)}
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

    if (field.type === "results-list") {
      return (
        <div key={String(field.name)} className="space-y-2">
          <Label htmlFor={String(field.name)}>{field.label}</Label>
          <Controller
            control={control}
            name={field.name}
            render={({ field: controllerField }) => (
              <ResultsListInput
                disabled={submitting}
                value={
                  Array.isArray(controllerField.value)
                    ? controllerField.value
                    : []
                }
                onChange={(val) => controllerField.onChange(val)}
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
  };

  const tabsList = useMemo(() => {
    const list: string[] = [];
    fields.forEach((f) => {
      if (f.tab && !list.includes(f.tab)) {
        list.push(f.tab);
      }
    });
    return list;
  }, [fields]);

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
          {tabsList.length > 0 ? (
            <Tabs defaultValue={tabsList[0]} className="w-full flex-col gap-4">
              <TabsList className="w-full flex flex-row overflow-x-auto justify-start border-b border-border bg-transparent p-0 rounded-none h-auto gap-2 scrollbar-none pb-2">
                {tabsList.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-3 py-1.5 text-sm border-b-2 rounded-none data-[state=active]:border-primary data-active:border-primary data-active:bg-transparent dark:data-active:bg-transparent cursor-pointer font-semibold"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabsList.map((tab) => (
                <TabsContent
                  key={tab}
                  value={tab}
                  className="space-y-4 pt-2 animate-in fade-in duration-200"
                >
                  {fields
                    .filter((f) => f.tab === tab)
                    .map((field) => renderField(field))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            fields.map((field) => renderField(field))
          )}

          <DialogFooter className="border-t border-border pt-4 mt-6">
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
