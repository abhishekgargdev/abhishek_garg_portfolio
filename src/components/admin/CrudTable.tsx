"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type CrudColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type CrudTableProps<T extends { id: string }> = {
  columns: CrudColumn<T>[];
  data: T[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  onMoveUp?: (row: T) => void;
  onMoveDown?: (row: T) => void;
  reorderDisabled?: boolean;
  emptyMessage?: string;
  className?: string;
};

export function CrudTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  reorderDisabled = false,
  emptyMessage = "No records yet.",
  className,
}: CrudTableProps<T>) {
  const canReorder = Boolean(onMoveUp && onMoveDown);

  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200 bg-white",
        className,
      )}
    >
      <div className="-mx-0 max-w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {canReorder ? (
              <TableHead className="w-[1%]">Order</TableHead>
            ) : null}
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.id}>
              {canReorder ? (
                <TableCell>
                  <div className="inline-flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onMoveUp?.(row)}
                      disabled={reorderDisabled || index === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onMoveDown?.(row)}
                      disabled={reorderDisabled || index === data.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              ) : null}
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render
                    ? column.render(row)
                    : String(
                        (row as Record<string, unknown>)[column.key] ?? "",
                      )}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="inline-flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(row)}
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(row)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

export default CrudTable;
