"use client";

import { useState } from "react";
import { useNotifications, useMarkNotificationsRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Notification } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications({ page });
  const markRead = useMarkNotificationsRead();
  const markAllRead = useMarkAllNotificationsRead();
  const router = useRouter();

  const handleMarkRead = (notif: Notification) => {
    if (!notif.is_read) {
      markRead.mutate([notif.id]);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
    toast.success("All notifications marked as read");
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
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your project activity
            </p>
          </div>
        </div>
        {data && data.unread_count > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>All Notifications</span>
            {data && (
              <span className="text-sm text-muted-foreground font-normal">
                {data.unread_count} unread of {data.total}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : data && data.notifications.length > 0 ? (
            <div className="space-y-1">
              {data.notifications.map((notif: Notification) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50",
                    !notif.is_read && "bg-primary/5 border border-primary/10"
                  )}
                >
                  <span className="text-xl mt-0.5">{getNotificationIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm", !notif.is_read && "font-semibold")}>{notif.title}</p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    {notif.message && (
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(notif.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {notif.type.replace(/_/g, " ")}
                    </span>
                    {!notif.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead.mutate([notif.id]);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;re all caught up!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
