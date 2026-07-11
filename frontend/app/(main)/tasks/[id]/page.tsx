"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  CheckSquare,
  Send,
  Clock,
  Edit3,
  Loader2,
} from "lucide-react";
import { Comment } from "@/types";
import { api } from "@/services/api";
import { formatDate, getInitials, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = Number(params.id);

  const { data: task, isLoading } = useTask(taskId);
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { data: comments } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => api.getComments(taskId),
    enabled: !!taskId,
  });

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask.mutateAsync(taskId);
      router.push("/tasks");
    }
  };

  const handleStatusChange = async (status: string) => {
    await updateTask.mutateAsync({ id: taskId, data: { status } });
  };

  const handlePriorityChange = async (priority: string) => {
    await updateTask.mutateAsync({ id: taskId, data: { priority } });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.createComment(taskId, newComment);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  const toggleChecklistItem = async (index: number) => {
    if (!task?.checklist) return;
    const updated = [...task.checklist];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    await updateTask.mutateAsync({ id: taskId, data: { checklist: updated } });
  };

  if (isLoading) return <CardSkeleton />;
  if (!task) return <div>Task not found</div>;

  const project = projects?.find((p: any) => p.id === task.project_id);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <Badge variant="outline" className="capitalize">
                {getStatusLabel(task.status)}
              </Badge>
            </div>
            {project && (
              <Link
                href={`/projects/${project.id}`}
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                {project.name}
              </Link>
            )}
          </div>
        </div>
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {task.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.checklist.map((item: any, index: number) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(index)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(comment.author_name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author_name || "User"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <Button size="icon" onClick={handleAddComment} disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Priority</label>
                <Select value={task.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Assignee</label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {task.assignee ? getInitials(task.assignee.username) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {task.assignee ? task.assignee.username : "Unassigned"}
                  </span>
                </div>
              </div>

              {task.due_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due {formatDate(task.due_date)}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created {formatDate(task.created_at)}
              </div>
            </CardContent>
          </Card>

          {task.labels && task.labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label: string) => (
                    <Badge key={label} variant="info">
                      {label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
