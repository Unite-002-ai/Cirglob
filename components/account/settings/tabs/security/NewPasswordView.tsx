"use client";

import { useMemo, useState } from "react";
import { ActionButton } from "../../ui";

type NewPasswordViewProps = {
  onSuccess: () => void;
};

export default function NewPasswordView({
  onSuccess,
}: NewPasswordViewProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // Password rules (UI-only validation)
  // -----------------------------
  const rules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      matches: password === confirm && password.length > 0,
    };
  }, [password, confirm]);

  const isValid =
    rules.minLength &&
    rules.hasUppercase &&
    rules.hasNumber &&
    rules.matches;

  // -----------------------------
  // Submit handler (UI flow only)
  // -----------------------------
  const handleSubmit = async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);

    try {
      // Placeholder for backend integration
      console.log("Updating password...");

      // Simulate slight delay for UX realism
      await new Promise((r) => setTimeout(r, 600));

      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 transition-all duration-200 ease-out">
      {/* HEADER */}
      <div>
        <h3 className="text-base font-semibold text-white">
          Create a new password
        </h3>
        <p className="mt-1 text-sm text-white/40">
          Choose a strong password to secure your account.
        </p>
      </div>

      {/* INPUTS */}
      <div className="space-y-4">
        {/* NEW PASSWORD */}
        <div className="space-y-1">
          <label className="text-xs text-white/50">New password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full px-3 py-2 pr-16
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                outline-none
                focus:border-white/30 focus:bg-white/10
                transition
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/70"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1">
          <label className="text-xs text-white/50">Confirm password</label>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="
                w-full px-3 py-2 pr-16
                bg-white/5 border border-white/10
                rounded-lg text-white text-sm
                outline-none
                focus:border-white/30 focus:bg-white/10
                transition
              "
            />

            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/70"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      </div>

      {/* PASSWORD RULES */}
      <div className="space-y-1 text-xs">
        <p className="text-white/40">Password requirements</p>

        <ul className="space-y-1 text-white/50">
          <li className={rules.minLength ? "text-white/70" : ""}>
            • At least 8 characters
          </li>
          <li className={rules.hasUppercase ? "text-white/70" : ""}>
            • Include uppercase letter
          </li>
          <li className={rules.hasNumber ? "text-white/70" : ""}>
            • Include number
          </li>
          <li className={rules.matches ? "text-white/70" : ""}>
            • Passwords match
          </li>
        </ul>
      </div>

      {/* ACTION */}
      <div className="pt-2">
        <ActionButton
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? "Updating..." : "Update password"}
        </ActionButton>
      </div>
    </div>
  );
}
