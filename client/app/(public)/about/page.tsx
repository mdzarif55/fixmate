import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { HowItWorks } from "@/components/home/how-it-works";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-4">
            About FixMate
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Repair Smarter. Track Every Step. Pay When It&apos;s Done.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            FixMate connects everyday device owners with vetted local repair
            technicians across smartphones, laptops, cooling appliances, and
            home electrical systems—backed by a transparent post-completion
            payment model.
          </p>
        </div>
      </section>

      <HowItWorks />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">For Customers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare approved technicians, submit repair requests with clear
                problem descriptions, cancel pending requests anytime, and pay
                via Stripe only after work is marked completed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">For Technicians</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Publish specialized repair services, toggle availability, accept
                or reject requests, update job stages in real time, and confirm
                final repair pricing upon completion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Platform Quality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Administrators review every service before it goes live,
                monitor active bookings and transactions, and maintain
                end-to-end accountability.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-foreground">
              Ready to get your device repaired?
            </h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Zero upfront fee</span>
              <span className="mx-1">•</span>
              <CreditCard className="h-4 w-4 text-brand" />
              <span>Stripe protected checkout</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/services">
                <span>Browse Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
