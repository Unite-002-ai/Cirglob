// components/account/identity/types.ts

import type { ReactNode, RefObject } from "react";

/**
 * =========================================================
 * CIRGLOB ACCOUNT IDENTITY TYPES
 * =========================================================
 *
 * Keep this file dependency-free.
 * It should contain only shared type definitions for the
 * account identity subsystem.
 */

export type AccountIdentity = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type AccountIdentityState = {
  user: AccountIdentity | null;
  loading: boolean;
};

export type AccountIdentityRefreshResult = AccountIdentity | null;

export type AccountIdentityListener = () => void;

export type AccountIdentityBoundaryRenderProps = {
  user: AccountIdentity | null;
  loading: boolean;
  refresh: () => Promise<AccountIdentityRefreshResult>;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  openDropdown: () => void;
  closeDropdown: () => void;
};

export type AccountIdentityBoundaryProps = {
  initialUser?: AccountIdentity | null;
  fallback?: ReactNode;
  children: (props: AccountIdentityBoundaryRenderProps) => ReactNode;
  className?: string;
};

export type AccountIdentityDropdownProps = {
  open: boolean;
  onClose: () => void;
  onSignOut?: () => void;
  anchorRef?: RefObject<HTMLDivElement | null>;
};

export type AccountIdentityClusterProps = {
  name?: string;
  email?: string | null;
  image?: string | null;
  loading?: boolean;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  showEmail?: boolean;
};