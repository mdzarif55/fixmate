"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  CreditCard,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { RepairRequestForm } from "@/components/booking/repair-request-form";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthUser } from "@/hooks/use-auth-user";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ServiceDetailsResponse } from "@/types";

export function ServiceDetailsView({
  details,
}: {
  details: ServiceDetailsResponse;
}) {
  const router = useRouter();
  const { user, isPending } = useAuthUser();
  const [requestOpen, setRequestOpen] = React.useState(false);

  const { service, technician, reviews } = details;

  const isNonCustomer =
    user && (user.role === "technician" || user.role === "admin");

  const handleRequestClick = () => {
    if (!user) {
      router.push(
        `/sign-in?callbackUrl=${encodeURIComponent(`/services/${service._id}`)}`
      );
      return;
    }
    if (user.role !== "customer") {
      return;
    }
    setRequestOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Services</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="relative h-72 w-full bg-muted sm:h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{service.category}</Badge>
                <Badge variant="accent">{service.serviceMode}</Badge>
                {service.reviewCount && service.reviewCount > 0 ? (
                  <Badge variant="warning">
                    <Star className="h-3 w-3 fill-current" />
                    <span>
                      {Number(service.ratingAverage || 0).toFixed(1)} (
                      {service.reviewCount} reviews)
                    </span>
                  </Badge>
                ) : null}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {service.title}
              </h1>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-brand" />
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Duration</p>
                    <p className="text-sm font-semibold">
                      {service.estimatedDuration}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Service Mode</p>
                    <p className="text-sm font-semibold">
                      {service.serviceMode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Service Area</p>
                    <p className="text-sm font-semibold">
                      {service.serviceArea}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Service Description
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Reviews (if any) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Verified Customer Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No customer reviews yet. Reviews can be submitted after a
                  completed and paid repair.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="rounded-xl border border-border bg-background p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {rev.customerName}
                        </p>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rev.comment}
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        {formatDate(rev.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking & Technician Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Starting Inspection &amp; Base Rate
                </p>
                <p className="mt-1 text-3xl font-extrabold text-foreground">
                  {formatCurrency(service.basePrice)}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Pay only after repair is marked completed</span>
                </p>
              </div>

              {isPending ? (
                <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
              ) : isNonCustomer ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Customer Account Required</span>
                  </div>
                  <p className="text-xs">Only customers can request a repair.</p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleRequestClick}
                >
                  <CalendarClock className="h-4 w-4" />
                  <span>
                    {user ? "Request Repair" : "Sign In to Request Repair"}
                  </span>
                </Button>
              )}

              {/* Technician Profile Box */}
              <div className="border-t border-border pt-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned Technician
                </p>
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={technician?.name || service.technicianName}
                    image={technician?.image}
                    className="h-12 w-12"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-foreground">
                        {technician?.name || service.technicianName}
                      </p>
                      {(technician?.plan === "pro" || service.technicianIsPro) ? (
                        <Badge variant="accent" className="text-[10px] px-1.5 py-0">
                          <ShieldCheck className="h-3 w-3" />
                          Pro
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {technician?.area || service.serviceArea}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {technician?.bio ||
                    "Verified FixMate specialist experienced in diagnostics, component replacement, and transparent post-repair service."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {user && user.role === "customer" ? (
        <RepairRequestForm
          open={requestOpen}
          onOpenChange={setRequestOpen}
          service={service}
          user={user}
        />
      ) : null}
    </div>
  );
}
