import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 font-bold tracking-tight text-foreground",
        className
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-sm">
        <Wrench className="h-4 w-4" />
      </span>
      <span className="text-lg">
        Fix<span className="text-brand">Mate</span>
      </span>
    </Link>
  );
}
