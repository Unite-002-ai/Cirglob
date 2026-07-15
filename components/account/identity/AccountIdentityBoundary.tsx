"use client";

import type { ReactNode } from "react";

import {
  useAccountIdentity,
  type AccountIdentity,
} from "@/components/account/hooks/useAccountIdentity";
import { cn } from "@/lib/utils";

type AccountIdentityBoundaryRenderProps = {
  user: AccountIdentity | null;
  loading: boolean;
  refresh: () => Promise<AccountIdentity | null>;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  openDropdown: () => void;
  closeDropdown: () => void;
};

type AccountIdentityBoundaryProps = {
  initialUser?: AccountIdentity | null;
  fallback?: ReactNode;
  children: (props: AccountIdentityBoundaryRenderProps) => ReactNode;
  className?: string;
};

/**
 * =========================================================
 * CIRGLOB ACCOUNT IDENTITY BOUNDARY
 * =========================================================
 *
 * Purpose:
 * - Stabilize account rendering across hydration
 * - Provide a single identity-loading boundary
 * - Keep UI components free from direct Supabase reads
 * - Expose a safe render-prop API for identity UI
 *
 * This component is intentionally presentation-neutral.
 * It does not fetch directly.
 * It consumes the centralized account identity hook.
 */

function DefaultIdentityFallback() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex items-center gap-3 rounded-full px-2 py-1"
    >
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />

      <div className="hidden min-w-0 flex-col items-start gap-1 sm:flex">
        <div className="h-3.5 w-28 animate-pulse rounded bg-white/10" />
        <div className="h-2.5 w-36 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function AccountIdentityBoundary({
  initialUser = null,
  fallback,
  children,
  className,
}: AccountIdentityBoundaryProps) {
  const identity = useAccountIdentity(initialUser);

  const shouldShowFallback = identity.loading && !identity.user;

  return (
    <div className={cn("contents", className)}>
      {shouldShowFallback
        ? fallback ?? <DefaultIdentityFallback />
        : children({
            user: identity.user,
            loading: identity.loading,
            refresh: identity.refresh,
            dropdownOpen: identity.dropdownOpen,
            toggleDropdown: identity.toggleDropdown,
            openDropdown: identity.openDropdown,
            closeDropdown: identity.closeDropdown,
          })}
    </div>
  );
}