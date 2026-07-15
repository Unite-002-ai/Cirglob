"use client";

/**
 * -----------------------------
 * Security Flow State Machine
 * -----------------------------
 * This defines the ONLY allowed UI states
 * inside the Security tab flow.
 *
 * No redirects. No route-based auth.
 * Everything is internal state transitions.
 */
export type SecurityView =
  | "overview"
  | "verify"
  | "password"
  | "success";

/**
 * -----------------------------
 * Profile Security Settings
 * -----------------------------
 * Represents persisted user preferences
 * for security-related toggles.
 */
export type ProfileSettings = {
  login_alerts: boolean;
  trusted_devices: boolean;
};

/**
 * -----------------------------
 * Verification Code State
 * -----------------------------
 * Used by OTP / 2FA / email verification flows.
 */
export type VerificationCodeState = {
  code: string[];
  expiresAt?: number; // timestamp (ms)
  attempts?: number;
};

/**
 * -----------------------------
 * Password Validation State
 * -----------------------------
 * Used inside NewPasswordView only.
 */
export type PasswordValidationState = {
  password: string;
  confirmPassword: string;
  rules: {
    minLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    matches: boolean;
  };
};

/**
 * -----------------------------
 * Security Tab Props (Controller)
 * -----------------------------
 * Passed into SecurityTab.tsx
 */
export type SecurityTabProps = {
  userId: string;
  initialSettings: ProfileSettings;
};

/**
 * -----------------------------
 * View Transition Payload
 * -----------------------------
 * Optional future extension for animations,
 * logging, or analytics tracking.
 */
export type SecurityTransition = {
  from: SecurityView;
  to: SecurityView;
  timestamp: number;
};
