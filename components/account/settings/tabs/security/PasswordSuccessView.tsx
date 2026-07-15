"use client";

import { ActionButton } from "../../ui";

type PasswordSuccessViewProps = {
  onDone: () => void;
};

export default function PasswordSuccessView({
  onDone,
}: PasswordSuccessViewProps) {
  return (
    <div className="space-y-6 transition-all duration-200 ease-out">
      {/* ICON */}
      <div className="flex justify-center pt-2">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          {/* simple check icon (no external dependency) */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white/70"
          >
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* TEXT */}
      <div className="text-center space-y-2">
        <h3 className="text-base font-semibold text-white">
          Password updated
        </h3>

        <p className="text-sm text-white/40 leading-relaxed">
          Your password has been successfully changed.
        </p>
      </div>

      {/* SUBTLE SECURITY NOTE (important SaaS pattern) */}
      <div className="text-center">
        <p className="text-xs text-white/30 max-w-sm mx-auto">
          If this wasn’t you, you should immediately secure your account or
          contact support.
        </p>
      </div>

      {/* ACTION */}
      <div className="pt-2">
        <ActionButton type="button" onClick={onDone}>
          Return to security
        </ActionButton>
      </div>
    </div>
  );
}
