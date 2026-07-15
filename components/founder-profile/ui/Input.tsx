"use client";

import React, { useId } from "react";

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  label?: string;
  hint?: string;
  error?: string;
  value?: string | number | null | undefined;
  onChange?: (value: string) => void;
};

export default function Input({
  label,
  hint,
  error,
  value,
  onChange,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full flex flex-col gap-2">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-white/60">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        {...props}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={!!error}
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