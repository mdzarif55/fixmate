"use client";

import * as React from "react";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { BOOKING_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingItem } from "@/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    apiFetch<{ bookings: BookingItem[] }>(`/api/admin/bookings${qs}`, {
      auth: true,
    })
      .then((res) => {
        if (active) setBookings(res.bookings || []);
      })
      .catch(() => {
        if (active) toast.error("Failed to load platform bookings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Repair Bookings"
        description="Read-only monitor of all repair requests across customers and technicians."
        actions={
          <div className="w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Filter bookings by status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {BOOKING_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    <span className="capitalize">{st}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {loading ? (
        <TableSkeleton rows={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description="Bookings matching the selected status will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell className="font-medium text-foreground">
                      {booking.serviceTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.customerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.technicianName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(booking.preferredDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(booking.finalAmount)}
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
