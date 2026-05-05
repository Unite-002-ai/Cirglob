"use client";

import Image from "next/image";
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
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = 36,
  className,
  showStatus = false,
  status = "online",
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "bg-white/5 border border-white/10 text-white font-medium",
        "overflow-hidden select-none",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* IMAGE STATE */}
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      ) : (
        /* FALLBACK INITIALS */
        <span className="text-xs tracking-wide text-white/80">
          {initials}
        </span>
      )}

      {/* STATUS INDICATOR (optional system layer) */}
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#05060A]",
            status === "online" && "bg-green-400",
            status === "offline" && "bg-gray-500",
            status === "away" && "bg-yellow-400"
          )}
        />
      )}

      {/* SUBTLE GLOW (luxury SaaS detail) */}
      <div className="absolute inset-0 ring-1 ring-white/5 rounded-full pointer-events-none" />
    </div>
  );
}