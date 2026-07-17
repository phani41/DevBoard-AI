"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadCount, useNotifications, useMarkNotificationsRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Notification } from "@/types";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useUnreadCount();
  const { data: notifData, isLoading } = useNotifications({ page: 1 });
  const markRead = useMarkNotificationsRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.unread_count || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = (ids: number[]) => {
    markRead.mutate(ids);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned": return "📋";
      case "comment_added": return "💬";
      case "invitation": return "✉️";
      case "project_update": return "📊";
      case "due_date_reminder": return "⏰";
      case "password_changed": return "🔒";
      default: return "🔔";
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse-slow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-card border border-border rounded-xl shadow-2xl z-[100] overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifData && notifData.notifications.length > 0 ? (
              notifData.notifications.slice(0, 20).map((notif: Notification) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer border-b border-border/50",
                    !notif.is_read && "bg-primary/5"
                  )}
                  onClick={() => {
                    if (!notif.is_read) handleMarkRead([notif.id]);
                    setOpen(false);
                  }}
                >
                  <span className="text-lg mt-0.5">{getNotificationIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{formatDate(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>

          {notifData && notifData.notifications.length > 0 && (
            <div className="p-2 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
