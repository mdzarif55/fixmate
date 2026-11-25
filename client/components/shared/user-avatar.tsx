"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const initials = (name || "FM")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-secondary",
        className
      )}
    >
      {image ? (
        <AvatarPrimitive.Image
          src={image}
          alt={name || "User avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
        {initials || "FM"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
