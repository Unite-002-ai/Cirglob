"use client";

import React, { useEffect, useRef, useState } from "react";

type SelectProps<T extends string> = {
  label?: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
};

export default function Select<T extends string>({
  label,
  value,
  onChange,
  options,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-white/80">{label}</label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="
            flex h-12 w-full items-center justify-between rounded-2xl border border-white/10
            bg-white/[0.03] px-4 text-sm text-white
            outline-none shadow-[0_10px_30px_rgba(0,0,0,.14)]
            transition-all duration-200
            focus:border-blue-400/35 focus:bg-white/[0.05]
            hover:border-white/15
          "
          aria-expanded={open ? "true" : "false"}
        >
          <span className={value ? "text-white" : "text-white/30"}>
            {value || "Select"}
          </span>

          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open ? (
          <div
            className="
              absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl
              border border-white/10 bg-[#070b16]
              shadow-[0_30px_120px_rgba(0,0,0,.7)]
              backdrop-blur-xl
              scrollbar-hide
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            <button
              type="button"
              className="
                block w-full px-4 py-3 text-left text-sm text-white/55
                transition-colors duration-200
                hover:bg-white/[0.05] hover:text-white
                focus:bg-white/[0.05] focus:text-white focus:outline-none
              "
              onClick={() => {
                onChange("" as T);
                setOpen(false);
              }}
            >
              Select
            </button>

            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`
                  block w-full px-4 py-3 text-left text-sm transition-colors duration-200
                  hover:bg-white/[0.05] hover:text-white
                  focus:bg-white/[0.05] focus:text-white focus:outline-none
                  ${value === opt ? "text-white" : "text-white/80"}
                `}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}