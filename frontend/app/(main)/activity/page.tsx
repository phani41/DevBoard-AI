"use client";

import { useState } from "react";
import { useGlobalActivity } from "@/hooks/useActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Activity, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { ActivityLog } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  project_created: { label: "Project Created", color: "bg-purple-500" },
  project_updated: { label: "Project Updated", color: "bg-purple-400" },
  task_created: { label: "Task Created", color: "bg-blue-500" },
  task_updated: { label: "Task Updated", color: "bg-blue-400" },
  task_deleted: { label: "Task Deleted", color: "bg-red-500" },
  comment_added: { label: "Comment Added", color: "bg-green-500" },
  member_joined: { label: "Member Joined", color: "bg-emerald-500" },
  member_removed: { label: "Member Removed", color: "bg-orange-500" },
  role_changed: { label: "Role Changed", color: "bg-yellow-500" },
  ai_generated: { label: "AI Generated", color: "bg-pink-500" },
  invitation_sent: { label: "Invitation Sent", color: "bg-indigo-500" },
  invitation_accepted: { label: "Invitation Accepted", color: "bg-teal-500" },
  attachment_uploaded: { label: "File Uploaded", color: "bg-cyan-500" },
  ownership_transferred: { label: "Ownership Transferred", color: "bg-amber-500" },
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGlobalActivity(page);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity Timeline</h1>
            <p className="text-muted-foreground mt-1">
              Track all actions across your projects
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPage(1)} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : data && data.activities.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-4">
                {data.activities.map((activity: ActivityLog) => {
                  const actionInfo = ACTION_LABELS[activity.action] || {
                    label: activity.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                    color: "bg-gray-500",
                  };

                  return (
                    <div key={activity.id} className="flex gap-4 relative">
                      <div className={`w-10 h-10 rounded-full ${actionInfo.color} flex items-center justify-center shrink-0 ring-4 ring-background z-10`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-[10px] bg-transparent text-white">
                            {activity.user_name ? getInitials(activity.user_name) : "?"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{activity.user_name || "System"}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {actionInfo.label}
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground/60">{formatDate(activity.created_at)}</span>
                          {activity.project_id && (
                            <Link href={`/projects/${activity.project_id}`} className="text-xs text-primary hover:underline">
                              View Project
                            </Link>
                          )}
                          {activity.task_id && (
                            <Link href={`/tasks/${activity.task_id}`} className="text-xs text-primary hover:underline">
                              View Task
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil((data.total || 0) / (data.per_page || 50))}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.activities || data.activities.length < (data.per_page || 50)}
                  >
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No activity yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Actions across your projects will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
