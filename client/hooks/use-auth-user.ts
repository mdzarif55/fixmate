"use client";

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

  const user: SessionUser | null = rawUser
    ? {
        id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        image: rawUser.image ?? null,
        role: ((rawUser.role as string) || "customer") as UserRole,
        phone: (rawUser.phone as string) || "",
        area: (rawUser.area as string) || "",
        bio: (rawUser.bio as string) || "",
        plan: rawUser.plan === "pro" ? "pro" : "free",
      }
    : null;

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
