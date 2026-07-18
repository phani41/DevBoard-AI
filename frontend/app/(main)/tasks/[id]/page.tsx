"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ErrorState } from "@/components/ui/empty-state";
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
  Tag,
  Plus,
  X,
  AlertCircle,
  ChevronDown,
  Save,
} from "lucide-react";
import { Comment } from "@/types";
import { api } from "@/services/api";
import { formatDate, formatRelativeTime, getInitials, getStatusBadgeVariant, getPriorityBadgeVariant, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = Number(params.id);

  const { data: task, isLoading, isError, refetch } = useTask(taskId);
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => api.getComments(taskId),
    enabled: !!taskId,
  });

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const handleDelete = useCallback(async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask.mutateAsync(taskId);
      router.push("/tasks");
    }
  }, [deleteTask, taskId, router]);

  const handleStatusChange = useCallback(async (status: string) => {
    await updateTask.mutateAsync({ id: taskId, data: { status } });
  }, [updateTask, taskId]);

  const handlePriorityChange = useCallback(async (priority: string) => {
    await updateTask.mutateAsync({ id: taskId, data: { priority } });
  }, [updateTask, taskId]);

  const handleDueDateChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const due_date = e.target.value ? new Date(e.target.value).toISOString() : null;
    await updateTask.mutateAsync({ id: taskId, data: { due_date } as any });
  }, [updateTask, taskId]);

  const handleAddComment = useCallback(async () => {
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
  }, [newComment, taskId, queryClient]);

  const toggleChecklistItem = useCallback(async (index: number) => {
    if (!task?.checklist) return;
    const updated = [...task.checklist];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    await updateTask.mutateAsync({ id: taskId, data: { checklist: updated } });
  }, [task, taskId, updateTask]);

  const addLabel = useCallback(async () => {
    if (!newLabel.trim() || !task) return;
    const labels = [...(task.labels || []), newLabel.trim()];
    await updateTask.mutateAsync({ id: taskId, data: { labels } });
    setNewLabel("");
  }, [newLabel, task, taskId, updateTask]);

  const removeLabel = useCallback(async (label: string) => {
    if (!task) return;
    const labels = (task.labels || []).filter((l: string) => l !== label);
    await updateTask.mutateAsync({ id: taskId, data: { labels } });
  }, [task, taskId, updateTask]);

  const handleTitleSave = useCallback(async () => {
    if (!editTitle.trim()) return;
    await updateTask.mutateAsync({ id: taskId, data: { title: editTitle } });
    setIsEditingTitle(false);
  }, [editTitle, taskId, updateTask]);

  if (isLoading) return <CardSkeleton />;
  if (isError || !task) return <ErrorState title="Task not found" message="This task doesn't exist or you don't have access." onRetry={refetch} />;

  const project = projects?.find((p: any) => p.id === task.project_id);
  const completedItems = task.checklist?.filter((i: any) => i.completed).length || 0;
  const totalItems = task.checklist?.length || 0;
  const checklistProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-xl font-bold h-10 w-96" autoFocus onKeyDown={(e) => e.key === "Enter" && handleTitleSave()} />
                  <Button size="sm" onClick={handleTitleSave}><Save className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <h1 className="text-2xl font-bold group cursor-pointer" onClick={() => { setEditTitle(task.title); setIsEditingTitle(true); }}>
                  {task.title}
                  <Edit3 className="h-4 w-4 ml-2 inline text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              )}
              <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize">{getStatusLabel(task.status)}</Badge>
            </div>
            {project && (
              <Link href={`/projects/${project.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">{project.name}</Link>
            )}
          </div>
        </div>
        <Button variant="destructive" size="icon" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description || "No description provided."}</p>
            </CardContent>
          </Card>

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Checklist</span>
                  <span className="text-xs text-muted-foreground">{completedItems}/{totalItems} ({checklistProgress}%)</span>
                </CardTitle>
                {totalItems > 0 && (
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mx-6">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${checklistProgress}%` }} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.checklist.map((item: any, index: number) => (
                    <label key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={item.completed} onChange={() => toggleChecklistItem(index)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                      <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
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
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map((i) => <div key={i} className="flex gap-3 animate-pulse"><div className="h-8 w-8 rounded-full bg-secondary" /><div className="flex-1 space-y-2"><div className="h-3 w-24 bg-secondary rounded" /><div className="h-4 w-full bg-secondary rounded" /></div></div>)}
                  </div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(comment.author_name || "U")}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author_name || "User"}</span>
                          <span className="text-xs text-muted-foreground" title={formatDate(comment.created_at)}>{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..." onKeyDown={(e) => e.key === "Enter" && handleAddComment()} />
                <Button size="icon" onClick={handleAddComment} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <Select value={task.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                <input type="date" defaultValue={task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : ""}
                  onChange={handleDueDateChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{task.assignee ? getInitials(task.assignee.username) : "?"}</AvatarFallback></Avatar>
                  <span className="text-sm">{task.assignee ? task.assignee.username : "Unassigned"}</span>
                </div>
              </div>

              {task.due_date && (
                <div className={`flex items-center gap-2 text-sm ${new Date(task.due_date) < new Date() && task.status !== "done" ? "text-red-500" : "text-muted-foreground"}`}>
                  {new Date(task.due_date) < new Date() && task.status !== "done" ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  Due {formatDate(task.due_date)}
                  {new Date(task.due_date) < new Date() && task.status !== "done" && <Badge variant="destructive" className="text-[9px]">Overdue</Badge>}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span title={formatDate(task.created_at)}>Created {formatRelativeTime(task.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span title={formatDate(task.updated_at)}>Updated {formatRelativeTime(task.updated_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Labels */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" />Labels</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {(task.labels || []).length > 0 ? task.labels.map((label: string) => (
                  <span key={label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {label}
                    <button onClick={() => removeLabel(label)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                  </span>
                )) : <span className="text-xs text-muted-foreground">No labels</span>}
              </div>
              <div className="flex gap-2">
                <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add label..." className="h-8 text-xs" onKeyDown={(e) => e.key === "Enter" && addLabel()} />
                <Button size="sm" variant="ghost" onClick={addLabel} disabled={!newLabel.trim()}><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
