"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ExperienceWatches } from "@/components/sections/ExperienceWatches";
import { SectionLoader } from "@/components/loader/SectionLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  formatDurationShort,
  formatPeriodRange,
  periodsForRelevant,
  periodsForTotal,
  sumPeriodDurations,
  type ExperienceTenureData,
  type TenurePeriodData,
} from "@/lib/experience-tenure-utils";
import { cn } from "@/lib/utils";

const periodSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  company: z.string().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().nullable(),
  ongoing: z.boolean().default(false),
  countsTotal: z.boolean().default(true),
  countsRelevant: z.boolean().default(false),
});

const formSchema = z
  .object({
    totalLabel: z.string().trim().min(1, "Label is required"),
    relevantLabel: z.string().trim().min(1, "Label is required"),
    periods: z.array(periodSchema).min(1, "Add at least one period"),
  })
  .superRefine((data, ctx) => {
    if (!data.periods.some((period) => period.countsTotal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one period must count toward Total",
        path: ["periods"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;
type FormPeriod = FormValues["periods"][number];

function toDateInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toFormPeriod(period: TenurePeriodData): FormPeriod {
  return {
    title: period.title,
    company: period.company,
    startDate: toDateInput(period.startDate),
    endDate: period.endDate ? toDateInput(period.endDate) : null,
    ongoing: !period.endDate,
    countsTotal: period.countsTotal,
    countsRelevant: period.countsRelevant,
  };
}

function emptyPeriod(): FormPeriod {
  return {
    title: "",
    company: "",
    startDate: "",
    endDate: null,
    ongoing: true,
    countsTotal: true,
    countsRelevant: false,
  };
}

function stripForApi(period: FormPeriod) {
  return {
    title: period.title.trim(),
    company: period.company.trim(),
    startDate: period.startDate,
    endDate: period.ongoing ? null : period.endDate || null,
    countsTotal: period.countsTotal,
    countsRelevant: period.countsRelevant,
  };
}

function ClockBadge({ kind }: { kind: "total" | "relevant" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 border-transparent px-1.5 text-[0.65rem] font-semibold tracking-wide uppercase",
        kind === "total"
          ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
          : "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      )}
    >
      {kind === "total" ? "Total" : "Relevant"}
    </Badge>
  );
}

function PeriodAccordionRow({
  index,
  expanded,
  onToggle,
  canRemove,
  canMoveUp,
  canMoveDown,
  onRemove,
  onMoveUp,
  onMoveDown,
  register,
  control,
  setValue,
  errors,
}: {
  index: number;
  expanded: boolean;
  onToggle: () => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  errors: FieldErrors<FormValues>;
}) {
  const period = useWatch({ control, name: `periods.${index}` });
  const ongoing = Boolean(period?.ongoing);
  const fieldErrors = errors.periods?.[index];

  const durationChip = useMemo(() => {
    if (!period?.startDate) return "—";
    return formatDurationShort(
      sumPeriodDurations(
        [
          {
            startDate: period.startDate,
            endDate: period.ongoing ? null : period.endDate,
          },
        ],
        new Date(),
      ),
    );
  }, [period]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card transition-colors",
        expanded && "border-teal-500/30 ring-1 ring-teal-500/15",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        className="flex cursor-pointer items-center gap-2 px-3 py-2.5 hover:bg-muted/50 sm:gap-3 sm:px-4"
      >
        <div className="flex shrink-0 flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move period ${index + 1} up`}
            disabled={!canMoveUp}
            onClick={onMoveUp}
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Move period ${index + 1} down`}
            disabled={!canMoveDown}
            onClick={onMoveDown}
          >
            <ArrowDown className="size-3.5" />
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {period?.title?.trim() || `Period ${index + 1}`}
            </p>
            {period?.countsTotal ? <ClockBadge kind="total" /> : null}
            {period?.countsRelevant ? <ClockBadge kind="relevant" /> : null}
            {!period?.countsTotal && !period?.countsRelevant ? (
              <Badge variant="outline" className="h-5 text-[0.65rem] text-muted-foreground">
                Unused
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[period?.company?.trim(), formatPeriodRange(period?.startDate, period?.ongoing ? null : period?.endDate)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <span className="hidden shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-xs tabular-nums text-muted-foreground sm:inline">
          {durationChip}
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </div>

      {expanded ? (
        <div className="space-y-3 border-t border-border bg-muted/20 px-3 py-3 sm:px-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title / focus</Label>
              <Input
                placeholder="Senior Full Stack / MERN"
                {...register(`periods.${index}.title`)}
              />
              {fieldErrors?.title ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.title.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-muted-foreground">Company (optional)</Label>
              <Input
                placeholder="Talentelgia Technologies"
                className="placeholder:text-muted-foreground/50"
                {...register(`periods.${index}.company`)}
              />
            </div>

            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" {...register(`periods.${index}.startDate`)} />
                {fieldErrors?.startDate ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.startDate.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input
                  type="date"
                  disabled={ongoing}
                  {...register(`periods.${index}.endDate`)}
                />
              </div>
              <div className="flex items-end">
                <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                  <span className="text-sm font-medium">Ongoing</span>
                  <Switch
                    checked={ongoing}
                    onCheckedChange={(checked) => {
                      setValue(`periods.${index}.ongoing`, checked, {
                        shouldDirty: true,
                      });
                      if (checked) {
                        setValue(`periods.${index}.endDate`, null, {
                          shouldDirty: true,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-foreground">Counts toward</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(period?.countsTotal)}
                    onCheckedChange={(checked) => {
                      setValue(`periods.${index}.countsTotal`, Boolean(checked), {
                        shouldDirty: true,
                      });
                    }}
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <ClockBadge kind="total" />
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(period?.countsRelevant)}
                    onCheckedChange={(checked) => {
                      setValue(
                        `periods.${index}.countsRelevant`,
                        Boolean(checked),
                        { shouldDirty: true },
                      );
                    }}
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <ClockBadge kind="relevant" />
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={!canRemove}
              onClick={onRemove}
            >
              <Trash2 data-icon="inline-start" />
              Delete period
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ExperienceTenureEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ExperienceTenureData | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      totalLabel: "Total Experience",
      relevantLabel: "Relevant Experience",
      periods: [emptyPeriod()],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "periods",
  });

  const values = useWatch({ control });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/experience-tenure");
      const data = (await response.json()) as {
        item?: ExperienceTenureData | null;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load tenure settings");
      }

      const item = data.item;
      if (item) {
        setPreview(item);
        reset({
          totalLabel: item.totalLabel,
          relevantLabel: item.relevantLabel,
          periods: item.periods.length
            ? item.periods.map(toFormPeriod)
            : [emptyPeriod()],
        });
        setExpanded(new Set());
      } else {
        setPreview(null);
        reset({
          totalLabel: "Total Experience",
          relevantLabel: "Relevant Experience",
          periods: [
            {
              title: "Career start",
              company: "Talentelgia Technologies",
              startDate: "2022-01-01",
              endDate: null,
              ongoing: true,
              countsTotal: true,
              countsRelevant: true,
            },
          ],
        });
        setExpanded(new Set([0]));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load tenure",
      );
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void load();
  }, [load]);

  const livePreview = useMemo<ExperienceTenureData | null>(() => {
    const periods = ((values.periods ?? []) as FormPeriod[])
      .filter((period) => Boolean(period?.startDate))
      .map(
        (period, index): TenurePeriodData => ({
          id: `period-${index}`,
          title: period.title || `Period ${index + 1}`,
          company: period.company || "",
          startDate: new Date(period.startDate).toISOString(),
          endDate:
            period.ongoing || !period.endDate
              ? null
              : new Date(period.endDate).toISOString(),
          countsTotal: Boolean(period.countsTotal),
          countsRelevant: Boolean(period.countsRelevant),
        }),
      );

    if (!periods.length) return preview;

    return {
      id: preview?.id ?? "preview",
      totalLabel: values.totalLabel || "Total Experience",
      relevantLabel: values.relevantLabel || "Relevant Experience",
      periods,
      updatedAt: preview?.updatedAt,
    };
  }, [values, preview]);

  const summary = useMemo(() => {
    if (!livePreview) return null;
    const now = new Date();
    const totalPeriods = periodsForTotal(livePreview.periods);
    const relevantPeriods = periodsForRelevant(livePreview.periods);
    return {
      count: livePreview.periods.length,
      total: formatDurationShort(sumPeriodDurations(totalPeriods, now)),
      relevant: formatDurationShort(sumPeriodDurations(relevantPeriods, now)),
      updatedAt: livePreview.updatedAt
        ? new Date(livePreview.updatedAt).toLocaleString()
        : "Not saved yet",
    };
  }, [livePreview]);

  const filteredIndexes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const periods = (values.periods ?? []) as FormPeriod[];
    if (!needle) return fields.map((_, index) => index);
    return fields
      .map((_, index) => index)
      .filter((index) => {
        const period = periods[index];
        if (!period) return false;
        return (
          period.title?.toLowerCase().includes(needle) ||
          period.company?.toLowerCase().includes(needle)
        );
      });
  }, [fields, values.periods, query]);

  const toggleExpanded = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const onSubmit = async (formValues: FormValues) => {
    setSaving(true);
    try {
      const payload = {
        totalLabel: formValues.totalLabel,
        relevantLabel: formValues.relevantLabel,
        periods: formValues.periods.map(stripForApi),
      };

      const response = await fetch("/api/admin/experience-tenure", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        item?: ExperienceTenureData;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Experience clocks saved");
      if (data.item) setPreview(data.item);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const SaveButton = ({ className }: { className?: string }) => (
    <Button
      type="button"
      className={className}
      onClick={handleSubmit(onSubmit)}
      disabled={saving || (!isDirty && Boolean(preview))}
    >
      {saving ? (
        <>
          <Loader2 className="animate-spin" data-icon="inline-start" />
          Saving…
        </>
      ) : (
        <>
          <Save data-icon="inline-start" />
          Save clocks
        </>
      )}
    </Button>
  );

  if (loading) {
    return <SectionLoader variant="text" count={4} className="max-w-3xl" />;
  }

  return (
    <div className="relative space-y-6 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Experience Clocks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One list of periods — toggle which clocks each period counts toward.
          </p>
        </div>
        <SaveButton />
      </div>

      {summary ? (
        <div className="grid gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Periods
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {summary.count}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {summary.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Relevant
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {summary.relevant}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Last saved
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{summary.updatedAt}</p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]"
        noValidate
      >
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Periods</CardTitle>
                  <CardDescription className="mt-1">
                    Collapsed by default. Expand a row to edit.{" "}
                    <ClockBadge kind="total" /> /{" "}
                    <ClockBadge kind="relevant" /> badges show which clock(s)
                    a period feeds. Ongoing roles count until today.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextIndex = fields.length;
                    append(emptyPeriod());
                    setExpanded((prev) => new Set(prev).add(nextIndex));
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Add period
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="totalLabel">Total watch label</Label>
                  <Input id="totalLabel" {...register("totalLabel")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="relevantLabel">Relevant watch label</Label>
                  <Input id="relevantLabel" {...register("relevantLabel")} />
                </div>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by title or company…"
                  className="pl-9"
                />
              </div>

              {errors.periods?.root || errors.periods?.message ? (
                <p className="text-sm text-destructive">
                  {errors.periods.root?.message ?? errors.periods.message}
                </p>
              ) : null}

              {filteredIndexes.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  {query.trim()
                    ? "No periods match your filter."
                    : "No periods yet. Add your first role."}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredIndexes.map((index) => (
                    <PeriodAccordionRow
                      key={fields[index]?.id ?? index}
                      index={index}
                      expanded={expanded.has(index)}
                      onToggle={() => toggleExpanded(index)}
                      canRemove={fields.length > 1}
                      canMoveUp={index > 0}
                      canMoveDown={index < fields.length - 1}
                      onRemove={() => {
                        remove(index);
                        setExpanded((prev) => {
                          const next = new Set<number>();
                          for (const value of prev) {
                            if (value === index) continue;
                            next.add(value > index ? value - 1 : value);
                          }
                          return next;
                        });
                      }}
                      onMoveUp={() => {
                        if (index <= 0) return;
                        move(index, index - 1);
                        setExpanded((prev) => {
                          const next = new Set<number>();
                          for (const value of prev) {
                            if (value === index) next.add(index - 1);
                            else if (value === index - 1) next.add(index);
                            else next.add(value);
                          }
                          return next;
                        });
                      }}
                      onMoveDown={() => {
                        if (index >= fields.length - 1) return;
                        move(index, index + 1);
                        setExpanded((prev) => {
                          const next = new Set<number>();
                          for (const value of prev) {
                            if (value === index) next.add(index + 1);
                            else if (value === index + 1) next.add(index);
                            else next.add(value);
                          }
                          return next;
                        });
                      }}
                      register={register}
                      control={control}
                      setValue={setValue}
                      errors={errors}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 xl:sticky xl:top-20 xl:self-start">
          <p className="text-sm font-medium text-foreground">
            Homepage live preview
          </p>
          <div className="overflow-hidden rounded-xl border border-border">
            {livePreview ? (
              <ExperienceWatches tenure={livePreview} />
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Add at least one period with a start date to preview.
              </p>
            )}
          </div>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="hidden text-sm text-muted-foreground sm:block">
            {isDirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <SaveButton className="ml-auto" />
        </div>
      </div>
    </div>
  );
}

export default ExperienceTenureEditor;
