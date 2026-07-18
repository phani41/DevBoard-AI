import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function MainLoading() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-6 max-w-7xl animate-fade-in">
      <DashboardSkeleton />
    </div>
  );
}
