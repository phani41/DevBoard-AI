"use client";

import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
} from "lucide-react";
import { Task, Project } from "@/types";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = {
  todo: "#94a3b8",
  in_progress: "#3b82f6",
  review: "#eab308",
  done: "#22c55e",
};

const PRIORITY_COLORS = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export default function AnalyticsPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  const isLoading = projectsLoading || tasksLoading;

  const stats = useMemo(() => {
    if (!tasks) return null;
    return {
      total: tasks.length,
      todo: tasks.filter((t: Task) => t.status === "todo").length,
      inProgress: tasks.filter((t: Task) => t.status === "in_progress").length,
      review: tasks.filter((t: Task) => t.status === "review").length,
      done: tasks.filter((t: Task) => t.status === "done").length,
      urgent: tasks.filter((t: Task) => t.priority === "urgent").length,
      high: tasks.filter((t: Task) => t.priority === "high").length,
      medium: tasks.filter((t: Task) => t.priority === "medium").length,
      low: tasks.filter((t: Task) => t.priority === "low").length,
    };
  }, [tasks]);

  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Todo", value: stats.todo, color: COLORS.todo },
      { name: "In Progress", value: stats.inProgress, color: COLORS.in_progress },
      { name: "Review", value: stats.review, color: COLORS.review },
      { name: "Done", value: stats.done, color: COLORS.done },
    ];
  }, [stats]);

  const priorityChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Urgent", value: stats.urgent, color: PRIORITY_COLORS.urgent },
      { name: "High", value: stats.high, color: PRIORITY_COLORS.high },
      { name: "Medium", value: stats.medium, color: PRIORITY_COLORS.medium },
      { name: "Low", value: stats.low, color: PRIORITY_COLORS.low },
    ];
  }, [stats]);

  const weeklyData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const completed = tasks.filter((t: Task) => {
        const created = new Date(t.created_at).toISOString().split("T")[0];
        return created === dateStr && t.status === "done";
      }).length;

      const created = tasks.filter((t: Task) => {
        const createdDate = new Date(t.created_at).toISOString().split("T")[0];
        return createdDate === dateStr;
      }).length;

      weekData.push({
        name: days[date.getDay()],
        completed,
        created,
      });
    }

    return weekData;
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }, [stats]);

  if (isLoading) return <DashboardSkeleton />;

  if (!tasks || tasks.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights and metrics for your projects.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No data yet</h3>
            <p className="text-sm text-muted-foreground">
              Create tasks to see analytics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Insights and metrics for your projects.
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {completionRate}% Complete
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tasks"
          value={stats?.total || 0}
          icon={ListTodo}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <MetricCard
          title="Completed"
          value={stats?.done || 0}
          icon={CheckCircle2}
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <MetricCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={Activity}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <MetricCard
          title="Urgent"
          value={stats?.urgent || 0}
          icon={AlertTriangle}
          color="text-red-500"
          bg="bg-red-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-4 w-4 text-primary" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                    name="Created"
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                    name="Completed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${bg} ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}
