"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------
   TYPES
-------------------------------------*/

export type StatusType =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected";

/* ------------------------------------
   CONFIG MAP (DESIGN SYSTEM CORE)
-------------------------------------*/

const statusConfig: Record<
  StatusType,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  not_started: {
    label: "Not Started",
    className: "text-white/40 bg-white/5 border-white/10",
    dot: "bg-white/30",
  },

  in_progress: {
    label: "In Progress",
    className: "text-blue-200 bg-blue-500/10 border-blue-500/20",
    dot: "bg-blue-400",
  },

  submitted: {
    label: "Submitted",
    className: "text-indigo-200 bg-indigo-500/10 border-indigo-500/20",
    dot: "bg-indigo-400",
  },

  under_review: {
    label: "Under Review",
    className: "text-amber-200 bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
  },

  accepted: {
    label: "Accepted",
    className: "text-emerald-200 bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
  },

  rejected: {
    label: "Rejected",
    className: "text-red-200 bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
  },
};

/* ------------------------------------
   PROPS
-------------------------------------*/

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showDot?: boolean;
  pulse?: boolean;
}

/* ------------------------------------
   COMPONENT
-------------------------------------*/

export function StatusBadge({
  status,
  className,
  showDot = true,
  pulse = false,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full",
        "text-xs font-medium tracking-wide",
        "border backdrop-blur-md",
        "transition-all duration-200",
        config.className,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              config.dot,
              pulse && "animate-pulse"
            )}
          />
        </span>
      )}

      <span>{config.label}</span>
    </div>
  );
}