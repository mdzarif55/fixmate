"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceGridSkeleton } from "@/components/shared/loading-skeleton";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  SORT_OPTIONS,
} from "@/lib/constants";
import type { PaginatedServicesResponse } from "@/types";

interface ServicesBrowserProps {
  initialData: PaginatedServicesResponse;
  initialQuery: {
    search: string;
    category: string;
    serviceMode: string;
    sort: string;
    page: number;
  };
}

export function ServicesBrowser({
  initialData,
  initialQuery,
}: ServicesBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [searchInput, setSearchInput] = React.useState(initialQuery.search);

  const currentSearch = initialQuery.search;
  const currentCategory = initialQuery.category;
  const currentMode = initialQuery.serviceMode;
  const currentSort = initialQuery.sort;

  const updateQuery = (
    updates: Record<string, string | null>,
    resetPage = true
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (resetPage) {
      params.delete("page");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/services?${qs}` : "/services");
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim() || null });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/services");
    });
  };

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentCategory !== "all" ||
    currentMode !== "all" ||
    currentSort !== "newest";

  const { services, pagination } = initialData;

  return (
    <div className="space-y-8">
      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand" />
          <span>Filter &amp; Search Repair Services</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 md:col-span-5"
          >
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onClear={() => {
                setSearchInput("");
                updateQuery({ search: null });
              }}
              placeholder="Search by service title or category..."
              containerClassName="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={isPending}>
              Search
            </Button>
          </form>

          <div className="md:col-span-3">
            <Select
              value={currentCategory}
              onValueChange={(val) => updateQuery({ category: val })}
            >
              <SelectTrigger aria-label="Filter by category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select
              value={currentMode}
              onValueChange={(val) => updateQuery({ serviceMode: val })}
            >
              <SelectTrigger aria-label="Filter by service mode">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {SERVICE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select
              value={currentSort}
              onValueChange={(val) => updateQuery({ sort: val })}
            >
              <SelectTrigger aria-label="Sort services">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            Showing{" "}
            <strong className="text-foreground">{services.length}</strong> of{" "}
            <strong className="text-foreground">{pagination.total}</strong>{" "}
            approved services
          </span>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset all filters</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Results Grid */}
      {isPending ? (
        <ServiceGridSkeleton count={6} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No matching repair services found"
          description="Try clearing a filter, switching categories, or searching with another keyword."
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} showArea />
          ))}
        </div>
      )}

      {/* Server-side Pagination Controls */}
      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Page <strong className="text-foreground">{pagination.page}</strong>{" "}
            of{" "}
            <strong className="text-foreground">
              {pagination.totalPages}
            </strong>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isPending}
              onClick={() =>
                updateQuery({ page: String(pagination.page - 1) }, false)
              }
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "outline"}
                  size="sm"
                  disabled={isPending}
                  onClick={() => updateQuery({ page: String(p) }, false)}
                  className="hidden sm:inline-flex min-w-9"
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isPending}
              onClick={() =>
                updateQuery({ page: String(pagination.page + 1) }, false)
              }
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
