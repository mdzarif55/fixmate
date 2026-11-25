"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Wrench,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingItem } from "@/types";

interface CustomerBookingsResponse {
  bookings: BookingItem[];
  stats: {
    totalRequests: number;
    activeJobs: number;
    completedJobs: number;
  };
}

export default function CustomerOverviewPage() {
  const [data, setData] = React.useState<CustomerBookingsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<CustomerBookingsResponse>("/api/bookings/my", { auth: true })
      .then(setData)
      .catch(() =>
        setData({
          bookings: [],
          stats: { totalRequests: 0, activeJobs: 0, completedJobs: 0 },
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {
    totalRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
  };
  const recentBookings = (data?.bookings || []).slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer Overview"
        description="Track your active repair requests, job milestones, and payments."
        actions={
          <Button asChild>
            <Link href="/services">
              <Wrench className="h-4 w-4" />
              <span>Book New Repair</span>
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Requests"
          value={stats.totalRequests}
          subtitle="All submitted bookings"
          icon={CalendarCheck}
          accent="brand"
        />
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          subtitle="Requested, accepted, or in progress"
          icon={Clock}
          accent="amber"
        />
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs}
          subtitle="Repairs finished by technicians"
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer/bookings">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No repair bookings yet"
              description="Explore verified technician services and submit your first repair request."
              action={
                <Button asChild>
                  <Link href="/services">Explore Services</Link>
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={booking.serviceImage}
                      alt={booking.serviceTitle}
                      className="h-12 w-12 rounded-lg object-cover border border-border"
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {booking.serviceTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Technician: {booking.technicianName} • Preferred:{" "}
                        {formatDate(booking.preferredDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(booking.finalAmount)}
                    </span>
                    <StatusBadge status={booking.status} />
                    <StatusBadge status={booking.paymentStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
