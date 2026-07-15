"use client";

import React from "react";

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  label?: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
};

export default function Input({
  label,
  hint,
  error,
  className = "",
  value,
  onChange,
  ...props
}: InputProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-white/60">{label}</label>
      ) : null}

      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          input
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