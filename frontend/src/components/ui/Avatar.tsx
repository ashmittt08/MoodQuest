import { useState } from "react";

import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** User avatar: profile image when set, otherwise gradient initials. */
export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 via-primary-500 to-cyan-400 font-bold text-white ring-2 ring-primary-400/50 ring-offset-2 ring-offset-ink-900",
        SIZES[size],
        className,
      )}
    >
      {src && !failed ? (
        <img src={src} alt={name} className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name}>{initials(name)}</span>
      )}
    </span>
  );
}
