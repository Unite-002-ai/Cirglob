"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton } from "../../ui";

type VerifyCodeViewProps = {
  onVerified: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
  onCancel: () => void;
};

const CODE_LENGTH = 6;

export default function VerifyCodeView({
  onVerified,
  onResend,
  onChangeEmail,
  onCancel,
}: VerifyCodeViewProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isComplete = code.every((v) => v !== "");

  // -----------------------------
  // Auto focus first input
  // -----------------------------
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // -----------------------------
  // Handle input change
  // -----------------------------
  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < CODE_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  // -----------------------------
  // Handle key navigation
  // -----------------------------
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }

    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  // -----------------------------
  // Handle paste (critical UX)
  // -----------------------------
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const newCode = pasted.split("");
    while (newCode.length < CODE_LENGTH) {
      newCode.push("");
    }

    setCode(newCode);
    setActiveIndex(Math.min(pasted.length, CODE_LENGTH - 1));

    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  // -----------------------------
  // Submit verification
  // -----------------------------
  const handleContinue = () => {
    if (!isComplete) return;

    const finalCode = code.join("");

    // Placeholder: backend verification hook point
    console.log("Verifying code:", finalCode);

    // Assume success for UI flow (real API later)
    onVerified();
  };

  return (
    <div className="space-y-6 transition-all duration-200 ease-out">
      {/* HEADER */}
      <div>
        <h3 className="text-base font-semibold text-white">
          Verify your identity
        </h3>
        <p className="mt-1 text-sm text-white/40">
          We sent a 6-digit verification code to your registered email address.
        </p>
      </div>

      {/* CODE INPUTS */}
      <div className="flex gap-2 justify-center">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            inputMode="numeric"
            maxLength={1}
            className={`
              w-12 h-12 text-center text-white text-lg
              bg-white/5 border border-white/10 rounded-lg
              outline-none transition
              focus:border-white/30 focus:bg-white/10
              ${activeIndex === index ? "border-white/30" : ""}
            `}
          />
        ))}
      </div>

      {/* HELP TEXT */}
      <p className="text-xs text-center text-white/30">
        Code expires in 10 minutes
      </p>

      {/* ACTIONS */}
      <div className="flex flex-col gap-2">
        <ActionButton
          type="button"
          disabled={!isComplete}
          onClick={handleContinue}
        >
          Continue
        </ActionButton>

        <div className="flex justify-between text-xs text-white/40 pt-1">
          <button
            type="button"
            onClick={onResend}
            className="hover:text-white/70 transition"
          >
            Resend code
          </button>

          <button
            type="button"
            onClick={onChangeEmail}
            className="hover:text-white/70 transition"
          >
            Change email
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="hover:text-white/70 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
