"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/use-auth-user";
import { apiFetch, ApiError } from "@/lib/api";
import {
  FREE_TECHNICIAN_SERVICE_LIMIT,
  PRO_PLAN_PRICE_USD,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingItem, ServiceItem } from "@/types";

export default function TechnicianOverviewPage() {
  const { user } = useAuthUser();
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [stats, setStats] = React.useState({
    totalServices: 0,
    approvedServices: 0,
    pendingRequests: 0,
  });
  const [recentBookings, setRecentBookings] = React.useState<BookingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [upgrading, setUpgrading] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      apiFetch<{
        services: ServiceItem[];
        stats: { totalServices: number; approvedServices: number };
      }>("/api/services/technician/my", { auth: true }),
      apiFetch<{ bookings: BookingItem[]; pendingRequests: number }>(
        "/api/bookings/technician",
        { auth: true }
      ),
    ])
      .then(([svcData, bkData]) => {
        setServices(svcData.services || []);
        setRecentBookings((bkData.bookings || []).slice(0, 5));
        setStats({
          totalServices: svcData.stats?.totalServices || 0,
          approvedServices: svcData.stats?.approvedServices || 0,
          pendingRequests: bkData.pendingRequests || 0,
        });
      })
      .catch(() => toast.error("Failed to load technician dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgradePro = async () => {
    setUpgrading(true);
    try {
      const res = await apiFetch<{ url: string; sessionId: string }>(
        "/api/users/pro-checkout-session",
        {
          method: "POST",
          auth: true,
        }
      );
      if (res.url) {
        window.location.assign(res.url);
      } else {
        toast.error("Unable to open Stripe Checkout.");
        setUpgrading(false);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not start Stripe checkout."
      );
      setUpgrading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const isPro = user?.plan === "pro";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Technician Overview"
        description="Manage your repair listings, respond to customer requests, and update live job progress."
        actions={
          <Button asChild>
            <Link href="/dashboard/technician/add-service">
              <PlusCircle className="h-4 w-4" />
              <span>Add Service</span>
            </Link>
          </Button>
        }
      />

      {/* Pro Plan Banner */}
      <Card className="border-brand/30 bg-brand/5">
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={isPro ? "accent" : "secondary"}>
                {isPro ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Pro Plan
                  </>
                ) : (
                  "Free Plan"
                )}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isPro
                  ? "Unlimited service listings enabled"
                  : `${stats.totalServices} / ${FREE_TECHNICIAN_SERVICE_LIMIT} services used`}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {isPro
                ? "Your technician profile and listings carry the Verified Pro badge."
                : `Upgrade to FixMate Pro for $${PRO_PLAN_PRICE_USD} USD (one-time via Stripe) to unlock unlimited service listings and a Verified Pro badge.`}
            </p>
          </div>
          {!isPro ? (
            <Button
              size="sm"
              onClick={handleUpgradePro}
              disabled={upgrading}
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {upgrading
                  ? "Redirecting to Stripe..."
                  : `Upgrade to Pro ($${PRO_PLAN_PRICE_USD} USD)`}
              </span>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Services"
          value={stats.totalServices}
          subtitle="All created listings"
          icon={Wrench}
          accent="brand"
        />
        <StatCard
          title="Approved Services"
          value={stats.approvedServices}
          subtitle="Live on public marketplace"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          subtitle="Awaiting your acceptance"
          icon={ClipboardList}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Repair Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/technician/requests">Manage All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No repair requests yet"
                description="Once customers book your approved services, requests appear here."
              />
            ) : (
              <div className="divide-y divide-border">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {booking.serviceTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customerName} • {formatDate(booking.preferredDate)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Services</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/technician/my-services">Manage All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No services created"
                description="Publish your first repair service to start receiving bookings."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/technician/add-service">
                      Add Service
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {services.slice(0, 5).map((service) => (
                  <div
                    key={service._id}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {service.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.category} • {formatCurrency(service.basePrice)}
                      </p>
                    </div>
                    <StatusBadge status={service.approvalStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
