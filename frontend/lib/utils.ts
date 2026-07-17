import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "text-red-500 bg-red-500/10";
    case "high":
      return "text-orange-500 bg-orange-500/10";
    case "medium":
      return "text-yellow-500 bg-yellow-500/10";
    case "low":
      return "text-green-500 bg-green-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "todo":
      return "bg-kanban-todo/20 text-kanban-todo";
    case "in_progress":
      return "bg-kanban-progress/20 text-kanban-progress";
    case "review":
      return "bg-kanban-review/20 text-kanban-review";
    case "done":
      return "bg-kanban-done/20 text-kanban-done";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" {
  switch (status) {
    case "todo": return "outline";
    case "in_progress": return "info";
    case "review": return "warning";
    case "done": return "success";
    default: return "secondary";
  }
}

export function getPriorityBadgeVariant(priority: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" {
  switch (priority) {
    case "urgent": return "destructive";
    case "high": return "warning";
    case "medium": return "secondary";
    case "low": return "success";
    default: return "secondary";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "todo": return "Todo";
    case "in_progress": return "In Progress";
    case "review": return "Review";
    case "done": return "Done";
    default: return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "urgent": return "Urgent";
    case "high": return "High";
    case "medium": return "Medium";
    case "low": return "Low";
    default: return priority;
  }
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export function isToday(date: string | Date): boolean {
  const today = new Date();
  const target = new Date(date);
  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  );
}

export function getProgressPercentage(checklist: { completed: boolean }[]): number {
  if (!checklist?.length) return 0;
  const completed = checklist.filter((item) => item.completed).length;
  return Math.round((completed / checklist.length) * 100);
}

export function getDateStatus(dueDate: string | null | undefined, status: string): "overdue" | "due-today" | "upcoming" | "completed" | "none" {
  if (status === "done") return "completed";
  if (!dueDate) return "none";
  if (isOverdue(dueDate)) return "overdue";
  if (isToday(dueDate)) return "due-today";
  return "upcoming";
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Password must contain an uppercase letter" };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Password must contain a lowercase letter" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Password must contain a number" };
  return { valid: true, message: "" };
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}
