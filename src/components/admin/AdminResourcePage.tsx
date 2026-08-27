"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DefaultValues, FieldValues } from "react-hook-form";
import type { z } from "zod";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CrudFormDialog,
  type CrudFieldConfig,
} from "@/components/admin/CrudFormDialog";
import { CrudTable, type CrudColumn } from "@/components/admin/CrudTable";
import { SectionLoader } from "@/components/loader/SectionLoader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type AdminResourcePageProps<
  TRow extends { id: string },
  TSchema extends z.ZodType,
> = {
  title: string;
  description?: string;
  resource: string;
  columns: CrudColumn<TRow>[];
  fields: CrudFieldConfig<z.infer<TSchema> & FieldValues>[];
  schema: TSchema;
  emptyValues: DefaultValues<z.infer<TSchema> & FieldValues>;
  toFormValues?: (
    row: TRow,
  ) => DefaultValues<z.infer<TSchema> & FieldValues>;
  toPayload?: (values: z.infer<TSchema>) => unknown;
  maxRecords?: number;
  emptyMessage?: string;
  /** Enable up/down reorder using the `order` field. */
  enableReorder?: boolean;
};

export function AdminResourcePage<
  TRow extends { id: string; order?: number },
  TSchema extends z.ZodType,
>({
  title,
  description,
  resource,
  columns,
  fields,
  schema,
  emptyValues,
  toFormValues,
  toPayload,
  maxRecords,
  emptyMessage,
  enableReorder = false,
}: AdminResourcePageProps<TRow, TSchema>) {
  const [rows, setRows] = useState<TRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TRow | null>(null);
  const [deleting, setDeleting] = useState<TRow | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/${resource}`);
      const data = (await response.json()) as {
        items?: TRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load records");
      }
      setRows(data.items ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load records",
      );
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const formDefaults = useMemo(() => {
    if (editing && toFormValues) return toFormValues(editing);
    if (editing) {
      return {
        ...emptyValues,
        ...editing,
      } as DefaultValues<z.infer<TSchema> & FieldValues>;
    }
    return emptyValues;
  }, [editing, emptyValues, toFormValues]);

  const canAdd = maxRecords === undefined || rows.length < maxRecords;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row: TRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = async (values: z.infer<TSchema>) => {
    setSubmitting(true);
    try {
      const payload = toPayload ? toPayload(values) : values;
      const response = await fetch(
        editing
          ? `/api/admin/${resource}/${editing.id}`
          : `/api/admin/${resource}`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }
      toast.success(editing ? "Updated successfully" : "Created successfully");
      setFormOpen(false);
      setEditing(null);
      await fetchRows();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/${resource}/${deleting.id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete");
      }
      toast.success("Deleted successfully");
      setDeleting(null);
      await fetchRows();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const moveRow = async (row: TRow, direction: "up" | "down") => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) return;

    const next = [...rows];
    const current = next[index];
    const neighbor = next[swapIndex];
    next[index] = neighbor;
    next[swapIndex] = current;

    const updates = next.map((item, order) => ({
      id: item.id,
      order,
    }));

    setReordering(true);
    setRows(
      next.map((item, order) => ({
        ...item,
        order,
      })),
    );

    try {
      const response = await fetch(`/api/admin/${resource}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to reorder");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reorder",
      );
      await fetchRows();
    } finally {
      setReordering(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={!canAdd || loading}
        >
          <Plus data-icon="inline-start" />
          Add New
        </Button>
      </div>

      {loading ? (
        <SectionLoader variant="table" count={5} />
      ) : (
        <CrudTable
          columns={columns}
          data={rows}
          onEdit={openEdit}
          onDelete={setDeleting}
          onMoveUp={enableReorder ? (row) => void moveRow(row, "up") : undefined}
          onMoveDown={
            enableReorder ? (row) => void moveRow(row, "down") : undefined
          }
          reorderDisabled={reordering || submitting}
          emptyMessage={emptyMessage}
        />
      )}

      <CrudFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? `Edit ${title}` : `Add ${title}`}
        description={
          editing
            ? "Update this record and save your changes."
            : "Fill in the fields to create a new record."
        }
        schema={schema}
        fields={fields}
        defaultValues={formDefaults}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={submitting}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export default AdminResourcePage;
