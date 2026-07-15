"use client";

import { useMemo, useState } from "react";

/**
 * 🧠 OPTION TYPE
 */
export type MultiSelectOption = {
  label: string;
  value: string;
  description?: string;
};

/**
 * 🎯 PROPS
 * label is optional because the outer Field component already provides the visible label
 */
interface MultiSelectProps {
  label?: string;
  description?: string;
  placeholder?: string;

  options: MultiSelectOption[];

  value: string[];
  onChange: (value: string[]) => void;

  maxSelected?: number;

  error?: string;
  className?: string;
}

/**
 * 🧩 MULTI SELECT (INVESTOR-GRADE CONTROLLED PICKER)
 */
export default function MultiSelect({
  label,
  description,
  placeholder = "Select options",
  options,
  value,
  onChange,
  maxSelected,
  error,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(value || []), [value]);

  const toggle = (val: string) => {
    const isSelected = selectedSet.has(val);

    let next: string[];

    if (isSelected) {
      next = value.filter((v) => v !== val);
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      next = [...value, val];
    }

    onChange(next);
  };

  const selectedLabels = options
    .filter((o) => selectedSet.has(o.value))
    .map((o) => o.label);

  return (
    <div className={`w-full flex flex-col gap-2 relative ${className || ""}`}>
      {/* 🔹 LABEL */}
      {label ? (
        <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
          <span>{label}</span>

          {maxSelected && (
            <span className="text-[10px] text-white/30">max {maxSelected}</span>
          )}
        </label>
      ) : null}

      {/* 🔸 TRIGGER */}
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
          transition-all duration-300
          hover:bg-white/7
          hover:border-white/20
        "
      >
        <div className="flex flex-col gap-1">
          {selectedLabels.length > 0 ? (
            <span className="text-white text-sm">
              {selectedLabels.join(", ")}
            </span>
          ) : (
            <span className="text-white/30 text-sm">
              {placeholder}
            </span>
          )}
        </div>

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
          {/* backdrop */}
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
              const isActive = selectedSet.has(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>

                    {/* check indicator */}
                    <span className="text-xs text-white/40">
                      {isActive ? "●" : ""}
                    </span>
                  </div>

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
