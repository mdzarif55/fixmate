"use client";

import * as React from "react";
import { CreditCard, FileDown } from "lucide-react";
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
import { apiFetch } from "@/lib/api";
import { downloadPaymentInvoicePdf } from "@/lib/invoice-pdf";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PaymentRecord } from "@/types";

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<{ payments: PaymentRecord[] }>("/api/payments/my", { auth: true })
      .then((res) => setPayments(res.payments || []))
      .catch(() => toast.error("Failed to load payment history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="View verified Stripe transactions for your completed repairs."
      />

      {loading ? (
        <TableSkeleton rows={4} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments recorded yet"
          description="Payments appear here once your repair is completed and paid via Stripe Checkout."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium text-foreground">
                      {payment.serviceTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.technicianName}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {payment.transactionId}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(payment.paidAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
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
                        <span>PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
