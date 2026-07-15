"use client";

import { useState } from "react";

/**
 * 🧠 OPTION TYPE
 */
export type SelectOption = {
  label: string;
  value: string;
  description?: string;
};

/**
 * 🎯 PROPS
 * label is optional because the outer Field component already provides the visible label
 */
interface SelectProps {
  label?: string;
  description?: string;
  placeholder?: string;

  options: SelectOption[];

  value?: string;
  onChange: (value: string) => void;

  error?: string;
  required?: boolean;

  className?: string;
}

/**
 * 🧩 SELECT COMPONENT
 */
export default function Select({
  label,
  description,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  error,
  required,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`w-full flex flex-col gap-2 relative ${className || ""}`}>
      {/* 🔹 LABEL */}
      {label ? (
        <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
          <span>
            {label}
            {required && <span className="text-white/30 ml-1">*</span>}
          </span>
        </label>
      ) : null}

      {/* 🔸 SELECT TRIGGER */}
      <button
        type="button"
        aria-label={label || placeholder}
        onClick={() => setOpen((v) => !v)}
        className="
          w-full
          px-4 py-3
          flex items-center justify-between
          bg-white/5
          border border-white/10
          rounded-xl
          text-left
          text-white/90
          transition-all duration-300
          hover:bg-white/7
          hover:border-white/20
          focus:outline-none
        "
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : placeholder}
        </span>

        {/* Chevron */}
        <span className="text-white/30 text-xs">▾</span>
      </button>

      {/* 🔻 DESCRIPTION */}
      {description && !error && (
        <p className="text-xs text-white/30 leading-relaxed">
          {description}
        </p>
      )}

      {/* ❗ ERROR */}
      {error && <p className="text-xs text-red-400/80">{error}</p>}

      {/* 📦 DROPDOWN PANEL */}
      {open && (
        <>
          {/* backdrop (click to close) */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="
            absolute z-50 top-[100%] mt-2 w-full
            rounded-xl
            border border-white/10
            bg-[#0A0B10]/95
            backdrop-blur-xl
            shadow-2xl
            overflow-hidden
          "
          >
            {options.map((option) => {
              const isActive = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-3
                    transition-all duration-200
                    hover:bg-white/5
                    flex flex-col gap-1
                    ${
                      isActive
                        ? "bg-white/5 text-white"
                        : "text-white/70"
                    }
                  `}
                >
                  <span className="text-sm">{option.label}</span>

                  {option.description && (
                    <span className="text-xs text-white/30 leading-relaxed">
                      {option.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
