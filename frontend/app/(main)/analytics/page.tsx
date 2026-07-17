"use client";

import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/empty-state";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  CalendarDays,
  Users,
  Target,
} from "lucide-react";
import { Task, Project } from "@/types";
import { useMemo, useState } from "react";
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
  AreaChart,
  Area,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { data: projects, isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } = useProjects();
  const { data: tasks, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useTasks();
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");

  const isLoading = projectsLoading || tasksLoading;
  const isError = projectsError || tasksError;

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
    return generateTimeSeries(tasks, "week", days, (date, dayName) => dayName);
  }, [tasks]);

  const monthlyData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return generateTimeSeries(tasks, "month", months, (date) => months[date.getMonth()]);
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.done / stats.total) * 100);
  }, [stats]);

  const projectCompletionData = useMemo(() => {
    if (!projects || !tasks) return [];
    return projects.map((p: Project) => {
      const projectTasks = tasks.filter((t: Task) => t.project_id === p.id);
      const done = projectTasks.filter((t: Task) => t.status === "done").length;
      return {
        name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
        total: projectTasks.length,
        completed: done,
        rate: projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0,
      };
    }).filter((p) => p.total > 0).sort((a, b) => b.rate - a.rate);
  }, [projects, tasks]);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={() => { refetchProjects(); refetchTasks(); }} />;

  if (!tasks || tasks.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Analytics" description="Insights and metrics for your projects." icon={BarChart3} />
        <Card>
          <CardContent className="py-20">
            <EmptyState icon={BarChart3} title="No data yet" description="Create tasks to see analytics" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeSeriesData = chartView === "weekly" ? weeklyData : monthlyData;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Insights and metrics for your projects."
        icon={BarChart3}
        action={
          <Badge variant="outline" className="text-sm px-3 py-1">
            {completionRate}% Complete
          </Badge>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Tasks" value={stats?.total || 0} icon={ListTodo} color="text-blue-500" bg="bg-blue-500/10" />
        <MetricCard title="Completed" value={stats?.done || 0} icon={CheckCircle2} color="text-green-500" bg="bg-green-500/10" />
        <MetricCard title="In Progress" value={stats?.inProgress || 0} icon={Activity} color="text-blue-500" bg="bg-blue-500/10" />
        <MetricCard title="Urgent" value={stats?.urgent || 0} icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PieChart className="h-4 w-4 text-primary" />Task Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
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
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" />Priority Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time Series */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                {chartView === "weekly" ? <CalendarDays className="h-4 w-4 text-primary" /> : <TrendingUp className="h-4 w-4 text-primary" />}
                {chartView === "weekly" ? "Weekly Activity" : "Monthly Trends"}
              </CardTitle>
              <Select value={chartView} onValueChange={(v: any) => setChartView(v)}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} fill="url(#createdGrad)" name="Created" />
                  <Area type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} fill="url(#completedGrad)" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Completion */}
        {projectCompletionData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-primary" />Project Completion Rates</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectCompletionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]} name="Completion Rate">
                      {projectCompletionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={projectCompletionData[index].rate >= 80 ? "#22c55e" : projectCompletionData[index].rate >= 50 ? "#eab308" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function generateTimeSeries(tasks: Task[], type: "week" | "month", labels: string[], labelFn: (date: Date) => string) {
  const dataMap: Record<string, { created: number; completed: number }> = {};
  const now = new Date();

  if (type === "week") {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dataMap[labelFn(date)] = { created: 0, completed: 0 };
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      dataMap[labelFn(date)] = { created: 0, completed: 0 };
    }
  }

  tasks.forEach((task) => {
    const createdDate = new Date(task.created_at);
    const createdLabel = labelFn(createdDate);
    if (dataMap[createdLabel]) {
      dataMap[createdLabel].created += 1;
    }

    if (task.status === "done") {
      const doneDate = new Date(task.updated_at);
      const doneLabel = labelFn(doneDate);
      if (dataMap[doneLabel]) {
        dataMap[doneLabel].completed += 1;
      }
    }
  });

  return Object.entries(dataMap).map(([name, data]) => ({ name, ...data }));
}

function MetricCard({ title, value, icon: Icon, color, bg }: { title: string; value: number; icon: any; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="h-4 w-4" /></div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}
