import {
  Activity,
  BadgeDollarSign,
  Home,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const FEATURES = [
  {
    title: "Verified Technicians",
    description:
      "Every listed service goes through admin review before appearing on the marketplace.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent Pricing",
    description:
      "Clear starting prices upfront and confirmed final amounts set upon job completion.",
    icon: BadgeDollarSign,
  },
  {
    title: "Track Your Repair",
    description:
      "Follow every status milestone from requested to accepted, in progress, completed, and paid.",
    icon: Activity,
  },
  {
    title: "Secure Payments",
    description:
      "Protected Stripe Checkout processing with verified server-side webhook confirmation.",
    icon: Lock,
  },
  {
    title: "Pay After Completion",
    description:
      "Your payment button unlocks only after your technician completes the repair work.",
    icon: Wallet,
  },
  {
    title: "Convenient Service",
    description:
      "Filter technicians offering doorstep Home Visits or fast Shop Drop-off service.",
    icon: Home,
  },
];

export function WhyChooseFixMate() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Built for Trust
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Why Choose FixMate
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Designed around accountability, clear communication, and zero upfront
          payment risk.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
