import type { ReactNode } from "react";

/**
 * SETTINGS SYSTEM CORE TYPES
 * -----------------------------------------
 * This file defines ONLY UI + flow-safe types.
 * No direct Supabase logic here.
 *
 * Backend security rules (RLS, OTP, sessions, trusted devices)
 * are handled in:
 * - server actions (/app/actions/security)
 * - lib/security/*
 * - supabase/functions/*
 */

export type Tab =
  | "profile"
  | "security"
  | "notifications";

/* =========================================================
   PROFILE TYPES
   ========================================================= */

export type InitialProfile = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

/* =========================================================
   SETTINGS TYPES (matches profile_settings table)
   ========================================================= */

export type InitialSettings = {
  // notification system
  notifications_enabled: boolean;
  login_alerts: boolean;
  system_updates: boolean;
  app_updates: boolean;

  // security system (Supabase-backed)
  trusted_devices: boolean;

  /**
   * NEW SECURITY FLAGS (matches updated DB plan)
   * ------------------------------------------
   * These map to profile_settings table extensions:
   */

  // require OTP when a new device is detected
  require_new_device_verification?: boolean;

  // revoke all sessions after password change
  revoke_sessions_on_password_change?: boolean;

};

/* =========================================================
   SECURITY FLOW TYPES (NEW - CORE FOR OTP SYSTEM)
   ========================================================= */

/**
 * Represents the current state of the Security Flow UI
 * (SecurityTab will become a state machine)
 */
export type SecurityFlowStep =
  | "overview"
  | "request_otp"
  | "verify_otp"
  | "change_password"
  | "success";

/**
 * OTP verification context
 * Used by:
 * - security_verifications table
 * - verify-otp server action
 */
export type OtpContextType =
  | "password_change"
  | "device_verify"
  | "login_verification";

/**
 * OTP flow state
 */
export type OtpState = {
  sessionId?: string;
  email?: string;
  expiresAt?: string;
  attemptsLeft?: number;
  resendAvailableAt?: string;
  type?: OtpContextType;
};

/* =========================================================
   SESSION TYPES (maps to sessions_log table)
   ========================================================= */

export type SessionLog = {
  id: string;
  user_id: string;

  device_id?: string;
  session_id?: string;

  browser?: string;
  os?: string;

  country?: string;
  city?: string;

  ip_hash?: string;

  login_success: boolean;
  trusted: boolean;

  created_at: string;
};

/* =========================================================
   TRUSTED DEVICES (maps to trusted_devices table)
   ========================================================= */

export type TrustedDevice = {
  id: string;
  user_id: string;

  device_id: string;

  browser?: string;
  os?: string;

  user_agent?: string;

  last_ip_hash?: string;

  last_seen_at?: string;
  created_at: string;

  trusted: boolean;

  nickname?: string | null;
};

/* =========================================================
   SECURITY EVENTS (future analytics + anomaly detection)
   ========================================================= */

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "new_device"
  | "device_revoked"
  | "password_changed"
  | "otp_requested"
  | "otp_verified"
  | "suspicious_login"
  | "session_terminated";

export type SecurityEvent = {
  id: string;
  user_id: string;

  type: SecurityEventType;

  metadata?: Record<string, unknown>;

  created_at: string;
};

/* =========================================================
   SECURITY FLOW CONTEXT (USED BY UI ENGINE)
   ========================================================= */

export type SecurityFlowState = {
  step: SecurityFlowStep;

  /**
   * OTP flow state (if active)
   */
  otp?: OtpState;

  /**
   * Loading states for async server actions
   */
  loading?: boolean;

  /**
   * Error handling for security operations
   */
  error?: string | null;
};

/* =========================================================
   SERVER ACTION CONTRACT TYPES
   (ensures frontend + backend consistency)
   ========================================================= */

export type RequestPasswordChangeInput = {
  userId: string;
};

export type VerifyOtpInput = {
  userId: string;
  code: string;
  type: OtpContextType;
};

export type UpdatePasswordInput = {
  userId: string;
  newPassword: string;
  revokeSessions?: boolean;
};

export type TrustDeviceInput = {
  userId: string;
  deviceId: string;
  nickname?: string;
};

/* =========================================================
   UI STATE TYPES (for settings system only)
   ========================================================= */

export type SettingsContentProps = {
  activeTab: Tab;
  userId: string;
  initialProfile: InitialProfile;
  initialSettings: InitialSettings;
};