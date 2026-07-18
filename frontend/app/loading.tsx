import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-3 w-64 mx-auto" />
      </div>
    </div>
  );
}
