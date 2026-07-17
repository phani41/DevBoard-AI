"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Brain,
  Settings,
  ChevronLeft,
  Kanban,
  Menu,
  Calendar,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { GlobalSearch } from "./global-search";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Kanban Board", href: "/kanban", icon: Kanban },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Features", href: "/ai", icon: Brain },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      )}

      {/* Mobile trigger - outside sidebar, fixed */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => onMobileOpenChange(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Top bar - positioned relative to sidebar width */}
      <div
        className={cn(
          "fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-end px-4 lg:px-6 z-30 transition-all duration-300",
          collapsed ? "left-0 lg:left-16" : "left-0 lg:left-64"
        )}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <GlobalSearch />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground whitespace-nowrap">
              DevBoard
              <span className="gradient-text"> AI</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent/20 text-sidebar-accent"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-muted/50",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-accent shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-muted/50 transition-all duration-200",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>

          <div className={cn("flex items-center gap-1", collapsed && "justify-center")}>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange(!collapsed)}
              className="text-sidebar-muted hidden lg:inline-flex"
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
