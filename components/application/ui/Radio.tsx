'use client';

import React, { useId } from 'react';

type Option<T extends string = string> = {
  label: string;
  value: T;
};

type RadioProps<T extends string = string> = {
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  value?: T;
  onChange?: (value: T) => void;
  options: Option<T>[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  optionsClassName?: string;
  optionClassName?: string;
  activeOptionClassName?: string;
  multiple?: boolean;
  selectedValues?: T[];
  onMultiChange?: (values: T[]) => void;
  isOptionDisabled?: (option: T, selected: boolean) => boolean;
};

export default function Radio<T extends string = string>({
  name,
  label,
  hint,
  error,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = '',
  optionsClassName = '',
  optionClassName,
  activeOptionClassName,
  multiple = false,
  selectedValues,
  onMultiChange,
  isOptionDisabled,
}: RadioProps<T>) {
  const groupId = useId();

  const defaultInactiveClassName =
    'inline-flex h-8 w-auto items-center justify-center rounded-full border px-4 text-xs font-medium transition-all duration-200 focus:outline-none border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-400/20 hover:bg-blue-500/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

  const defaultActiveClassName =
    'inline-flex h-8 w-auto items-center justify-center rounded-full border px-4 text-xs font-medium transition-all duration-200 focus:outline-none border-blue-400/25 bg-blue-500/15 text-white shadow-[0_10px_30px_rgba(59,130,246,.12)] disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`.trim()}>
      {label ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">
            {label}
            {required ? <span className="ml-1 text-white/45">*</span> : null}
          </p>
        </div>
      ) : null}

      <div className={`flex flex-wrap gap-2 ${optionsClassName}`.trim()}>
        {options.map((opt, index) => {
          const selected = multiple
            ? selectedValues?.includes(opt.value) ?? false
            : value === opt.value;

          const optionDisabled =
            disabled || (isOptionDisabled?.(opt.value, selected) ?? false);

          const optionId = `${groupId}-${index}`;

          const buttonClassName = selected
            ? activeOptionClassName ?? defaultActiveClassName
            : optionClassName ?? defaultInactiveClassName;

          return (
            <button
              key={opt.value}
              id={optionId}
              name={name}
              type="button"
              disabled={optionDisabled}
              onClick={() => {
                if (optionDisabled) return;

                if (multiple) {
                  const current = selectedValues ?? [];
                  const next = selected
                    ? current.filter((v) => v !== opt.value)
                    : [...current, opt.value];

                  onMultiChange?.(next);
                  return;
                }

                onChange?.(opt.value);
              }}
              className={buttonClassName}
              aria-pressed={selected ? "true" : "false"}
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