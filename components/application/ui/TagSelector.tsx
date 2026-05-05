"use client";

import React from "react";

type TagSelectorProps = {
  label?: string;
  description?: string;
  options: string[];
  value: string[];
  onChange?: (value: string[]) => void;
  max?: number;
  error?: string;
};

export default function TagSelector({
  label,
  description,
  options,
  value = [],
  onChange,
  max = 3,
  error,
}: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    const exists = value.includes(tag);

    let updated: string[];

    if (exists) {
      updated = value.filter((v) => v !== tag);
    } else {
      if (value.length >= max) return; // silent guard (premium UX)
      updated = [...value, tag];
    }

    onChange?.(updated);
  };

  return (
    <div className="w-full space-y-3">
      {/* Label */}
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <div className="text-sm text-white/80 font-medium">
              {label}
            </div>
          )}
          {description && (
            <div className="text-xs text-white/40 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      )}

      {/* Tags Container */}
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const isActive = value.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`
                relative px-3 py-1.5 rounded-full text-xs
                transition-all duration-200 ease-out
                border backdrop-blur-xl
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-white/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/20"
                }
              `}
            >
              {/* subtle glow layer */}
              <span
                className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : ""
                } bg-gradient-to-r from-blue-500/10 to-purple-500/10`}
              />

              <span className="relative z-10">{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Helper Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-white/35">
          Select up to {max}
        </div>

        {value.length > 0 && (
          <div className="text-[11px] text-white/50">
            {value.length}/{max} selected
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400/80 pl-1">{error}</p>
      )}
    </div>
  );
}