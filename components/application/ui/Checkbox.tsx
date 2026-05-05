"use client";

import React from "react";

type Option = {
  label: string;
  value: string;
};

type CheckboxProps = {
  label?: string;
  hint?: string;
  error?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
};

export default function Checkbox({
  label,
  hint,
  error,
  value = [],
  onChange,
  options,
}: CheckboxProps) {
  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Label */}
      {label && (
        <label className="text-xs tracking-[0.2em] uppercase text-white/50">
          {label}
        </label>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const active = value.includes(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`
                w-full flex items-center justify-between
                px-4 py-3
                rounded-xl
                border
                text-left
                transition-all duration-300 ease-out

                ${
                  active
                    ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 border-white/15 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.12)]"
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.04] hover:text-white hover:border-white/20"
                }

                focus:outline-none
              `}
            >
              {/* Left content */}
              <span className="text-sm">{opt.label}</span>

              {/* Checkbox */}
              <div
                className={`
                  w-5 h-5 rounded-md
                  border flex items-center justify-center
                  transition-all duration-300

                  ${
                    active
                      ? "bg-blue-500/30 border-blue-400"
                      : "border-white/20"
                  }
                `}
              >
                {active && (
                  <svg
                    className="w-3 h-3 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-white/30 leading-relaxed">{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400/80 leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}