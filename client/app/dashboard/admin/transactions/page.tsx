"use client";

import * as React from "react";
import { CreditCard, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PaymentRecord } from "@/types";

export default function AdminTransactionsPage() {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<{ payments: PaymentRecord[]; totalRevenue: number }>(
      "/api/admin/payments",
      { auth: true }
    )
      .then((res) => {
        setPayments(res.payments || []);
        setTotalRevenue(res.totalRevenue || 0);
      })
      .catch(() => toast.error("Failed to load transactions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Transactions"
        description="Monitor verified Stripe Checkout payments and total platform revenue."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Verified USD Stripe payments"
          icon={DollarSign}
          accent="emerald"
        />
        <StatCard
          title="Completed Payments"
          value={payments.length}
          subtitle="Idempotent payment records"
          icon={CreditCard}
          accent="brand"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No transactions recorded yet"
          description="Successful customer Stripe payments will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Paid At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {payment.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.customerEmail}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.technicianName}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.serviceTitle}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
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
