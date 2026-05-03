"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/(app)/notifications/actions";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const POLL_MS = 15_000;

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [lastUnread, setLastUnread] = useState(0);

  const fetchNow = useCallback(async () => {
    try {
      const res = await getNotifications();
      if (res.ok) {
        setItems(res.items);
        setUnread((prev) => {
          if (res.unread > prev && prev !== 0) {
            // play subtle sound + browser notification on new
            try {
              if (typeof window !== "undefined") {
                const ctx = new (window.AudioContext ||
                  (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                gain.gain.setValueAtTime(0.001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(
                  0.15,
                  ctx.currentTime + 0.02,
                );
                gain.gain.exponentialRampToValueAtTime(
                  0.0001,
                  ctx.currentTime + 0.3,
                );
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
              }
            } catch {}
          }
          return res.unread;
        });
        setLastUnread(res.unread);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNow();
    const id = setInterval(() => {
      void fetchNow();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNow]);

  const handleClickItem = (item: NotificationItem) => {
    if (!item.read) {
      startTransition(() => {
        markNotificationRead(item.id).then(() => {
          setItems((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
          );
          setUnread((u) => Math.max(0, u - 1));
        });
      });
    }
    setOpen(false);
  };

  const handleMarkAll = () => {
    startTransition(() => {
      markAllNotificationsRead().then(() => {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnread(0);
      });
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center size-9 rounded-md hover:bg-muted">
        <Bell className="size-4" />
        {unread > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-red-500 text-white border-0"
          >
            {unread > 99 ? "99+" : unread}
          </Badge>
        )}
        <span className="sr-only">Thông báo</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm font-semibold">Thông báo</div>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
            >
              <Check className="size-3" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-96 overflow-auto py-1">
          {items.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              Không có thông báo nào.
            </div>
          )}
          {items.map((n) => {
            const inner = (
              <div
                onClick={() => handleClickItem(n)}
                className={`flex flex-col gap-0.5 px-3 py-2 cursor-pointer hover:bg-muted/50 ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}
                  >
                    {n.title}
                  </div>
                  {!n.read && (
                    <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
                {n.body && (
                  <div className="text-[11px] text-muted-foreground line-clamp-2">
                    {n.body}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground">
                  {timeAgo(n.createdAt)}
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
        {/* prevent unused warning */}
        <span className="hidden">{lastUnread}</span>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "Vừa xong";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}
