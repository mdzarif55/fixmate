import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-8 rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-lg sm:p-12 lg:flex-row lg:items-center dark:bg-card dark:text-card-foreground">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-sky-300 dark:text-brand">
            <Wrench className="h-3.5 w-3.5" />
            <span>Start with FixMate Today</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Need a quick repair, or ready to grow your technician business?
          </h2>
          <p className="text-sm leading-relaxed opacity-85 sm:text-base">
            Book verified repair specialists with zero upfront payment, or
            register as a technician to publish your services and receive local
            repair requests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button size="lg" asChild>
            <Link href="/services">
              <span>Book a Repair</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/25 bg-transparent text-white hover:bg-white/10 dark:border-border dark:text-foreground dark:hover:bg-secondary"
          >
            <Link href="/sign-up?role=technician">Join as Technician</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
