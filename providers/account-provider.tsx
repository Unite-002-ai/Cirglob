"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ACCOUNT_PROVIDER,
  APPLICATION_MEMBER_ROLES,
  PROFILE,
  type ApplicationMemberRole,
} from "@/lib/constants";
import {
  clearAccountState,
  clearStoredActiveApplicationId,
  getCachedProfile,
  getSnapshotIdentity,
  getStoredActiveApplicationId,
  hydrateAccountContext,
  onStoredActiveApplicationIdChange,
  setStoredActiveApplicationId,
  subscribeToAuthChanges,
  type AccountIdentity,
  type AccountProfile,
} from "@/lib/account-user";
import {
  parseApplicationStatus,
  type ApplicationStatusInput,
} from "@/lib/application-status";

export type AccountWorkspaceSnapshot = {
  activeApplicationId: string | null;
  activeApplicationStatus: ApplicationStatusInput;
  currentMemberRole: ApplicationMemberRole | null;
  hydrated: boolean;
  source: "secure" | "cache" | "unknown";
  isAuthenticated: boolean;
  hasWorkspaceAccess: boolean;
  ownsFounderProfile: boolean;
};

type AccountProviderState = {
  identity: AccountIdentity | null;
  profile: AccountProfile | null;
  loading: boolean;
};

type AccountProviderValue = AccountProviderState & {
  user: AccountIdentity | null;
  workspace: AccountWorkspaceSnapshot;
  refreshProfile: () => Promise<AccountIdentity | null>;
  refreshWorkspaceSeed: () => Promise<AccountWorkspaceSnapshot>;
  setActiveApplicationId: (applicationId: string | null) => void;
  clearWorkspace: () => void;
  clearAccount: () => void;
};

type AccountProviderProps = {
  children: ReactNode;
  initialUser?: AccountIdentity | null;
  initialProfile?: AccountProfile | null;
  initialSecureWorkspace?: AccountWorkspaceSnapshot | null;
  initialLoading?: boolean;
};

const AccountProviderContext = createContext<AccountProviderValue | null>(null);

export const DEFAULT_ACCOUNT_IDENTITY: AccountIdentity = {
  id: "",
  name: "",
  email: "",
  image: PROFILE.DEFAULT_AVATAR,
};

export const DEFAULT_ACCOUNT_WORKSPACE: AccountWorkspaceSnapshot = {
  activeApplicationId: null,
  activeApplicationStatus: null,
  currentMemberRole: null,
  hydrated: false,
  source: "unknown",
  isAuthenticated: false,
  hasWorkspaceAccess: false,
  ownsFounderProfile: false,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeWorkspaceStatus(value: unknown): ApplicationStatusInput {
  if (typeof value !== "string") return null;
  return parseApplicationStatus(value);
}

function normalizeWorkspaceRole(
  value: unknown,
): ApplicationMemberRole | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase();
  if (
    normalized === APPLICATION_MEMBER_ROLES.OWNER ||
    normalized === APPLICATION_MEMBER_ROLES.CO_FOUNDER
  ) {
    return normalized as ApplicationMemberRole;
  }

  return null;
}

function normalizeAccountWorkspaceSnapshot(
  input?: Partial<AccountWorkspaceSnapshot> | null,
): AccountWorkspaceSnapshot {
  const source =
    input?.source === "secure" || input?.source === "cache" || input?.source === "unknown"
      ? input.source
      : "unknown";

  return {
    activeApplicationId: safeString(input?.activeApplicationId) ?? null,
    activeApplicationStatus: normalizeWorkspaceStatus(
      input?.activeApplicationStatus,
    ),
    currentMemberRole: normalizeWorkspaceRole(input?.currentMemberRole),
    hydrated: typeof input?.hydrated === "boolean" ? input.hydrated : false,
    isAuthenticated:
      typeof input?.isAuthenticated === "boolean" ? input.isAuthenticated : false,
    hasWorkspaceAccess:
      typeof input?.hasWorkspaceAccess === "boolean"
        ? input.hasWorkspaceAccess
        : false,
    ownsFounderProfile:
      typeof input?.ownsFounderProfile === "boolean"
        ? input.ownsFounderProfile
        : false,
    source,
  };
}

function buildSeedWorkspace(): AccountWorkspaceSnapshot {
  const activeApplicationId = getStoredActiveApplicationId();

  return normalizeAccountWorkspaceSnapshot({
    activeApplicationId,
    activeApplicationStatus: null,
    currentMemberRole: null,
    hydrated: false,
    isAuthenticated: false,
    hasWorkspaceAccess: false,
    ownsFounderProfile: false,
    source: activeApplicationId ? "cache" : "unknown",
  });
}

