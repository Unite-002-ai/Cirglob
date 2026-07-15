"use client";

import React, { useId } from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  className = "",
}: CheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 select-none ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0"
      />

      <div className="flex flex-col">
        <span className="text-sm font-medium text-zinc-900">{label}</span>

        {description ? (
          <span className="text-xs leading-relaxed text-zinc-500">
            {description}
          </span>
        ) : null}
      </div>
    </label>
  );
}
