"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Cirglob Card System
 * - Glassmorphism-first
 * - No borders unless intentional
 * - Hover elevation = trust signal
 * - Used across Identity Center, Applications, Security, etc.
 */

export type CardVariant =
  | "default"
  | "glass"
  | "elevated"
  | "outline"
  | "interactive";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "xl";
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-white/5 border border-white/10 backdrop-blur-xl",
  glass:
    "bg-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.35)]",
  elevated:
    "bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]",
  outline:
    "bg-transparent border border-white/10",
  interactive:
    "bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] hover:-translate-y-[2px] cursor-pointer",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

const roundedStyles = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      padding = "md",
      rounded = "xl",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // base
          "relative w-full text-white transition-all duration-300",
          
          // variant system
          variantStyles[variant],

          // padding
          paddingStyles[padding],

          // radius system
          roundedStyles[rounded],

          // optional hover lift (global override)
          hover && "hover:shadow-[0_25px_90px_rgba(0,0,0,0.55)] hover:-translate-y-[2px]",

          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";