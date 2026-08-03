"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessageRow | null>(null);
  const [deleting, setDeleting] = useState<ContactMessageRow | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/messages");
      const data = (await response.json()) as {
        items?: ContactMessageRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to load messages");
      }
      setItems(data.items ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load messages",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const openMessage = async (message: ContactMessageRow) => {
    setSelected(message);

    if (message.isRead) return;

    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (!response.ok) return;

      setItems((prev) =>
        prev.map((item) =>
          item.id === message.id ? { ...item, isRead: true } : item,
        ),
      );
      setSelected((prev) =>
        prev && prev.id === message.id ? { ...prev, isRead: true } : prev,
      );
    } catch {
      // Non-blocking: reading still works even if mark-read fails.
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/messages/${deleting.id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete message");
      }
      toast.success("Message deleted");
      if (selected?.id === deleting.id) setSelected(null);
      setDeleting(null);
      await fetchMessages();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete message",
      );
    } finally {
      setBusy(false);
    }
  };

  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact form inbox
          {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}.
        </p>
      </div>

      {loading ? (
        <SectionLoader variant="table" count={6} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
          No messages yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[1%]" />
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer",
                    !item.isRead && "bg-teal-50/40",
                  )}
                  onClick={() => void openMessage(item)}
                >
                  <TableCell>
                    {item.isRead ? (
                      <MailOpen className="size-4 text-zinc-400" />
                    ) : (
                      <Mail className="size-4 text-teal-700" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-sm",
                          !item.isRead && "font-semibold text-zinc-900",
                        )}
                      >
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {item.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate",
                          !item.isRead && "font-medium text-zinc-900",
                        )}
                      >
                        {item.subject}
                      </span>
                      {!item.isRead ? (
                        <Badge variant="secondary">New</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-zinc-500">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete message"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleting(item);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  From {selected.name} ({selected.email}) ·{" "}
                  {formatDateTime(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">
                {selected.message}
              </div>
              <div className="flex justify-end gap-2">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Reply
                </a>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setDeleting(selected);
                  }}
                >
                  Delete
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the contact message from your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
