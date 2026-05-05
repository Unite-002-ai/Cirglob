"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------
   TYPES
-------------------------------------*/

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  showValue?: boolean;
  className?: string;
  variant?: "default" | "subtle" | "glow";
}

/* ------------------------------------
   COMPONENT
-------------------------------------*/

export function ProgressBar({
  value,
  label,
  showValue = true,
  className,
  variant = "default",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* HEADER */}
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-white/60">
          {label && <span>{label}</span>}
          {showValue && <span>{clampedValue}%</span>}
        </div>
      )}

      {/* TRACK */}
      <div
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full",
          "bg-white/5 border border-white/10"
        )}
      >
        {/* FILL */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            "relative overflow-hidden",
            variant === "default" && "bg-white/70",
            variant === "subtle" && "bg-white/40",
            variant === "glow" &&
              "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
          )}
          style={{ width: `${clampedValue}%` }}
        >
          {/* GLOW EFFECT (ONLY FOR PREMIUM CONTEXTS) */}
          {variant === "glow" && (
            <div className="absolute inset-0 opacity-40 blur-md bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" />
          )}
        </div>

        {/* MICRO GRID SHINE (VERY SUBTLE LUXURY LAYER) */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-pulse" />
      </div>
    </div>
  );
}