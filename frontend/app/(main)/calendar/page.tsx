"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckSquare,
  AlertCircle,
  Clock,
  Plus,
} from "lucide-react";
import { Task, Project } from "@/types";
import { formatDate, getStatusColor, getPriorityColor, getStatusLabel } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: projects } = useProjects();
  const { data: tasks, isLoading } = useTasks({
    project_id: projectFilter !== "all" ? Number(projectFilter) : undefined,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  const getTasksForDate = (date: Date | null): Task[] => {
    if (!date || !tasks) return [];
    return tasks.filter((task: Task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Selected date tasks
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate || !tasks) return [];
    return tasks.filter((task: Task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getFullYear() === selectedDate.getFullYear() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getDate() === selectedDate.getDate()
      );
    });
  }, [selectedDate, tasks]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground mt-1">
              View tasks by due date
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((p: Project) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={navigateToday}>
                Today
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden">
                  {calendarDays.map((date, index) => {
                    const tasksForDay = getTasksForDate(date);
                    const isCurrentDay = date ? isToday(date) : false;
                    const isPast = date ? isOverdue(date) : false;

                    return (
                      <div
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        className={cn(
                          "min-h-[100px] p-1.5 border border-border/50 cursor-pointer transition-colors hover:bg-secondary/30",
                          isCurrentDay && "bg-primary/5",
                          selectedDate && date && selectedDate.getTime() === date.getTime() && "ring-2 ring-primary ring-inset",
                        )}
                      >
                        {date && (
                          <>
                            <p className={cn(
                              "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                              isCurrentDay && "bg-primary text-primary-foreground",
                              isPast && !isCurrentDay && "text-muted-foreground",
                            )}>
                              {date.getDate()}
                            </p>
                            <div className="space-y-0.5">
                              {tasksForDay.slice(0, 3).map((task: Task) => (
                                <Link
                                  key={task.id}
                                  href={`/tasks/${task.id}`}
                                  className={cn(
                                    "flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate group",
                                    task.status === "done"
                                      ? "bg-green-500/10 text-green-500"
                                      : isPast
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-blue-500/10 text-blue-500"
                                  )}
                                >
                                  <div className={cn(
                                    "w-1 h-1 rounded-full shrink-0",
                                    task.status === "done" ? "bg-green-500" : isPast ? "bg-red-500" : "bg-blue-500"
                                  )} />
                                  <span className="truncate">{task.title}</span>
                                </Link>
                              ))}
                              {tasksForDay.length > 3 && (
                                <p className="text-[10px] text-muted-foreground pl-1">
                                  +{tasksForDay.length - 3} more
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Selected date tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {selectedDate ? formatDate(selectedDate.toISOString()) : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateTasks.map((task: Task) => {
                    const overdue = isOverdue(new Date(task.due_date!));
                    return (
                      <Link
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        {overdue && task.status !== "done" ? (
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        ) : task.status === "done" ? (
                          <CheckSquare className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant={overdue && task.status !== "done" ? "destructive" : "outline"} className="text-[9px] px-1 py-0">
                              {getStatusLabel(task.status)}
                            </Badge>
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 capitalize">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks due on this date</p>
                  <Link href="/tasks">
                    <Button variant="link" size="sm" className="mt-2">Create a task</Button>
                  </Link>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Click a date to see tasks</p>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Scheduled</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Overdue</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
