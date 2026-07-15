// components/account/hooks/useAccountIdentity.ts

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOptionalAccountProvider } from "@/providers/account-provider";
import {
  clearAccountState,
  hydrateAccountContext,
  type AccountIdentity as LibAccountIdentity,
} from "@/lib/account-user";
import type { AccountIdentity } from "@/components/account/identity/types";

type AccountIdentityState = {
  user: AccountIdentity | null;
  loading: boolean;
}; 

type RawIdentityLike = {
  id?: unknown;
  name?: unknown;
  displayName?: unknown;
  email?: unknown;
  image?: unknown;
  avatar?: unknown;
  avatarUrl?: unknown;
  avatar_url?: unknown;
  full_name?: unknown;
  fullName?: unknown;
  first_name?: unknown;
  last_name?: unknown;
};

function nonEmptyString(value: unknown): string | null {

  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;

}

function normalizeName(value: unknown): string {
  const candidate = nonEmptyString(value);
  if (!candidate) return "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) return "";
  return candidate;
}

function buildDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null,
): string {
  const fromParts = [firstName, lastName]
    .filter((part) => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();

  const fromFullName =
    typeof fullName === "string" && fullName.trim().length > 0
      ? fullName.trim()
      : "";

  const candidate = fromParts || fromFullName;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? "" : candidate;
}

function fromLibIdentity(
  value: LibAccountIdentity | null | undefined,
): AccountIdentity | null {
  if (!value) return null;

  const name = normalizeName(value.name);
  if (!name) return null;

  return {
    id: value.id,
    name,
    email: value.email || "",
    image: value.image ?? null,
  };
}

export function useAccountIdentity(initialUser: AccountIdentity | null = null) {
  const provider = useOptionalAccountProvider();
  const [localState, setLocalState] = useState<AccountIdentityState>(() => ({
  user: initialUser,
  loading: !initialUser,
}));

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const openDropdown = useCallback(() => {
    setDropdownOpen(true);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((current) => !current);
  }, []);

  const fallbackRefresh = useCallback(async (): Promise<AccountIdentity | null> => {
    const requestId = ++requestIdRef.current;
    if (!mountedRef.current) return null;
    setLocalState((current) => ({
      ...current,
      loading: true,
    }));

    try {
      const context = await hydrateAccountContext();
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return null;
      }

      const identity = fromLibIdentity(context.identity);
      if (!identity) {
        clearAccountState();
        closeDropdown();
        setLocalState({ user: null, loading: false });
        return null;
      }

      setLocalState({ user: identity, loading: false });
      return identity;
    } catch (error) {
      console.error("[Cirglob] Account identity refresh failed:", error);

      if (mountedRef.current && requestId === requestIdRef.current) {
        setLocalState((current) => ({
          ...current,
          loading: false,
        }));
      }
      return null;
    }

  }, [closeDropdown]);

  useEffect(() => {
  mountedRef.current = true;

  if (provider) {
    return () => {
      mountedRef.current = false;
    };
  }

  void fallbackRefresh();

  return () => {
    mountedRef.current = false;
  };
}, [fallbackRefresh, provider]);

  const user = useMemo<AccountIdentity | null>(() => {
    return provider ? fromLibIdentity(provider.user) : localState.user;
  }, [localState.user, provider]);

  const loading = provider ? provider.loading && !user : localState.loading && !user;

  const refresh = useCallback(async (): Promise<AccountIdentity | null> => {

    if (provider) {
      const refreshed = await provider.refreshProfile();
      return fromLibIdentity(refreshed);
    }
    return fallbackRefresh();
  }, [fallbackRefresh, provider]);

  return {
    user,
    loading,
    refresh,
    dropdownOpen,
    toggleDropdown,
    openDropdown,
    closeDropdown,
  };
}

export type { AccountIdentity };   
