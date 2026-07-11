"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useTasks, useCreateTask } from "@/hooks/useTasks";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Users,
  CheckSquare,
  Loader2,
  Clock,
} from "lucide-react";
import { Task } from "@/types";
import { formatDate, getPriorityColor, getStatusColor, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks({ project_id: projectId });
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject.mutateAsync(projectId);
      router.push("/projects");
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        title: newTaskTitle,
        project_id: projectId,
        status: "todo",
      });
      setNewTaskTitle("");
      setTaskDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (projectLoading) return <CardSkeleton />;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <Badge variant={project.status === "active" ? "success" : "secondary"} className="capitalize">
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task Title</label>
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatDate(project.created_at)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-medium">{project.members?.length || 1}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tasks</p>
              <p className="text-sm font-medium">{project.task_count || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks</span>
            <Badge variant="outline">{tasks?.length || 0} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task: Task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "warning" : "secondary"} className="text-[10px] px-1.5 py-0 capitalize">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{getStatusLabel(task.status)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.assignee.username}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No tasks in this project yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
