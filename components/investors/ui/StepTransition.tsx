"use client";

import { ReactNode, useEffect, useState } from "react";

interface StepTransitionProps {
  children: ReactNode;

  /**
   * Used to remount the panel when the active step changes.
   */
  stepKey: string;

  /**
   * Direction is kept for future motion tuning.
   */
  direction?: "forward" | "backward";

  /**
   * Controls whether this step is visible
   */
  active?: boolean;

  /**
   * Optional delay before mounting (for smoother step swaps)
   */
  delayMs?: number;

  className?: string;
}

/**
 * 🧠 STEP TRANSITION SYSTEM
 * Purpose:
 * - soften step changes
 * - avoid "hard form switching"
 * - create guided flow perception
 */
export default function StepTransition({
  children,
  stepKey,
  direction = "forward",
  active = true,
  delayMs = 0,
  className,
}: StepTransitionProps) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (active) {
      setMounted(true);

      timeout = setTimeout(() => {
        setVisible(true);
      }, delayMs);
    } else {
      setVisible(false);

      timeout = setTimeout(() => {
        setMounted(false);
      }, 180);
    }

    return () => clearTimeout(timeout);
  }, [active, delayMs, stepKey]);

  if (!mounted) return null;

  return (
    <div
      key={stepKey}
      data-direction={direction}
      className={`
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
        ${className || ""}
      `}
      style={{
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
