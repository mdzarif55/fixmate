import { Check, Circle, XCircle } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { BookingItem } from "@/types";

const STANDARD_STEPS = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "paid", label: "Paid" },
] as const;

export function BookingTimeline({ booking }: { booking: BookingItem }) {
  const historyMap = new Map<string, string>();
  for (const item of booking.statusHistory || []) {
    historyMap.set(item.status, item.changedAt);
  }
  if (booking.paymentStatus === "paid" && !historyMap.has("paid")) {
    historyMap.set("paid", booking.updatedAt || booking.createdAt);
  }

  if (booking.status === "cancelled" || booking.status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
        <XCircle className="h-4 w-4 text-destructive shrink-0" />
        <span>
          Job <strong className="capitalize text-foreground">{booking.status}</strong>
          {historyMap.get(booking.status)
            ? ` on ${formatDateTime(historyMap.get(booking.status)!)}`
            : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Repair Progress Timeline
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STANDARD_STEPS.map((step, index) => {
          const reachedAt = historyMap.get(step.key);
          const isPaidStep = step.key === "paid";
          const isReached =
            Boolean(reachedAt) ||
            (isPaidStep && booking.paymentStatus === "paid");

          return (
            <div key={step.key} className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  isReached
                    ? "bg-emerald-500 text-white"
                    : "border border-border bg-card text-muted-foreground"
                )}
              >
                {isReached ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Circle className="h-2.5 w-2.5" />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    isReached ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {index + 1}. {step.label}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {reachedAt ? formatDateTime(reachedAt) : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
