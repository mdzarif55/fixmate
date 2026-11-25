"use client";

import * as React from "react";
import { Check, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import type { ServiceItem } from "@/types";

const APPROVAL_FILTERS = [
  { value: "all", label: "All (Pending First)" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [filter, setFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | null>(null);

  const loadServices = React.useCallback(async (approvalStatus: string) => {
    try {
      const qs =
        approvalStatus !== "all" ? `?approvalStatus=${approvalStatus}` : "";
      const data = await apiFetch<{ services: ServiceItem[] }>(
        `/api/admin/services${qs}`,
        { auth: true }
      );
      setServices(data.services || []);
    } catch {
      toast.error("Failed to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    const qs = filter !== "all" ? `?approvalStatus=${filter}` : "";
    apiFetch<{ services: ServiceItem[] }>(`/api/admin/services${qs}`, {
      auth: true,
    })
      .then((data) => {
        if (active) setServices(data.services || []);
      })
      .catch(() => {
        if (active) toast.error("Failed to load services.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  const handleApproval = async (
    serviceId: string,
    approvalStatus: "approved" | "rejected"
  ) => {
    setActionId(serviceId);
    try {
      await apiFetch(`/api/admin/services/${serviceId}/approval`, {
        method: "PATCH",
        auth: true,
        body: { approvalStatus },
      });
      toast.success(`Service ${approvalStatus}.`);
      await loadServices(filter);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update approval."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Approvals"
        description="Review technician service submissions. Pending listings appear at the top."
      />

      <div className="flex flex-wrap gap-2">
        {APPROVAL_FILTERS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
              filter === tab.value
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No services in this queue"
          description="Submitted services matching this approval filter will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => {
                  const busy = actionId === service._id;
                  return (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={service.image}
                            alt={service.title}
                            className="h-11 w-14 rounded-lg object-cover border border-border"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {service.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {service.serviceMode} • {service.serviceArea}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {service.technicianName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.technicianEmail}
                        </p>
                      </TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(service.basePrice)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={service.approvalStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={
                              busy || service.approvalStatus === "approved"
                            }
                            onClick={() =>
                              handleApproval(service._id, "approved")
                            }
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={
                              busy || service.approvalStatus === "rejected"
                            }
                            onClick={() =>
                              handleApproval(service._id, "rejected")
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
