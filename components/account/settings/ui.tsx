"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* =========================================================
   BASE UI TYPES
========================================================= */

type BaseProps = {
  className?: string;
  children?: ReactNode;
};

/* =========================================================
   SECTION COMPONENTS
========================================================= */

type SectionCardProps = BaseProps;

export function SectionCard({ className, children }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0A0C12]/90 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionTitle({ children, className }: BaseProps) {
  return (
    <div
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.24em] text-white/45",
        className
      )}
    >
      {children}
    </div>
  );
}

/* =========================================================
   GRID SYSTEM
========================================================= */

type GridProps = BaseProps & {
  cols?: string;
};

export function Grid({ children, className, cols }: GridProps) {
  return (
    <div className={cn("grid gap-3", cols ?? "md:grid-cols-2", className)}>
      {children}
    </div>
  );
}

/* =========================================================
   ACTION BUTTONS
========================================================= */

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "danger";
};

export function ActionButton({
  children,
  className,
  tone = "primary",
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium tracking-tight transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" &&
          "border-white/10 bg-white/10 text-white hover:bg-white/15",
        tone === "secondary" &&
          "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/10 hover:text-white",
        tone === "danger" &&
          "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15",
        className
      )}
    >
      {children}
    </button>
  );
}

/* =========================================================
   INPUT
========================================================= */

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none",
        "placeholder:text-white/25 focus:border-white/15 focus:bg-white/[0.05]",
        "transition-all duration-150",
        className
      )}
    />
  );
}

/* =========================================================
   INFO ROW
========================================================= */

type InfoRowProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0",
        className
      )}
    >
      <div className="text-sm text-white/45">{label}</div>
      <div className="text-sm text-white/85">{value}</div>
    </div>
  );
}

/* =========================================================
   TOGGLE LINE (SECURITY SETTINGS)
========================================================= */

type ToggleLineProps = {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

export function ToggleLine({
  label,
  description,
  enabled,
  onToggle,
}: ToggleLineProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 border-b border-white/10 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.02]"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-white/85">{label}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-white/40">
          {description}
        </div>
      </div>

      <div
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-all",
          enabled
            ? "border-blue-400/40 bg-blue-400/20"
            : "border-white/10 bg-white/5"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
            enabled ? "left-5" : "left-0.5"
          )}
        />
      </div>
    </button>
  );
}

/* =========================================================
   SECURITY FLOW TYPES (NEW - BACKEND COMPATIBLE)
========================================================= */

/**
 * Matches SecurityTab → SecurityFlow state machine
 * (password change + OTP + success flow)
 */
export type SecurityFlowState =
  | "overview"
  | "otp_verification"
  | "change_password"
  | "success";

/**
 * OTP lifecycle state (backend: security_verifications table)
 */
export type OtpStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "expired"
  | "failed";

/**
 * Device model (trusted_devices table compatible)
 */
export type DeviceInfo = {
  id: string;
  device_id: string;
  browser: string;
  os: string;
  user_agent?: string;
  last_ip_hash?: string;
  last_seen_at?: string;
  trusted: boolean;
  nickname?: string | null;
};

/**
 * Session model (sessions_log table compatible)
 */
export type SessionInfo = {
  session_id: string;
  device_id?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  ip_hash?: string;
  login_success: boolean;
  trusted: boolean;
  created_at?: string;
};

/**
 * Security event tracking (security_events table compatible)
 */
export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "password_changed"
  | "device_added"
  | "device_revoked"
  | "suspicious_login"
  | "otp_requested"
  | "otp_verified";

/**
 * UI-safe security event
 */
export type SecurityEvent = {
  id: string;
  type: SecurityEventType;
  created_at: string;
  metadata?: Record<string, any>;
};

/* =========================================================
   SAFE FORMATTERS (UI LAYER ONLY)
========================================================= */

/**
 * Mask email for security UI
 * example: t***@gmail.com
 */
export function maskEmail(email?: string | null): string {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name[0]}***@${domain}`;
}

/**
 * Format timestamp safely for session logs
 */
export function formatDate(date?: string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString();
}

/**
 * Device label generator
 */
export function formatDeviceLabel(device: DeviceInfo): string {
  return `${device.browser || "Unknown"} • ${device.os || "Unknown OS"}`;
}

/* =========================================================
   SECURITY UI STATUS HELPERS
========================================================= */

export type SecurityStatus =
  | "safe"
  | "warning"
  | "critical"
  | "unknown";

/**
 * Lightweight status mapper for UI badges
 */
export function getSecurityStatusColor(status: SecurityStatus): string {
  switch (status) {
    case "safe":
      return "text-green-300";
    case "warning":
      return "text-yellow-300";
    case "critical":
      return "text-red-300";
    default:
      return "text-white/40";
  }
}
