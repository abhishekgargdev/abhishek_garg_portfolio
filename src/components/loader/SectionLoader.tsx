import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type SectionLoaderVariant = "card" | "list" | "table" | "text";

type SectionLoaderProps = {
  variant?: SectionLoaderVariant;
  /** Number of skeleton items / rows to render. */
  count?: number;
  className?: string;
};

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[16/10] w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex items-start gap-4 py-3">
      <Skeleton className="mt-0.5 size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

function TableSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex gap-3 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 flex-1", i === 0 && "max-w-[28%]", i === columns - 1 && "max-w-[12%]")}
        />
      ))}
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[92%]" />
      <Skeleton className="h-4 w-[88%]" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function SectionLoader({
  variant = "card",
  count,
  className,
}: SectionLoaderProps) {
  const itemCount =
    count ??
    (variant === "card" ? 6 : variant === "list" ? 4 : variant === "table" ? 5 : 1);

  if (variant === "card") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
          className,
        )}
        role="status"
        aria-label="Loading content"
        aria-busy="true"
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div
        className={cn("flex flex-col divide-y divide-border", className)}
        role="status"
        aria-label="Loading content"
        aria-busy="true"
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <ListSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={cn("w-full overflow-hidden rounded-lg border border-border", className)}
        role="status"
        aria-label="Loading table"
        aria-busy="true"
      >
        <div className="flex gap-3 border-b border-border bg-muted/40 px-4 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-border px-4">
          {Array.from({ length: itemCount }).map((_, i) => (
            <TableSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      {Array.from({ length: itemCount }).map((_, i) => (
        <TextSkeleton key={i} />
      ))}
    </div>
  );
}

export default SectionLoader;
