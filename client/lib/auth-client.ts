"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [jwtClient()],
});

export async function getJwtToken(): Promise<string | null> {
  try {
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      return null;
    }
    return data.token;
  } catch {
    return null;
  }
}
