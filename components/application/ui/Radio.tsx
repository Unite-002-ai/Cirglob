"use client";

import React from "react";

type Option = {
  label: string;
  value: string;
};

type RadioProps = {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
};

export default function Radio({
  label,
  hint,
  error,
  value,
  onChange,
  options,
}: RadioProps) {
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
          const active = value === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange?.(opt.value)}
              className={`
                w-full flex items-center justify-between
                px-4 py-3
                rounded-xl
                border
                text-left
                transition-all duration-300 ease-out

                ${
                  active
                    ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 border-white/15 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                    : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.04] hover:text-white hover:border-white/20"
                }

                focus:outline-none
              `}
            >
              <span className="text-sm">{opt.label}</span>

              {/* Radio Indicator */}
              <div
                className={`
                  w-4 h-4 rounded-full border
                  flex items-center justify-center
                  transition-all duration-300

                  ${
                    active
                      ? "border-blue-400 bg-blue-500/30"
                      : "border-white/20"
                  }
                `}
              >
                {active && (
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
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