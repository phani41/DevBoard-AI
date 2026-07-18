"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Top bar - structural sibling of sidebar and content */}
      <div
        className={cn(
          "fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-end px-4 lg:px-6 z-30 transition-all duration-300",
          sidebarCollapsed ? "left-0 lg:left-16" : "left-0 lg:left-64"
        )}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <GlobalSearch />
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <main
        className={cn(
          "flex-1 min-h-screen pt-16 transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="container mx-auto p-4 md:p-6 lg:p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
