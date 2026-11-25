"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getDashboardPathByRole, useAuthUser } from "@/hooks/use-auth-user";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isPending } = useAuthUser();

  React.useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    router.replace(getDashboardPathByRole(user.role));
  }, [user, isPending, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-brand" />
      <p className="text-sm">Redirecting to your workspace...</p>
    </div>
  );
}
