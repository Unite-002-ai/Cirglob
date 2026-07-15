"use client";

import { useEffect, useRef } from "react";

type VerificationCodeInputProps = {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

export default function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // -----------------------------------
  // Auto-focus first empty input
  // -----------------------------------
  useEffect(() => {
    const firstEmptyIndex = value.findIndex((v) => !v);
    const targetIndex =
      firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;

    inputRefs.current[targetIndex]?.focus();
  }, [value, length]);

  // -----------------------------------
  // Handle single digit input
  // -----------------------------------
  const handleChange = (val: string, index: number) => {
    if (disabled) return;

    if (!/^\d*$/.test(val)) return;

    const digit = val.slice(-1);
    const next = [...value];
    next[index] = digit;

    onChange(next);

    // auto advance
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // -----------------------------------
  // Keyboard navigation
  // -----------------------------------
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (value[index]) {
        const next = [...value];
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // -----------------------------------
  // Paste support (critical UX feature)
  // -----------------------------------
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    const next = Array(length).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });

    onChange(next);

    const lastIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  // -----------------------------------
  // Render
  // -----------------------------------
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={value[index] || ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          className={`
            w-12 h-12
            text-center text-white text-lg
            bg-white/5 border border-white/10
            rounded-lg outline-none
            transition
            focus:border-white/30 focus:bg-white/10
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        />
      ))}
    </div>
  );
}
