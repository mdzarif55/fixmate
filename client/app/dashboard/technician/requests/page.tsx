"use client";

import * as React from "react";
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  Phone,
  Play,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { BookingItem } from "@/types";

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "accepted", label: "Accepted" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
] as const;

export default function TechnicianRequestsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = React.useState<BookingItem | null>(
    null
  );
  const [completeTarget, setCompleteTarget] =
    React.useState<BookingItem | null>(null);
  const [finalAmount, setFinalAmount] = React.useState<string>("");

  const loadBookings = React.useCallback(async (filter: string) => {
    try {
      const qs = filter && filter !== "all" ? `?status=${filter}` : "";
      const data = await apiFetch<{ bookings: BookingItem[] }>(
        `/api/bookings/technician${qs}`,
        { auth: true }
      );
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    const qs = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
    apiFetch<{ bookings: BookingItem[] }>(`/api/bookings/technician${qs}`, {
      auth: true,
    })
      .then((data) => {
        if (active) setBookings(data.bookings || []);
      })
      .catch(() => {
        if (active) toast.error("Failed to load repair requests.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [statusFilter]);

  const updateJobStatus = async (
    bookingId: string,
    status: "accepted" | "rejected" | "in-progress" | "completed",
    amount?: number
  ) => {
    setActionId(bookingId);
    try {
      await apiFetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        auth: true,
        body: amount !== undefined ? { status, finalAmount: amount } : { status },
      });
      toast.success(`Job status updated to ${status}.`);
      setRejectTarget(null);
      setCompleteTarget(null);
      await loadBookings(statusFilter);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update job status."
      );
    } finally {
      setActionId(null);
    }
  };

  const openCompleteModal = (booking: BookingItem) => {
    setCompleteTarget(booking);
    setFinalAmount(String(booking.basePrice));
  };

  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTarget) return;

    const numeric = Number(finalAmount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      toast.error("Final amount must be greater than zero.");
      return;
    }

    await updateJobStatus(completeTarget._id, "completed", numeric);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Repair Requests"
        description="Accept incoming requests, move active repairs through the pipeline, and set the final price on completion."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer",
              statusFilter === tab.value
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No requests match this filter"
          description="Incoming customer repair requests will appear here."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const busy = actionId === booking._id;
            return (
              <Card key={booking._id}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {booking.serviceTitle}
                        </h3>
                        <StatusBadge status={booking.status} />
                        <StatusBadge status={booking.paymentStatus} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          Customer:{" "}
                          <strong className="text-foreground">
                            {booking.customerName}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {booking.customerPhone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.address}
                        </span>
                        <span>
                          Preferred: {formatDate(booking.preferredDate)}
                        </span>
                      </div>

                      <p className="rounded-lg border border-border bg-background/70 p-3 text-sm text-foreground/90">
                        {booking.problemDescription}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 border-t border-border pt-4 lg:items-end lg:border-t-0 lg:pt-0 shrink-0">
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-muted-foreground">
                          {booking.status === "completed"
                            ? "Final Amount"
                            : "Starting Base Rate"}
                        </p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(booking.finalAmount)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {booking.status === "requested" ? (
                          <>
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                updateJobStatus(booking._id, "accepted")
                              }
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span>Accept</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busy}
                              onClick={() => setRejectTarget(booking)}
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </Button>
                          </>
                        ) : null}

                        {booking.status === "accepted" ? (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              updateJobStatus(booking._id, "in-progress")
                            }
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            <span>Start Work</span>
                          </Button>
                        ) : null}

                        {booking.status === "in-progress" ? (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => openCompleteModal(booking)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Mark Completed</span>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject Repair Request"
        description={`Are you sure you want to reject ${rejectTarget?.customerName}'s request for "${rejectTarget?.serviceTitle}"?`}
        confirmLabel="Yes, Reject Request"
        loading={Boolean(actionId)}
        onConfirm={() => {
          if (rejectTarget) updateJobStatus(rejectTarget._id, "rejected");
        }}
      />

      {/* Mark Completed Modal with Final Amount */}
      <Dialog
        open={Boolean(completeTarget)}
        onOpenChange={(open) => !open && setCompleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Repair &amp; Set Final Amount</DialogTitle>
            <DialogDescription>
              Confirm the final repair price in USD for{" "}
              <strong>{completeTarget?.serviceTitle}</strong>. The customer will
              be able to pay this amount via Stripe.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmComplete} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="finalAmount">Final Repair Amount (USD)</Label>
              <Input
                id="finalAmount"
                type="number"
                step="0.01"
                min="1"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Prefilled with base rate:{" "}
                {completeTarget ? formatCurrency(completeTarget.basePrice) : ""}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompleteTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={Boolean(actionId)}>
                {actionId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  "Confirm & Mark Completed"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
