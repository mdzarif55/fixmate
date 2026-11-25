import { CalendarPlus, CheckCircle, CreditCard, Search } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Find a Service",
    description:
      "Search by device or appliance category, compare transparent starting prices, and choose home visit or shop drop-off.",
    icon: Search,
  },
  {
    number: "02",
    title: "Send a Repair Request",
    description:
      "Describe the issue, pick your preferred service date, and submit your request in under a minute.",
    icon: CalendarPlus,
  },
  {
    number: "03",
    title: "Technician Fixes It",
    description:
      "A verified technician accepts your job, updates progress live, and completes the repair with a final confirmed price.",
    icon: CheckCircle,
  },
  {
    number: "04",
    title: "Pay After Completion",
    description:
      "Only once the job is marked completed do you pay securely online via Stripe Checkout and download your invoice.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Simple Process
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            How FixMate Works
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Repair smarter. Track every step. Pay when it&apos;s done.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col rounded-xl border border-border bg-background p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    STEP {step.number}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
