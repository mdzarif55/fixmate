import Link from "next/link";
import {
  AirVent,
  Cpu,
  Laptop,
  Refrigerator,
  Smartphone,
  Tv,
  WashingMachine,
  Zap,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  ServiceCategory,
  { icon: React.ComponentType<{ className?: string }>; subtitle: string }
> = {
  Smartphone: {
    icon: Smartphone,
    subtitle: "Screens, batteries & ports",
  },
  "Laptop & PC": {
    icon: Laptop,
    subtitle: "Hardware, OS & upgrades",
  },
  AC: {
    icon: AirVent,
    subtitle: "Cooling, gas refill & tune-up",
  },
  Refrigerator: {
    icon: Refrigerator,
    subtitle: "Compressors, seals & cooling",
  },
  TV: {
    icon: Tv,
    subtitle: "Display panels & power boards",
  },
  "Washing Machine": {
    icon: WashingMachine,
    subtitle: "Motors, drums & drainage",
  },
  Electrical: {
    icon: Zap,
    subtitle: "Wiring, breakers & fixtures",
  },
};

export function CategoryCard({
  category,
  className,
}: {
  category: ServiceCategory;
  className?: string;
}) {
  const meta = CATEGORY_META[category] || {
    icon: Cpu,
    subtitle: "Verified repair specialists",
  };
  const Icon = meta.icon;

  return (
    <Link
      href={`/services?category=${encodeURIComponent(category)}`}
      className={cn(
        "group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md",
        className
      )}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
          {category}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{meta.subtitle}</p>
      </div>
    </Link>
  );
}
