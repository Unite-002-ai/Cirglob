import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn()
 * ---------------------------------------
 * Core className utility for the entire system.
 *
 * WHY THIS EXISTS:
 * - prevents Tailwind class conflicts
 * - enforces deterministic styling
 * - ensures consistent UI behavior across components
 *
 * USED BY:
 * - TopBar
 * - IdentityCluster
 * - Dropdown system
 * - Account layout system
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * sleep()
 * ---------------------------------------
 * Controlled async delay utility
 * (useful for UI transitions, micro-interactions, and testing flows)
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * formatEmail()
 * ---------------------------------------
 * Lightweight normalization helper for identity display consistency
 */
export function formatEmail(email?: string | null) {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * truncate()
 * ---------------------------------------
 * Ensures UI stability in constrained layouts (TopBar, dropdowns)
 */
export function truncate(str: string, length = 24) {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "…" : str;
}