'use client';

import React, { useId } from 'react';

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
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function Radio({
  label,
  hint,
  error,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = '',
}: RadioProps) {
  const groupId = useId();

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      {label ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">
            {label}
            {required ? <span className="ml-1 text-white/45">*</span> : null}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {options.map((opt, index) => {
          const active = value === opt.value;
          const optionId = `${groupId}-${index}`;

          return (
            <button
              key={opt.value}
              id={optionId}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(opt.value)}
              className={`
                inline-flex h-8 w-auto items-center justify-center rounded-full border px-4 text-xs font-medium
                transition-all duration-200 focus:outline-none
                ${
                  active
                    ? 'border-blue-400/25 bg-blue-500/15 text-white shadow-[0_10px_30px_rgba(59,130,246,.12)]'
                    : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-400/20 hover:bg-blue-500/8 hover:text-white'
                }
                disabled:cursor-not-allowed disabled:opacity-50
              `}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {hint && !error ? <p className="text-xs text-white/45">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400/80">{error}</p> : null}
    </div>
  );
}
