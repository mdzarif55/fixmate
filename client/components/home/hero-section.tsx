"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/services?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/services");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
        <div className="space-y-7 lg:col-span-7">
          <Badge variant="accent" className="px-3 py-1 text-xs font-medium">
            Smart Device &amp; Home Appliance Repair Platform
          </Badge>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:leading-[1.12]">
            Broken Device? Get It Fixed by Verified Technicians.
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Find trusted repair professionals for your devices and home
            appliances. Track your repair every step of the way and pay only
            after the work is completed.
          </p>

          {/* Hero Search */}
          <form
            onSubmit={handleSearch}
            className="flex max-w-xl flex-col gap-2.5 rounded-xl border border-border bg-background p-2 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Smartphone, Laptop, AC, Washing Machine..."
                className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" className="sm:px-6">
              Search Services
            </Button>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/services">
                <span>Explore Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-up?role=technician">Become a Technician</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 gap-3 pt-2 text-xs font-medium text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Admin-Approved Services</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-brand" />
              <span>Real-Time Job Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>Pay Only After Completion</span>
            </div>
          </div>
        </div>

        {/* Visual Right Column: Clean Interactive Status Preview Card */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Live Repair Tracker
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MacBook Pro Display Replacement
                  </p>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>

            <div className="mt-5 space-y-4">
              {[
                {
                  step: "Request Submitted",
                  detail: "Customer booked Home Visit repair",
                  done: true,
                },
                {
                  step: "Technician Accepted",
                  detail: "Assigned to certified hardware specialist",
                  done: true,
                },
                {
                  step: "Repair In Progress",
                  detail: "Diagnostics & screen calibration complete",
                  done: true,
                },
                {
                  step: "Completed & Pay Online",
                  detail: "Final invoice verified — Stripe Checkout ready",
                  done: false,
                },
              ].map((item, index) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div
                    className={
                      item.done
                        ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand text-xs font-bold"
                    }
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.step}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-3.5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Pay-after-completion guarantee
                </p>
                <p className="text-sm font-semibold text-foreground">
                  \$0 due until work is complete
                </p>
              </div>
              <Badge variant="info">Stripe Secured</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
