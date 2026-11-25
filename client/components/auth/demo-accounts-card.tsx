"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "customer@fixmate.app", pass: "Customer@1234" },
  { label: "Technician", email: "tech1@fixmate.app", pass: "Tech@1234" },
  { label: "Admin", email: "admin@fixmate.app", pass: "Admin@1234" },
] as const;

export function DemoAccountsCard({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3.5 space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <KeyRound className="h-3.5 w-3.5 text-brand" />
        <span>Quick Fill Demo Credentials (Seeded)</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <Button
            key={acc.label}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => onSelect(acc.email, acc.pass)}
          >
            {acc.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
