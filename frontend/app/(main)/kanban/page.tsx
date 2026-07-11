"use client";

import { useState } from "react";
import { useTasks, useUpdateTask, useReorderTask, useCreateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Clock,
  MessageSquare,
  Kanban,
  Loader2,
} from "lucide-react";
import { Task, Project } from "@/types";
import { formatDateShort, getInitials, getStatusLabel } from "@/lib/utils";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const COLUMNS = [
  { id: "todo", label: "Todo", color: "bg-gray-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-yellow-500" },
  { id: "done", label: "Done", color: "bg-green-500" },
];

export default function KanbanPage() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [dragTask, setDragTask] = useState<{ id: number; status: string } | null>(null);

  const { data: projects } = useProjects();
  const { data: tasks, isLoading } = useTasks({
    project_id: projectFilter !== "all" ? Number(projectFilter) : undefined,
  });
  const updateTask = useUpdateTask();
  const reorderTask = useReorderTask();
  const createTask = useCreateTask();

  const getColumnTasks = (status: string) => {
    return tasks?.filter((t: Task) => t.status === status) || [];
  };

  const handleDragStart = (task: Task) => {
    setDragTask({ id: task.id, status: task.status });
  };

  const handleDrop = async (targetStatus: string) => {
    if (!dragTask) return;
    if (dragTask.status === targetStatus) {
      setDragTask(null);
      return;
    }

    try {
      await updateTask.mutateAsync({
        id: dragTask.id,
        data: { status: targetStatus },
      });
    } catch (err: any) {
      toast.error(err.message);
    }
    setDragTask(null);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedProject) return;
    try {
      await createTask.mutateAsync({
        title: newTaskTitle,
        project_id: Number(selectedProject),
        status: "todo",
      });
      setNewTaskTitle("");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop tasks to manage your workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((p: Project) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Quick Add Task</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Title</label>
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task title"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((p: Project) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleCreateTask}
          className="w-full gap-2"
          disabled={createTask.isPending || !newTaskTitle.trim() || !selectedProject}
        >
          {createTask.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
          ) : (
            <><Plus className="h-4 w-4" /> Create Task</>
          )}
        </Button>
      </div>
    </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          return (
            <div
              key={column.id}
              className="bg-secondary/30 rounded-xl p-3 min-h-[400px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                  <Badge variant="outline" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task: Task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="block"
                  >
                    <Card className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all duration-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">
                            {task.title}
                          </p>
                          <Badge
                            variant={
                              task.priority === "urgent"
                                ? "destructive"
                                : task.priority === "high"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0 ml-2 capitalize"
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.labels.slice(0, 2).map((label: string) => (
                              <Badge key={label} variant="info" className="text-[9px] px-1 py-0">
                                {label}
                              </Badge>
                            ))}
                            {task.labels.length > 2 && (
                              <span className="text-[9px] text-muted-foreground">
                                +{task.labels.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateShort(task.due_date)}
                              </span>
                            )}
                            {task.comment_count ? (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {task.comment_count}
                              </span>
                            ) : null}
                          </div>
                          {task.assignee && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[9px]">
                                {getInitials(task.assignee.username)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Kanban className="h-6 w-6 mb-2 opacity-50" />
                    <p className="text-xs">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
