import { notFound } from "next/navigation";
import { ServiceDetailsView } from "@/components/services/service-details-view";
import type { ServiceDetailsResponse } from "@/types";

export const dynamic = "force-dynamic";

async function fetchServiceDetails(
  id: string
): Promise<ServiceDetailsResponse | null> {
  const baseUrl =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  try {
    const res = await fetch(`${baseUrl}/api/services/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return (payload?.data as ServiceDetailsResponse) || null;
  } catch {
    return null;
  }
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = await fetchServiceDetails(id);

  if (!details?.service) {
    notFound();
  }

  return <ServiceDetailsView details={details} />;
}
