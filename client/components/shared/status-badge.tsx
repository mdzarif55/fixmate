import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "info" | "accent" }
> = {
  requested: { label: "Requested", variant: "warning" },
  accepted: { label: "Accepted", variant: "info" },
  "in-progress": { label: "In Progress", variant: "accent" },
  completed: { label: "Completed", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  paid: { label: "Paid", variant: "success" },
  unpaid: { label: "Unpaid", variant: "warning" },
  customer: { label: "Customer", variant: "info" },
  technician: { label: "Technician", variant: "accent" },
  admin: { label: "Admin", variant: "default" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status.toLowerCase();
  const config = STATUS_MAP[key] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  );
}
