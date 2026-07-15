"use client";

import type { ReactNode } from "react";

type FieldVariant = "alignment" | "timing";

type FieldProps = {
  label?: string;
  description?: string;
  children: ReactNode;
  variant?: FieldVariant;
};

export default function Field({
  label,
  description,
  children,
  variant = "alignment",
}: FieldProps) {
  const isTiming = variant === "timing";

  return (
    <div className={isTiming ? "space-y-3" : ""}>
      {label ? (
        <label
          className={
            isTiming
              ? "block text-sm font-medium text-white/75"
              : "mb-2 block text-sm text-white/60"
          }
        >
          {label}
        </label>
      ) : null}

      {description ? (
        <p
          className={
            isTiming
              ? "max-w-2xl text-sm leading-6 text-white/45"
              : "mb-3 text-xs leading-5 text-white/40"
          }
        >
          {description}
        </p>
      ) : null}

      {children}
    </div>
  );
}