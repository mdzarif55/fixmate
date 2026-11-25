"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { AdminCharts } from "@/components/dashboard/admin-charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingItem, PaymentRecord } from "@/types";

interface AdminOverviewResponse {
  stats: {
    totalUsers: number;
    totalTechnicians: number;
    pendingServices: number;
    totalServices: number;
    totalBookings: number;
    totalRevenue: number;
  };
  charts: {
    bookingsByStatus: Array<{ status: string; count: number }>;
    servicesByCategory: Array<{
      category: string;
      services: number;
      bookings: number;
    }>;
  };
  recentBookings: BookingItem[];
  recentPayments: PaymentRecord[];
}

export default function AdminOverviewPage() {
  const [data, setData] = React.useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<AdminOverviewResponse>("/api/admin/overview", { auth: true })
      .then(setData)
      .catch(() => toast.error("Failed to load admin analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {
    totalUsers: 0,
    totalTechnicians: 0,
    pendingServices: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Control Center"
        description="Monitor platform users, review pending services, and track live booking and transaction metrics."
        actions={
          <Button asChild>
            <Link href="/dashboard/admin/services">
              <CheckCircle2 className="h-4 w-4" />
              <span>Review Pending Services</span>
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="Registered platform accounts"
          icon={Users}
          accent="brand"
        />
        <StatCard
          title="Total Technicians"
          value={stats.totalTechnicians}
          subtitle="Active service providers"
          icon={Wrench}
          accent="teal"
        />
        <StatCard
          title="Pending Services"
          value={stats.pendingServices}
          subtitle={`${stats.totalServices} total services`}
          icon={Clock}
          accent="amber"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${stats.totalBookings} total bookings`}
          icon={DollarSign}
          accent="emerald"
        />
      </div>

      {data?.charts ? (
        <AdminCharts
          bookingsByStatus={data.charts.bookingsByStatus}
          servicesByCategory={data.charts.servicesByCategory}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {(data?.recentBookings || []).map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {booking.serviceTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.customerName} → {booking.technicianName} •{" "}
                      {formatDate(booking.preferredDate)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/transactions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {(data?.recentPayments || []).map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {payment.serviceTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.customerName} • {formatDate(payment.paidAt)}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
