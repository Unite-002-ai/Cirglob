"use client";

import { useMemo } from "react";

import { getApplicationPermissions } from "@/lib/application-permissions";
import { useWorkspace, type WorkspaceSnapshot } from "./useWorkspace";

type PermissionSnapshot = WorkspaceSnapshot & {
  authenticated: boolean;
  isOwner: boolean;
  canEditApplication: boolean;
  canInviteMember: boolean;
  canSubmitApplication: boolean;
  canEditFounderProfile: boolean;
};

export function buildPermissionSnapshot(
  workspace: WorkspaceSnapshot,
): PermissionSnapshot {
  const authenticated = workspace.isAuthenticated === true;

  const permissions = getApplicationPermissions({
    status: workspace.activeApplicationStatus,
    memberRole: workspace.currentMemberRole,
    ownsFounderProfile: workspace.ownsFounderProfile,
  });

  return {
    ...workspace,
    authenticated,
    isOwner: workspace.hasWorkspaceAccess === true && permissions.isOwner,
    canEditApplication:
      workspace.hasWorkspaceAccess === true && permissions.canEditApplication,
    canInviteMember:
      workspace.hasWorkspaceAccess === true && permissions.canInviteMember,
    canSubmitApplication:
      workspace.hasWorkspaceAccess === true && permissions.canSubmitApplication,
    canEditFounderProfile:
      workspace.ownsFounderProfile === true && permissions.canEditFounderProfile,
  };
}

export type UsePermissionsValue = PermissionSnapshot;

export function usePermissions(): UsePermissionsValue {
  const workspace = useWorkspace();

  return useMemo(() => buildPermissionSnapshot(workspace), [workspace]);
} 