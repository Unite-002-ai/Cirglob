"use client";

import {
  ChangeEvent,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * 🧠 FIELD TYPES
 */
type BaseProps = {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

type InputProps = BaseProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "children" | "dangerouslySetInnerHTML"
  > & {
    as?: "input";
    onChange?: (value: string) => void;
  };

type TextareaProps = BaseProps &
  Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "onChange" | "children" | "dangerouslySetInnerHTML"
  > & {
    as: "textarea";
    onChange?: (value: string) => void;
  };

type FieldProps = InputProps | TextareaProps;

/**
 * 🎯 FIELD COMPONENT
 */
export default function Field(props: FieldProps) {
  const {
    label,
    description,
    error,
    required,
    className,
    onChange,
    as,
    children: _children,
    dangerouslySetInnerHTML: _dangerouslySetInnerHTML,
    ...rest
  } = props as FieldProps & {
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: never;
  };

  return (
    <div className={`flex w-full flex-col gap-2 ${className || ""}`}>
      {/* 🔹 LABEL */}
      <label className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-white/50">
        <span>
          {label}
          {required && <span className="ml-1 text-white/30">*</span>}
        </span>
      </label>

      {/* 🔸 INPUT / TEXTAREA WRAPPER */}
      <div className="relative">
        {as === "textarea" ? (
          <textarea
            {...(rest as Omit<
              TextareaHTMLAttributes<HTMLTextAreaElement>,
              "onChange" | "children" | "dangerouslySetInnerHTML"
            >)}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange?.(e.target.value)
            }
            className="
              w-full min-h-[120px]
              resize-none
              rounded-xl
              border border-white/10
              bg-white/5
              px-4 py-3
              text-white/90
              outline-none
              placeholder:text-white/30
              transition-all duration-300
              focus:border-white/25
              focus:bg-white/7
              focus:ring-1 focus:ring-white/10
            "
          />
        ) : (
          <input
            type="text"
            {...(rest as Omit<
              InputHTMLAttributes<HTMLInputElement>,
              "onChange" | "children" | "dangerouslySetInnerHTML"
            >)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange?.(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border border-white/10
              bg-white/5
              px-4 py-3
              text-white/90
              outline-none
              placeholder:text-white/30
              transition-all duration-300
              focus:border-white/25
              focus:bg-white/7
              focus:ring-1 focus:ring-white/10
            "
          />
        )}
      </div>

      {/* 🔻 DESCRIPTION */}
      {description && !error && (
        <p className="text-xs leading-relaxed text-white/30">{description}</p>
      )}

      {/* ❗ ERROR STATE */}
      {error && <p className="text-xs text-red-400/80">{error}</p>}
    </div>
  );
}
