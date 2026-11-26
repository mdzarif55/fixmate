"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/lib/constants";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  phone?: string;
  area?: string;
  bio?: string;
  plan?: "free" | "pro";
}

export function getDashboardPathByRole(role?: string): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "technician") return "/dashboard/technician";
  return "/dashboard/customer";
}

export function useAuthUser() {
  const router = useRouter();
  const { data: session, isPending, error, refetch } = authClient.useSession();

  const rawUser = session?.user as
    | (Record<string, unknown> & {
        id: string;
        name: string;
        email: string;
        image?: string | null;
      })
    | undefined;

  const userId = rawUser?.id;
  const userName = rawUser?.name;
  const userEmail = rawUser?.email;
  const userImage = rawUser?.image ?? null;
  const userRole = ((rawUser?.role as string) || "customer") as UserRole;
  const userPhone = (rawUser?.phone as string) || "";
  const userArea = (rawUser?.area as string) || "";
  const userBio = (rawUser?.bio as string) || "";
  const userPlan: "free" | "pro" = rawUser?.plan === "pro" ? "pro" : "free";

  const user: SessionUser | null = React.useMemo(
    () =>
      userId && userName && userEmail
        ? {
            id: userId,
            name: userName,
            email: userEmail,
            image: userImage,
            role: userRole,
            phone: userPhone,
            area: userArea,
            bio: userBio,
            plan: userPlan,
          }
        : null,
    [
      userId,
      userName,
      userEmail,
      userImage,
      userRole,
      userPhone,
      userArea,
      userBio,
      userPlan,
    ]
  );

  const signOut = async () => {
    await authClient.signOut();
    toast.success("Signed out successfully.");
    router.push("/");
    router.refresh();
  };

  return {
    user,
    session,
    isPending,
    error,
    refetch,
    signOut,
  };
}
