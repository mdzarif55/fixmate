"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  FileDown,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { downloadPaymentInvoicePdf } from "@/lib/invoice-pdf";
import { formatCurrency } from "@/lib/utils";
import type { PaymentRecord } from "@/types";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [payment, setPayment] = React.useState<PaymentRecord | null>(null);
  const [error, setError] = React.useState<string | null>(
    sessionId ? null : "Missing Stripe checkout session ID."
  );
  const [loading, setLoading] = React.useState(Boolean(sessionId));

  React.useEffect(() => {
    if (!sessionId) return;

    let active = true;
    apiFetch<{ payment: PaymentRecord }>(
      `/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`,
      { auth: true }
    )
      .then((res) => {
        if (active) setPayment(res.payment);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not verify payment session."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardContent className="p-8 text-center space-y-5">
        {loading ? (
          <div className="space-y-3 py-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" />
            <h1 className="text-xl font-bold text-foreground">
              Verifying Your Payment...
            </h1>
            <p className="text-sm text-muted-foreground">
              Confirming your transaction with Stripe and updating your booking.
            </p>
          </div>
        ) : error || !payment ? (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Verification Issue
            </h1>
            <p className="text-sm text-muted-foreground">
              {error || "Unable to verify payment."}
            </p>
            <Button asChild>
              <Link href="/dashboard/customer/bookings">
                Go to My Bookings
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Payment Successful!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your repair payment has been confirmed and recorded.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 text-left text-sm space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold text-foreground text-right">
                  {payment.serviceTitle}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payment.amount)} USD
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs text-foreground break-all text-right">
                  {payment.transactionId}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild>
                <Link href="/dashboard/customer/bookings">
                  <CalendarCheck className="h-4 w-4" />
                  <span>My Bookings</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadPaymentInvoicePdf({
                    bookingId: payment.bookingId,
                    transactionId: payment.transactionId,
                    serviceTitle: payment.serviceTitle,
                    customerName: payment.customerName,
                    customerEmail: payment.customerEmail,
                    technicianName: payment.technicianName,
                    technicianEmail: payment.technicianEmail,
                    amount: payment.amount,
                    paidAt: payment.paidAt,
                  })
                }
              >
                <FileDown className="h-4 w-4" />
                <span>Download PDF Invoice</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <React.Suspense
          fallback={<Loader2 className="h-8 w-8 animate-spin text-brand" />}
        >
          <PaymentSuccessContent />
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
}
