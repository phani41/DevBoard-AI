"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FolderKanban,
  CheckSquare,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDate, getPriorityColor, getStatusColor, getStatusLabel, truncate } from "@/lib/utils";
import { Project, Task } from "@/types";
import { useMemo } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  const isLoading = projectsLoading || tasksLoading;

  const stats = useMemo(() => {
    if (!projects || !tasks) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      activeProjects: projects.filter((p: Project) => p.status === "active").length,
      assignedTasks: tasks.filter((t: Task) => t.assignee_id === user?.id).length,
      tasksDueToday: tasks.filter((t: Task) => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due >= today && due <= new Date(today.getTime() + 86400000);
      }).length,
      completedTasks: tasks.filter((t: Task) => t.status === "done").length,
    };
  }, [projects, tasks, user]);

  const recentTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks]
      .sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [tasks]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="gradient-text">{user?.full_name || user?.username}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <Link href="/projects">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={FolderKanban}
            description="Total active projects"
            iconColor="text-purple-500"
            borderColor="border-l-purple-500"
          />
          <StatCard
            title="Assigned Tasks"
            value={stats.assignedTasks}
            icon={CheckSquare}
            description="Tasks assigned to you"
            iconColor="text-blue-500"
            borderColor="border-l-blue-500"
          />
          <StatCard
            title="Due Today"
            value={stats.tasksDueToday}
            icon={CalendarClock}
            description="Tasks due today"
            iconColor="text-orange-500"
            borderColor="border-l-orange-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            icon={CheckCircle2}
            description="Total completed tasks"
            iconColor="text-green-500"
            borderColor="border-l-green-500"
          />
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Overview Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Task Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                <TaskStatusBar
                  label="Todo"
                  count={tasks.filter((t: Task) => t.status === "todo").length}
                  total={tasks.length}
                  color="bg-[hsl(var(--kanban-todo))]"
                />
                <TaskStatusBar
                  label="In Progress"
                  count={tasks.filter((t: Task) => t.status === "in_progress").length}
                  total={tasks.length}
                  color="bg-[hsl(var(--kanban-progress))]"
                />
                <TaskStatusBar
                  label="Review"
                  count={tasks.filter((t: Task) => t.status === "review").length}
                  total={tasks.length}
                  color="bg-[hsl(var(--kanban-review))]"
                />
                <TaskStatusBar
                  label="Done"
                  count={tasks.filter((t: Task) => t.status === "done").length}
                  total={tasks.length}
                  color="bg-[hsl(var(--kanban-done))]"
                />
              </div>
            ) : (
              <EmptyState
                icon={CheckSquare}
                title="No tasks yet"
                description="Create your first task to get started"
                action={<Link href="/tasks"><Button variant="outline" size="sm">Create Task</Button></Link>}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task: Task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${getStatusColor(task.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {getStatusLabel(task.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(task.created_at)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="No recent activity"
                description="Your activity will appear here"
              />
            )}
            {recentTasks.length > 0 && (
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="w-full mt-3 gap-2">
                  View all tasks <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconColor,
  borderColor,
}: {
  title: string;
  value: number;
  icon: any;
  description: string;
  iconColor: string;
  borderColor: string;
}) {
  return (
    <Card className={`relative overflow-hidden border-l-4 ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-secondary ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{description}</p>
      </CardContent>
    </Card>
  );
}

function TaskStatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} tasks
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-secondary mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}
