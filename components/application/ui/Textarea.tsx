"use client";

import React from "react";

type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value"
> & {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (v: string) => void;
};

export default function Textarea({
  label,
  hint,
  error,
  className = "",
  value,
  onChange,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-white/60">{label}</label>
      ) : null}

      <textarea
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          input
          scrollbar-hide
          min-h-[140px]
          resize-none
          overflow-y-auto
          ${error ? "border-red-500/40 focus:border-red-500/50" : ""}
          ${className}
        `}
      />

      {hint && !error ? (
        <p className="text-xs text-white/30 leading-relaxed">{hint}</p>
      ) : null}

      {error ? (
        <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
      ) : null}
    </div>
  );
}