export function AccountProvider({
  children,
  initialUser = null,
  initialProfile = null,
  initialSecureWorkspace = null,
  initialLoading,
}: AccountProviderProps) {
  const seededIdentity = initialUser ?? getSnapshotIdentity();
  const seededProfile = initialProfile ?? getCachedProfile();

  const initialWorkspace = normalizeAccountWorkspaceSnapshot(
    initialSecureWorkspace ?? buildSeedWorkspace(),
  );

  const initialState: AccountProviderState = {
    identity: seededIdentity,
    profile: seededProfile,
    loading:
      initialLoading ?? !(seededIdentity || seededProfile || initialSecureWorkspace),
  };

  const [state, setState] = useState<AccountProviderState>(() => initialState);
  const stateRef = useRef<AccountProviderState>(initialState);

  const [workspace, setWorkspaceState] = useState<AccountWorkspaceSnapshot>(
    () => initialWorkspace,
  );

  const mountedRef = useRef(true);
  const workspaceRef = useRef<AccountWorkspaceSnapshot>(initialWorkspace);
  const refreshInFlightRef = useRef<Promise<AccountIdentity | null> | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearWorkspace = useCallback(() => {
    clearStoredActiveApplicationId();

    const empty = DEFAULT_ACCOUNT_WORKSPACE;
    workspaceRef.current = empty;
    setWorkspaceState(empty);

    if (isBrowser()) {
      window.dispatchEvent(new Event(ACCOUNT_PROVIDER.EVENTS.APPLICATION_UPDATED));
    }
  }, []);

  const clearAccount = useCallback(() => {
    refreshInFlightRef.current = null;
    clearAccountState();
    clearWorkspace();

    setState({
      identity: null,
      profile: null,
      loading: false,
    });
  }, [clearWorkspace]);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

    /* removed: secure workspace is seeded once from the server-provided
     initialSecureWorkspace and is not re-applied by the client provider */

  const applyWorkspaceSeed = useCallback((): AccountWorkspaceSnapshot => {
    if (workspaceRef.current.source === "secure") {
      return workspaceRef.current;
    }

    const next = buildSeedWorkspace();
    workspaceRef.current = next;
    setWorkspaceState(next);
    return next;
  }, []);

  const syncWorkspaceFromStorage = useCallback((): AccountWorkspaceSnapshot => {
    if (!mountedRef.current) {
      return workspaceRef.current;
    }

    return applyWorkspaceSeed();
  }, [applyWorkspaceSeed]);

  const refreshProfile = useCallback(async (): Promise<AccountIdentity | null> => {
    if (!mountedRef.current) return null;

    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    refreshInFlightRef.current = (async () => {
      if (!stateRef.current.identity && !stateRef.current.profile) {
        setState((current) => ({
          ...current,
          loading: true,
        }));
      }

      try {
        const context = await hydrateAccountContext();

        if (!mountedRef.current) return null;

        if (!context.user) {
          clearAccount();
          return null;
        }

        setState({
          identity: context.identity,
          profile: context.profile,
          loading: false,
        });

        return context.identity;
      } catch (error) {
        console.error("[Cirglob] Account refresh failed:", error);

        if (mountedRef.current) {
          setState((current) => ({
            ...current,
            loading: false,
          }));
        }

        return null;
      }
    })();

    try {
      return await refreshInFlightRef.current;
    } finally {
      refreshInFlightRef.current = null;
    }
  }, [clearAccount]);

  /**
   * Seed-only workspace refresh.
   * Secure workspace truth is injected through initialSecureWorkspace.
   */
  const refreshWorkspaceSeed = useCallback(async (): Promise<AccountWorkspaceSnapshot> => {
    return syncWorkspaceFromStorage();
  }, [syncWorkspaceFromStorage]);

  const setActiveApplicationId = useCallback(
    (applicationId: string | null) => {
      const nextId = safeString(applicationId);
      setStoredActiveApplicationId(nextId);

      if (workspaceRef.current.source === "secure") {
        return;
      }

      const nextWorkspace = normalizeAccountWorkspaceSnapshot({
        activeApplicationId: nextId,
        activeApplicationStatus: null,
        currentMemberRole: null,
        hydrated: false,
        source: nextId ? "cache" : "unknown",
      });

      workspaceRef.current = nextWorkspace;
      setWorkspaceState(nextWorkspace);

      if (isBrowser()) {
        window.dispatchEvent(new Event(ACCOUNT_PROVIDER.EVENTS.APPLICATION_UPDATED));
      }
    },
    [],
  );

    useEffect(() => {
    mountedRef.current = true;

    const unsubscribeStored = onStoredActiveApplicationIdChange(() => {
      syncWorkspaceFromStorage();
    });

    const unsubscribeAuth = subscribeToAuthChanges((context) => {
      if (!mountedRef.current) return;

      if (!context.user) {
        clearAccount();
        return;
      }

      setState({
        identity: context.identity,
        profile: context.profile,
        loading: false,
      });
    });

    void refreshProfile();
    void refreshWorkspaceSeed();

    return () => {
      mountedRef.current = false;
      unsubscribeStored();
      unsubscribeAuth();
      refreshInFlightRef.current = null;
    };
  }, [clearAccount, refreshProfile, refreshWorkspaceSeed, syncWorkspaceFromStorage]);

  const value = useMemo<AccountProviderValue>(
    () => ({
      identity: state.identity,
      user: state.identity,
      profile: state.profile,
      loading: state.loading,
      workspace,
      refreshProfile,
      refreshWorkspaceSeed,
      setActiveApplicationId,
      clearWorkspace,
      clearAccount,
    }),
    [
      clearAccount,
      clearWorkspace,
      refreshProfile,
      refreshWorkspaceSeed,
      setActiveApplicationId,
      state.identity,
      state.loading,
      state.profile,
      workspace,
    ],
  );
  return (
    <AccountProviderContext.Provider value={value}>
      {children}
    </AccountProviderContext.Provider>
  );
}

export function useOptionalAccountProvider() {
  return useContext(AccountProviderContext);
}

export function useAccountProvider() {
  const context = useContext(AccountProviderContext);

  if (!context) {
    throw new Error("useAccountProvider must be used within an <AccountProvider>.");
  }

  return context;
}

export function useAccountProfile() {
  return useAccountProvider().profile;
}

export function useAccountIdentity() {
  return useAccountProvider().identity;
}

export function useAccountUser() {
  return useAccountIdentity();
}

export function useAccountLoading() {
  return useAccountProvider().loading;
}

export function useAccountWorkspace() {
  return useAccountProvider().workspace;
}

export function useRefreshAccountProfile() {
  return useAccountProvider().refreshProfile;
}

export type { AccountProviderValue }; 
