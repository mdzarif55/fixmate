import { Suspense } from "react";
import { ServicesBrowser } from "@/components/services/services-browser";
import { ServiceGridSkeleton } from "@/components/shared/loading-skeleton";
import type { PaginatedServicesResponse } from "@/types";

export const dynamic = "force-dynamic";

interface ServicesPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    serviceMode?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getInitialServices(query: {
  search: string;
  category: string;
  serviceMode: string;
  sort: string;
  page: number;
}): Promise<PaginatedServicesResponse> {
  const baseUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category && query.category !== "all")
    params.set("category", query.category);
  if (query.serviceMode && query.serviceMode !== "all")
    params.set("serviceMode", query.serviceMode);
  if (query.sort) params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("limit", "9");

  try {
    const res = await fetch(`${baseUrl}/api/services?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        services: [],
        pagination: { total: 0, page: 1, limit: 9, totalPages: 1 },
      };
    }
    const payload = await res.json();
    return (
      (payload?.data as PaginatedServicesResponse) || {
        services: [],
        pagination: { total: 0, page: 1, limit: 9, totalPages: 1 },
      }
    );
  } catch {
    return {
      services: [],
      pagination: { total: 0, page: 1, limit: 9, totalPages: 1 },
    };
  }
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const sp = await searchParams;
  const query = {
    search: sp.search || "",
    category: sp.category || "all",
    serviceMode: sp.serviceMode || "all",
    sort: sp.sort || "newest",
    page: Math.max(1, Number(sp.page || "1") || 1),
  };

  const initialData = await getInitialServices(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Repair Marketplace
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          Browse Approved Repair Services
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          All listings are reviewed by FixMate administrators and fulfilled by
          verified technicians.
        </p>
      </div>

      <Suspense fallback={<ServiceGridSkeleton count={6} />}>
        <ServicesBrowser
          key={JSON.stringify(query)}
          initialData={initialData}
          initialQuery={query}
        />
      </Suspense>
    </div>
  );
}
