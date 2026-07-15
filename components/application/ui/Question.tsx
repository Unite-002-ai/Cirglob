"use client";

import type { ReactNode } from "react";

type QuestionProps = {
  label: string;
  description?: string;
  children: ReactNode;
};

export default function Question({
  label,
  description,
  children,
}: QuestionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm text-white/70">{label}</p>
        {description ? (
          <p className="text-sm leading-6 text-white/40">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}