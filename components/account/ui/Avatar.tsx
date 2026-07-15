// components/account/ui/Avatar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";

  const firstInitial = parts[0]?.[0] ?? "";
  const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";

  return `${firstInitial}${lastInitial || firstInitial}`.toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = 36,
  className,
  showStatus = false,
  status = "online",
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = useMemo(() => getInitials(name), [name]);
  const showImage = Boolean(src && src.trim().length > 0 && !imageFailed);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "overflow-hidden select-none border border-white/10 bg-white/5 font-medium text-white",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xs tracking-wide text-white/80">{initials}</span>
      )}

      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#05060A]",
            status === "online" && "bg-green-400",
            status === "offline" && "bg-gray-500",
            status === "away" && "bg-yellow-400",
          )}
        />
      )}

      <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/5" />
    </div>
  );
}