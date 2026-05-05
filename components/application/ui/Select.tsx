"use client";

import React, { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
};

export default function Select({
  label,
  hint,
  error,
  placeholder = "Select an option",
  options,
  value,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col gap-2" ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="text-xs tracking-[0.2em] uppercase text-white/50">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full h-12 px-4
          rounded-xl
          bg-white/[0.03]
          border border-white/10
          text-left
          text-white

          flex items-center justify-between

          transition-all duration-300

          hover:border-white/20
          hover:bg-white/[0.05]

          focus:border-blue-500/40
          focus:outline-none

          ${error ? "border-red-500/40" : ""}
        `}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : placeholder}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            relative z-50
          "
        >
          <div
            className="
              absolute mt-2 w-full
              rounded-xl
              border border-white/10
              bg-[#0A0B10]/95
              backdrop-blur-xl
              shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              overflow-hidden
              animate-[fadeIn_0.15s_ease-out]
            "
          >
            {options.map((opt) => {
              const active = opt.value === value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left text-sm
                    transition-all duration-200

                    ${
                      active
                        ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-white border-l-2 border-blue-500"
                        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="text-xs text-white/30 leading-relaxed">{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400/80 leading-relaxed">{error}</p>
      )}

      {/* Local animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}