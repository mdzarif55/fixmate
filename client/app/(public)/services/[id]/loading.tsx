import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
