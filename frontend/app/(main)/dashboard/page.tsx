"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useGlobalActivity } from "@/hooks/useActivity";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  FolderKanban,
  CheckSquare,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  AlertCircle,
  Activity,
  BarChart3,
  Target,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useMemo } from "react";
import { Project, Task, ActivityLog } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: activityData } = useGlobalActivity(1);

  const isLoading = projectsLoading || tasksLoading;

  const stats = useMemo(() => {
    if (!projects || !tasks) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    return {
      activeProjects: projects.filter((p: Project) => p.status === "active").length,
      assignedTasks: tasks.filter((t: Task) => t.assignee_id === user?.id).length,
      tasksDueToday: tasks.filter((t: Task) => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due >= today && due <= new Date(today.getTime() + 86400000);
      }).length,
      completedTasks: tasks.filter((t: Task) => t.status === "done").length,
      overdueTasks: tasks.filter((t: Task) => {
        if (!t.due_date || t.status === "done") return false;
        return new Date(t.due_date) < today;
      }).length,
      completedThisWeek: tasks.filter((t: Task) => {
        if (!t.updated_at || t.status !== "done") return false;
        const updated = new Date(t.updated_at);
        return updated >= weekStart;
      }).length,
    };
  }, [projects, tasks, user]);

  const projectProgress = useMemo(() => {
    if (!projects || !tasks) return [];
    return projects.slice(0, 5).map((p: Project) => {
      const projectTasks = tasks.filter((t: Task) => t.project_id === p.id);
      const total = projectTasks.length;
      const done = projectTasks.filter((t: Task) => t.status === "done").length;
      return { ...p, total, done, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
    });
  }, [projects, tasks]);

  const recentTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a: Task, b: Task) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [tasks]);

  const priorityDistribution = useMemo(() => {
    if (!tasks) return { urgent: 0, high: 0, medium: 0, low: 0 };
    return {
      urgent: tasks.filter((t: Task) => t.priority === "urgent").length,
      high: tasks.filter((t: Task) => t.priority === "high").length,
      medium: tasks.filter((t: Task) => t.priority === "medium").length,
      low: tasks.filter((t: Task) => t.priority === "low").length,
    };
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
          <StatCard title="Active Projects" value={stats.activeProjects} icon={FolderKanban} description="Total active projects" iconColor="text-purple-500" borderColor="border-l-purple-500" />
          <StatCard title="Due Today" value={stats.tasksDueToday} icon={CalendarClock} description="Tasks due today" iconColor="text-orange-500" borderColor="border-l-orange-500" />
          <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertCircle} description="Overdue tasks" iconColor="text-red-500" borderColor="border-l-red-500" />
          <StatCard title="Completed This Week" value={stats.completedThisWeek} icon={CheckCircle2} description="Tasks completed this week" iconColor="text-green-500" borderColor="border-l-green-500" />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Overview + Priority */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Task Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  <TaskStatusBar label="Todo" count={tasks.filter((t: Task) => t.status === "todo").length} total={tasks.length} color="bg-[hsl(var(--kanban-todo))]" />
                  <TaskStatusBar label="In Progress" count={tasks.filter((t: Task) => t.status === "in_progress").length} total={tasks.length} color="bg-[hsl(var(--kanban-progress))]" />
                  <TaskStatusBar label="Review" count={tasks.filter((t: Task) => t.status === "review").length} total={tasks.length} color="bg-[hsl(var(--kanban-review))]" />
                  <TaskStatusBar label="Done" count={tasks.filter((t: Task) => t.status === "done").length} total={tasks.length} color="bg-[hsl(var(--kanban-done))]" />
                </div>
              ) : (
                <EmptyState icon={CheckSquare} title="No tasks yet" description="Create your first task to get started" action={<Link href="/tasks"><Button variant="outline" size="sm">Create Task</Button></Link>} />
              )}
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <PriorityCard label="Urgent" count={priorityDistribution.urgent} color="bg-red-500" total={tasks?.length || 0} />
                <PriorityCard label="High" count={priorityDistribution.high} color="bg-orange-500" total={tasks?.length || 0} />
                <PriorityCard label="Medium" count={priorityDistribution.medium} color="bg-yellow-500" total={tasks?.length || 0} />
                <PriorityCard label="Low" count={priorityDistribution.low} color="bg-green-500" total={tasks?.length || 0} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityData && activityData.activities.length > 0 ? (
                <div className="space-y-3">
                  {activityData.activities.slice(0, 5).map((activity: ActivityLog) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[9px]">{activity.user_name ? getInitials(activity.user_name) : "S"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{activity.description || activity.action.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Activity} title="No activity" description="Your activity will appear here" />
              )}
              {activityData && activityData.activities.length > 0 && (
                <Link href="/activity">
                  <Button variant="ghost" size="sm" className="w-full mt-3 gap-2">View all activity <ArrowRight className="h-3 w-3" /></Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Project Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectProgress.slice(0, 4).map((p: any) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{p.name}</p>
                      <span className="text-[10px] text-muted-foreground">{p.done}/{p.total}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
              {projectProgress.length > 0 && (
                <Link href="/projects"><Button variant="ghost" size="sm" className="w-full mt-3 gap-2">All Projects <ArrowRight className="h-3 w-3" /></Button></Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, iconColor, borderColor }: { title: string; value: number; icon: any; description: string; iconColor: string; borderColor: string }) {
  return (
    <Card className={`relative overflow-hidden border-l-4 ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-secondary ${iconColor}`}><Icon className="h-5 w-5" /></div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{description}</p>
      </CardContent>
    </Card>
  );
}

function TaskStatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{count} tasks</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function PriorityCard({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="text-center p-3 rounded-lg bg-secondary/50">
      <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs text-muted-foreground capitalize">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{percentage}%</p>
    </div>
  );
}


