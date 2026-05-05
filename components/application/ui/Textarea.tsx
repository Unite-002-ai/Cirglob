"use client";

import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Textarea({
  label,
  hint,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Label */}
      {label && (
        <label className="text-xs tracking-[0.2em] uppercase text-white/50">
          {label}
        </label>
      )}

      {/* Textarea Wrapper */}
      <div className="relative group">
        <textarea
          {...props}
          className={`
            w-full min-h-[140px] p-4
            rounded-xl
            bg-white/[0.03]
            border border-white/10
            text-white
            placeholder:text-white/25
            outline-none
            resize-none

            transition-all duration-300 ease-out

            focus:border-blue-500/40
            focus:bg-white/[0.05]
            focus:shadow-[0_0_0_1px_rgba(59,130,246,0.15)]

            hover:border-white/20

            ${error ? "border-red-500/40 focus:border-red-500/50" : ""}

            ${className}
          `}
        />

        {/* Subtle focus glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-indigo-500/5 blur-2xl" />
        </div>
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