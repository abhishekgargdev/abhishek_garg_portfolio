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
import { Button } from "@/components/ui/button";
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
  replyMessage?: string;
  repliedAt?: string;
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
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

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
    setReplyText("");

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

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const response = await fetch(`/api/admin/messages/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });
      const data = (await response.json()) as {
        item?: ContactMessageRow;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reply");
      }
      toast.success("Reply sent successfully");
      
      const nowStr = new Date().toISOString();
      
      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? { ...item, isRead: true, replyMessage: replyText, repliedAt: nowStr }
            : item,
        ),
      );
      setSelected((prev) =>
        prev && prev.id === selected.id
          ? { ...prev, isRead: true, replyMessage: replyText, repliedAt: nowStr }
          : prev,
      );
      setReplyText("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reply",
      );
    } finally {
      setReplying(false);
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
                        <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-teal-200">New</Badge>
                      ) : null}
                      {item.repliedAt ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">Replied</Badge>
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
        <DialogContent className="sm:max-w-lg gap-5">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
                <DialogDescription>
                  From {selected.name} ({selected.email}) ·{" "}
                  {formatDateTime(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">
                  {selected.message}
                </div>

                {selected.replyMessage ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 text-sm leading-relaxed text-zinc-700 animate-in fade-in duration-300">
                    <p className="font-semibold text-xs text-emerald-700 uppercase tracking-wide mb-1">
                      Your Reply on {formatDateTime(selected.repliedAt!)}
                    </p>
                    <p className="whitespace-pre-wrap">{selected.replyMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col">
                    <label htmlFor="admin-reply-textarea" className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      Compose Email Reply
                    </label>
                    <textarea
                      id="admin-reply-textarea"
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={replying}
                      placeholder="Type your response here..."
                      className="w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-teal-500 focus:outline-none bg-white text-zinc-800 disabled:opacity-50 transition-colors placeholder:text-zinc-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3">
                {!selected.replyMessage ? (
                  <Button
                    type="button"
                    onClick={sendReply}
                    disabled={!replyText.trim() || replying}
                  >
                    {replying ? "Sending..." : "Send Reply"}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={replying}
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={replying}
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
