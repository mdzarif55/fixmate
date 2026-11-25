"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  FileDown,
  Loader2,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { BookingTimeline } from "@/components/booking/booking-timeline";
import { ReviewModal } from "@/components/booking/review-modal";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { downloadPaymentInvoicePdf } from "@/lib/invoice-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingItem } from "@/types";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [cancelTarget, setCancelTarget] = React.useState<BookingItem | null>(
    null
  );
  const [cancelling, setCancelling] = React.useState(false);
  const [payingId, setPayingId] = React.useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = React.useState<BookingItem | null>(
    null
  );

  const loadBookings = React.useCallback(async () => {
    try {
      const data = await apiFetch<{ bookings: BookingItem[] }>(
        "/api/bookings/my",
        { auth: true }
      );
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    apiFetch<{ bookings: BookingItem[] }>("/api/bookings/my", { auth: true })
      .then((data) => {
        if (active) setBookings(data.bookings || []);
      })
      .catch(() => {
        if (active) toast.error("Failed to load your bookings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await apiFetch(`/api/bookings/${cancelTarget._id}/cancel`, {
        method: "PATCH",
        auth: true,
      });
      toast.success("Booking cancelled.");
      setCancelTarget(null);
      await loadBookings();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not cancel booking."
      );
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async (bookingId: string) => {
    setPayingId(bookingId);
    try {
      const res = await apiFetch<{ url: string; sessionId: string }>(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          auth: true,
          body: { bookingId },
        }
      );
      if (res.url) {
        window.location.assign(res.url);
      } else {
        toast.error("Unable to open Stripe Checkout.");
        setPayingId(null);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not initialize Stripe payment."
      );
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Track every repair milestone, cancel pending requests, or pay securely once work is complete."
        actions={
          <Button asChild>
            <Link href="/services">Browse Services</Link>
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={4} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description="You haven't requested any repairs yet. Find a verified service to get started."
          action={
            <Button asChild>
              <Link href="/services">Explore Services</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const canCancel = booking.status === "requested";
            const canPay =
              booking.status === "completed" &&
              booking.paymentStatus === "unpaid";
            const isPaid = booking.paymentStatus === "paid";

            return (
              <Card key={booking._id} className="overflow-hidden">
                <CardContent className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-16 w-20 shrink-0 rounded-xl object-cover border border-border"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {booking.serviceTitle}
                          </h3>
                          <StatusBadge status={booking.status} />
                          <StatusBadge status={booking.paymentStatus} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Technician:{" "}
                          <strong className="text-foreground">
                            {booking.technicianName}
                          </strong>{" "}
                          • Preferred Date: {formatDate(booking.preferredDate)}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Issue: {booking.problemDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 lg:border-t-0 lg:pt-0">
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Base Price
                          </p>
                          <p className="font-medium text-foreground">
                            {formatCurrency(booking.basePrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Final Amount
                          </p>
                          <p className="text-base font-bold text-foreground">
                            {formatCurrency(booking.finalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {canCancel ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCancelTarget(booking)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Cancel Request</span>
                          </Button>
                        ) : null}

                        {canPay ? (
                          <Button
                            size="sm"
                            disabled={payingId === booking._id}
                            onClick={() => handlePayNow(booking._id)}
                          >
                            {payingId === booking._id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Redirecting...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                <span>Pay Now</span>
                              </>
                            )}
                          </Button>
                        ) : null}

                        {isPaid ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                downloadPaymentInvoicePdf({
                                  bookingId: booking._id,
                                  serviceTitle: booking.serviceTitle,
                                  category: booking.category,
                                  customerName: booking.customerName,
                                  customerEmail: booking.customerEmail,
                                  technicianName: booking.technicianName,
                                  technicianEmail: booking.technicianEmail,
                                  amount: booking.finalAmount,
                                  paidAt: booking.updatedAt || booking.createdAt,
                                })
                              }
                            >
                              <FileDown className="h-4 w-4" />
                              <span>PDF Invoice</span>
                            </Button>
                            {!booking.review ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setReviewTarget(booking)}
                              >
                                <Star className="h-4 w-4 text-amber-500" />
                                <span>Leave Review</span>
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                Rated {booking.review.rating}/5
                              </span>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <BookingTimeline booking={booking} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Repair Request"
        description={`Are you sure you want to cancel your repair request for "${cancelTarget?.serviceTitle}"?`}
        confirmLabel="Yes, Cancel Request"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
      />

      <ReviewModal
        booking={reviewTarget}
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => !open && setReviewTarget(null)}
        onSuccess={loadBookings}
      />
    </div>
  );
}
