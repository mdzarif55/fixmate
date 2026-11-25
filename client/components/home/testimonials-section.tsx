import { Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const DEMO_TESTIMONIALS = [
  {
    name: "Elena Morales",
    role: "Customer • Austin, TX",
    service: "AC Deep Cleaning & Gas Refill",
    rating: 5,
    quote:
      "I loved being able to track when my technician accepted the request and started working. Paying via Stripe only after my AC was blowing cold again gave me complete peace of mind.",
  },
  {
    name: "David Chen",
    role: "Customer • Seattle, WA",
    service: "MacBook Battery & Thermal Service",
    rating: 5,
    quote:
      "Clear starting estimate upfront, fast shop drop-off turnaround, and the final invoice matched what was agreed. Best repair booking flow I have used.",
  },
  {
    name: "Nadia Patel",
    role: "Customer • Chicago, IL",
    service: "Front-Load Washer Drain Repair",
    rating: 5,
    quote:
      "Booked a home visit in two minutes. The technician updated each step in the dashboard and resolved a stubborn pump clog the same afternoon.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Community Stories
              </p>
              <Badge variant="outline" className="text-[10px]">
                Demo Seed Stories
              </Badge>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trusted by Customers Every Day
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Sample feedback illustrating the FixMate repair experience.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DEMO_TESTIMONIALS.map((item) => (
            <Card key={item.name} className="flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                  <p className="mt-1 text-xs font-medium text-brand">
                    {item.service}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
