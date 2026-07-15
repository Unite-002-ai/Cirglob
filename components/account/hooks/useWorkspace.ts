"use client";

import { useCallback, useMemo } from "react";

import {
  type AccountProviderValue,
  useOptionalAccountProvider,
} from "@/providers/account-provider";
import { type ApplicationMemberRole } from "@/lib/constants";
import { type ApplicationStatusInput } from "@/lib/application-status";

type WorkspaceHydrationState = "loading" | "ready" | "anonymous";

export type WorkspaceStorageSnapshot = {
  activeApplicationId: string | null;
  activeApplicationStatus: ApplicationStatusInput;
  currentMemberRole: ApplicationMemberRole | null;
  hasWorkspaceAccess: boolean;
  ownsFounderProfile: boolean;
  isAuthenticated: boolean;
};

export type WorkspaceSnapshot = WorkspaceStorageSnapshot & {
  loading: boolean;
  hydrated: boolean;
  hydrationState: WorkspaceHydrationState;
  accountUserId: string | null;
  accountEmail: string | null;
  source: "secure" | "cache" | "unknown";
};

export type WorkspaceValue = WorkspaceSnapshot & {
  refreshWorkspaceSeed: () => Promise<WorkspaceSnapshot>;
  setActiveApplicationId: (applicationId: string | null) => void;
  clearWorkspace: () => void;
};

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildFallbackSnapshot(): WorkspaceSnapshot {
  return {
    activeApplicationId: null,
    activeApplicationStatus: null,
    currentMemberRole: null,
    hasWorkspaceAccess: false,
    ownsFounderProfile: false,
    isAuthenticated: false,
    loading: false,
    hydrated: false,
    hydrationState: "anonymous",
    accountUserId: null,
    accountEmail: null,
    source: "unknown",
  };
}

function buildSnapshot(account: AccountProviderValue | null): WorkspaceSnapshot {
  const workspace = account?.workspace ?? null;

  if (!account) return buildFallbackSnapshot();

  const hydrated = workspace?.hydrated === true;

  return {
    activeApplicationId: workspace?.activeApplicationId ?? null,
    activeApplicationStatus: workspace?.activeApplicationStatus ?? null,
    currentMemberRole: workspace?.currentMemberRole ?? null,
    hasWorkspaceAccess: workspace?.hasWorkspaceAccess === true,
    ownsFounderProfile: workspace?.ownsFounderProfile === true,
    isAuthenticated: workspace?.isAuthenticated === true,
    loading: account.loading,
    hydrated,
    hydrationState: account.loading ? "loading" : hydrated ? "ready" : "anonymous",
    accountUserId: account.identity?.id ?? null,
    accountEmail: account.identity?.email ?? null,
    source: workspace?.source ?? "unknown",
  };
}

export function useWorkspace(): WorkspaceValue {
  const account = useOptionalAccountProvider();
  const snapshot = useMemo <WorkspaceSnapshot>(
    () => buildSnapshot(account),
    [
      account?.loading,
      account?.identity?.email,
      account?.identity?.id,
      account?.workspace?.activeApplicationId,
      account?.workspace?.activeApplicationStatus,
      account?.workspace?.currentMemberRole,
      account?.workspace?.hasWorkspaceAccess,
      account?.workspace?.hydrated,
      account?.workspace?.isAuthenticated,
      account?.workspace?.ownsFounderProfile,
      account?.workspace?.source,
    ],
  );

  const refreshWorkspaceSeed = useCallback(async (): Promise<WorkspaceSnapshot> => {
    if (!account) {
      return buildFallbackSnapshot();
    }

    const nextWorkspace = await account.refreshWorkspaceSeed();
    const hydrated = nextWorkspace.source === "secure" && nextWorkspace.hydrated === true;

    return {
      activeApplicationId: nextWorkspace.activeApplicationId,
      activeApplicationStatus: nextWorkspace.activeApplicationStatus,
      currentMemberRole: nextWorkspace.currentMemberRole,
      hasWorkspaceAccess: nextWorkspace.hasWorkspaceAccess === true,
      ownsFounderProfile: nextWorkspace.ownsFounderProfile === true,
      isAuthenticated: nextWorkspace.isAuthenticated === true,
      loading: account.loading,
      hydrated,
      hydrationState: account.loading ? "loading" : hydrated ? "ready" : "anonymous",
      accountUserId: account.identity?.id ?? null,
      accountEmail: account.identity?.email ?? null,
      source: nextWorkspace.source,
    };
  }, [account]);

  const setActiveApplicationId = useCallback(
    (applicationId: string | null) => {
      account?.setActiveApplicationId(safeString(applicationId));
    },
    [account],
  );

  const clearWorkspace = useCallback(() => {
    account?.clearWorkspace();
  }, [account]);

  return useMemo<WorkspaceValue>(
    () => ({
      ...snapshot,
      refreshWorkspaceSeed,
      setActiveApplicationId,
      clearWorkspace,
    }),
    [clearWorkspace, refreshWorkspaceSeed, setActiveApplicationId, snapshot],
  );
}  