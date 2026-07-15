"use client";

import { useId } from "react";

/**
 * 🎯 PROPS
 */
interface CheckboxProps {
  label: string;
  description?: string;

  checked: boolean;
  onChange: (checked: boolean) => void;

  error?: string;

  className?: string;
}

/**
 * 🧩 CHECKBOX (TRUST + CONSENT LAYER)
 */
export default function Checkbox({
  label,
  description,
  checked,
  onChange,
  error,
  className,
}: CheckboxProps) {
  const id = useId();

  return (
    <div className={`w-full flex flex-col gap-2 ${className || ""}`}>

      {/* 🔷 ROW */}
      <div className="flex items-start gap-3">

        {/* ⬜ CHECKBOX CORE */}
        <button
          id={id}
          type="button"
          onClick={() => onChange(!checked)}
          className="
            mt-0.5
            w-5 h-5
            flex items-center justify-center
            rounded-md
            border border-white/20
            bg-white/5
            transition-all duration-200
            hover:border-white/40
            hover:bg-white/10
            focus:outline-none
          "
        >
          {checked && (
            <div className="
              w-2.5 h-2.5
              rounded-sm
              bg-white/80
            " />
          )}
        </button>

        {/* 🧠 TEXT BLOCK */}
        <label
          htmlFor={id}
          className="flex flex-col cursor-pointer select-none"
          onClick={() => onChange(!checked)}
        >
          <span className="text-sm text-white/80 leading-snug">
            {label}
          </span>

          {description && (
            <span className="text-xs text-white/30 leading-relaxed mt-1">
              {description}
            </span>
          )}
        </label>
      </div>

      {/* ❗ ERROR STATE */}
      {error && (
        <p className="text-xs text-red-400/80 ml-8">
          {error}
        </p>
      )}
    </div>
  );
}
