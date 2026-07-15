"use client";

import Link from "next/link";
import React from "react";

import { ROUTES } from "@/lib/constants";

interface ReturnToApplicationButtonProps {
  href?: string;
  className?: string;
}

export default function ReturnToApplicationButton({
  href = ROUTES.APPLY_DASHBOARD,
  className = "",
}: ReturnToApplicationButtonProps) {
  return (
    <Link
      href={href}
      aria-label="Back to dashboard"
      className={`
        inline-flex items-center justify-center
        rounded-full border border-white/10
        bg-white/5 px-4 py-2.5
        text-sm font-medium text-white/80
        transition
        hover:bg-white/10 hover:text-white
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-offset-0
        ${className}
      `}
    >
      ← Back
    </Link>
  );
}