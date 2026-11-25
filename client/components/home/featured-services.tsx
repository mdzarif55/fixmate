import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { ServiceCard } from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { PaginatedServicesResponse, ServiceItem } from "@/types";

async function fetchLatestServices(): Promise<ServiceItem[]> {
  const baseUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  try {
    const res = await fetch(`${baseUrl}/api/services?limit=6&sort=newest`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const payload = await res.json();
    const data = (payload?.data || payload) as PaginatedServicesResponse;
    return Array.isArray(data?.services) ? data.services.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export async function FeaturedServices() {
  const services = await fetchLatestServices();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Ready to Book
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Featured Repair Services
          </h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/services">
            <span>View All Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} showArea={false} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Wrench}
          title="Featured services will appear here"
          description="Once the FixMate server and seed data are running, approved technician listings appear automatically."
          action={
            <Button asChild>
              <Link href="/services">Browse Services</Link>
            </Button>
          }
        />
      )}
    </section>
  );
}
