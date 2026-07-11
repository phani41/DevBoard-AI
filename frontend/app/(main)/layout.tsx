"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:pl-64 transition-all duration-300">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
