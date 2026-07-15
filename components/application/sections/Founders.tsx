"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import Radio from "../ui/Radio";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Question from "../ui/Question";
import InviteFounderDialog from "../ui/InviteFounderDialog";
import RemoveMemberConfirm from "../ui/RemoveMemberConfirm";
import MemberActionsDropdown from "../ui/MemberActionsDropdown";

import type { ApplicationAlert } from "../ApplicationAlerts";
import type { WorkspaceRuntimeSnapshot } from "@/lib/workspace-runtime.shared";

type YesNo = "" | "Yes" | "No";

type FounderRosterMember = {
  id: string;
  profileId: string | null;
  email: string;
  fullName: string;
  role: "OWNER" | "CO_FOUNDER" | null;
  isOwner: boolean;
  createdAt: string | null;
};

type FounderRosterInvite = {
  id: string;
  email: string;
  role: string | null;
  expiresAt: string | null;
  acceptedAt: string | null;
  createdAt: string | null;
  acceptUrl: string | null;
};

type FoundersSectionValue = Record<string, unknown> & {
  whoBuildsToday?: string;
  criticalWorkByNonFounders?: YesNo;
  criticalWorkExplain?: string;
  howFoundersMet?: string;
  metInPerson?: YesNo;
  metInPersonExplain?: string;
  allFullTime?: YesNo;
  fullTimeExplain?: string;
  whyTeam?: string;
  lookingForCoFounder?: YesNo;
  coFounderNeedExplain?: string;
};

type WorkspacePermissionSnapshot = Pick<
  WorkspaceRuntimeSnapshot,
  | "activeApplicationId"
  | "activeApplicationStatus"
  | "canInviteMember"
  | "canRemoveMember"
  | "currentMemberRole"
  | "email"
  | "hasWorkspaceAccess"
  | "hydrated"
  | "isOwner"
>;

type FoundersProps = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  errors?: string[];
  locked?: boolean;
  disabled?: boolean;
  dirty?: boolean;
  readonlyReason?: string | null;
  applicationId?: string | null;
  status?: string | null;
  section?: string | null;
  workspaceSnapshot?: WorkspacePermissionSnapshot | null;
  canInviteMember?: boolean;
  canRemoveMember?: boolean;
  currentMemberRole?: string | null;
  isOwner?: boolean;
  onAlert?: (alert: ApplicationAlert) => void;
};

type RawInvitationRow = {
  id?: string;
  invitationId?: string;
  email?: string;
  role?: string | null;
  expires_at?: string | null;
  expiresAt?: string | null;
  accepted_at?: string | null;
  acceptedAt?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  acceptUrl?: string | null;
  accept_url?: string | null;
};

type RawMemberProfile =
  | {
      id?: string;
      email?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
    }
  | {
      id?: string;
      email?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      full_name?: string | null;
      avatar_url?: string | null;
    }[]
  | null;

type RawMemberRow = {
  id?: string;
  memberId?: string;
  profile_id?: string | null;
  profileId?: string | null;
  role?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  email?: string | null;
  full_name?: string | null;
  fullName?: string | null;
  first_name?: string | null;
  firstName?: string | null;
  last_name?: string | null;
  lastName?: string | null;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  profiles?: RawMemberProfile;
};

type MemberListResponse = {
  members?: unknown;
  data?: unknown;
};

type InvitationListResponse = {
  invitations?: unknown;
  data?: unknown;
};

type InviteFounderResponse = {
  invitationId: string;
  email: string;
  expiresAt: string;
  isNew: boolean;
  applicationPublicId: string;
  emailDelivery: "sent" | "degraded";
  acceptUrl: string;
};

type FoundersDisplayInviteRow = {
  id: string;
  label: string;
  kind: "invite";
  acceptUrl: string | null;
};

type FoundersDisplayMemberRow = {
  id: string;
  label: string;
  kind: "member";
  isOwner: boolean;
};

type FoundersDisplayRow = FoundersDisplayInviteRow | FoundersDisplayMemberRow;

type PendingRemovalTarget =
  | {
      kind: "invite";
      id: string;
      label: string;
    }
  | {
      kind: "member";
      id: string;
      label: string;
    }
  | null;

const ROSTER_CACHE_PREFIX = "cirglob:founders-roster:";

type CachedRosterPayload = {
  members: FounderRosterMember[];
  invitations: FounderRosterInvite[];
  savedAt: number;
};

function buildRosterCacheKey(applicationId: string | null): string {
  return `${ROSTER_CACHE_PREFIX}${applicationId ?? "global"}`;
}

function readRosterCache(applicationId: string | null): CachedRosterPayload | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(buildRosterCacheKey(applicationId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedRosterPayload>;
    if (
      !Array.isArray(parsed.members) ||
      !Array.isArray(parsed.invitations) ||
      typeof parsed.savedAt !== "number"
    ) {
      return null;
    }

    return {
      members: normalizeMemberRows(parsed.members),
      invitations: normalizeInvitationRows(parsed.invitations),
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

function writeRosterCache(
  applicationId: string | null,
  members: FounderRosterMember[],
  invitations: FounderRosterInvite[],
): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      buildRosterCacheKey(applicationId),
      JSON.stringify({
        members,
        invitations,
        savedAt: Date.now(),
      } satisfies CachedRosterPayload),
    );
  } catch {
    // Non-fatal.
  }
}

const MEMBERS_ENDPOINT = "/api/application/application-members";
const INVITATIONS_ENDPOINT = "/api/application/application-invitations";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readYesNo(value: unknown): YesNo {
  return value === "Yes" || value === "No" ? value : "";
}

function normalizeFoundersSectionValue(value: unknown): FoundersSectionValue {
  if (!isPlainObject(value)) return {};
  return { ...value } as FoundersSectionValue;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

async function requestJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers ?? undefined);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    cache: init.cache ?? "no-store",
    credentials: init.credentials ?? "include",
    headers,
  });

  const rawText = await response.text().catch(() => "");
  let payload: unknown = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const message =
      isPlainObject(payload) && typeof payload.error === "string"
        ? payload.error
        : `REQUEST_FAILED_${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function resolveMemberDisplayName(row: RawMemberRow): string {
  const profileSource = Array.isArray(row.profiles)
    ? row.profiles[0] ?? null
    : row.profiles ?? null;

  const profile = isPlainObject(profileSource) ? profileSource : null;

  const firstName = readTrimmedString(
    row.first_name ?? row.firstName ?? profile?.first_name ?? null,
  );
  const lastName = readTrimmedString(
    row.last_name ?? row.lastName ?? profile?.last_name ?? null,
  );
  const fullName = readTrimmedString(
    row.full_name ?? row.fullName ?? profile?.full_name ?? null,
  );

  return fullName || [firstName, lastName].filter(Boolean).join(" ").trim() || "Founder";
}

function normalizeInvitationRows(rows: unknown): FounderRosterInvite[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      if (!isPlainObject(row)) return null;

      const id = readTrimmedString(row.id ?? row.invitationId);
      if (!id) return null;

      return {
        id,
        email: readTrimmedString(row.email ?? null),
        role: typeof row.role === "string" ? row.role : null,
        expiresAt:
          readTrimmedString(row.expiresAt ?? row.expires_at ?? null) || null,
        acceptedAt:
          readTrimmedString(row.acceptedAt ?? row.accepted_at ?? null) || null,
        createdAt:
          readTrimmedString(row.createdAt ?? row.created_at ?? null) || null,
        acceptUrl:
          readTrimmedString(row.acceptUrl ?? row.accept_url ?? null) || null,
      };
    })
    .filter(Boolean) as FounderRosterInvite[];
}

function mergeInvitationRows(
  previous: FounderRosterInvite[],
  next: FounderRosterInvite[],
): FounderRosterInvite[] {
  if (previous.length === 0) return next;

  const previousById = new Map(previous.map((invite) => [invite.id, invite]));
  const previousByEmail = new Map(
    previous
      .filter((invite) => Boolean(invite.email))
      .map((invite) => [invite.email.trim().toLowerCase(), invite]),
  );

  return next.map((invite) => {
    const previousInvite =
      previousById.get(invite.id) ??
      previousByEmail.get(invite.email.trim().toLowerCase()) ??
      null;

    return {
      ...invite,
      acceptUrl: invite.acceptUrl ?? previousInvite?.acceptUrl ?? null,
    };
  });
}

function normalizeMemberRows(rows: unknown): FounderRosterMember[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row, index) => {
      if (!isPlainObject(row)) return null;

      const rawId = readTrimmedString(row.id ?? row.memberId);
      const profileId = readTrimmedString(
        row.profile_id ?? row.profileId ?? null,
      );
      const displayName = resolveMemberDisplayName(row as RawMemberRow);
      const profileSource = Array.isArray(row.profiles)
        ? row.profiles[0] ?? null
        : row.profiles ?? null;
      const profile = isPlainObject(profileSource) ? profileSource : null;

      const email = readTrimmedString(
        row.email ?? profile?.email ?? null,
      );
      const createdAt = readTrimmedString(
        row.createdAt ?? row.created_at ?? null,
      );
      const roleValue =
        typeof row.role === "string" ? row.role.trim().toUpperCase() : "";
      const role =
        roleValue === "OWNER" || roleValue === "CO_FOUNDER"
          ? (roleValue as "OWNER" | "CO_FOUNDER")
          : null;

      const memberId = rawId || profileId || `member-${index}`;

      return {
        id: memberId,
        profileId: profileId || null,
        email,
        fullName: displayName,
        role,
        isOwner: role === "OWNER",
        createdAt: createdAt || null,
      };
    })
    .filter(Boolean) as FounderRosterMember[];
}

function normalizeMembersResponse(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload;

  if (isPlainObject(payload)) {
    if (Array.isArray((payload as MemberListResponse).members)) {
      return (payload as MemberListResponse).members;
    }

    if (Array.isArray((payload as MemberListResponse).data)) {
      return (payload as MemberListResponse).data;
    }
  }

  return [];
}

function normalizeInvitationsResponse(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload;

  if (isPlainObject(payload)) {
    if (Array.isArray((payload as InvitationListResponse).invitations)) {
      return (payload as InvitationListResponse).invitations;
    }

    if (Array.isArray((payload as InvitationListResponse).data)) {
      return (payload as InvitationListResponse).data;
    }
  }

  return [];
}

export default function Founders(props: FoundersProps = {}) {
  const {
    value,
    onChange,
    errors = [],
    locked = false,
    disabled = false,
    dirty = false,
    readonlyReason = null,
    applicationId = null,
    section = null,
    workspaceSnapshot = null,
    canInviteMember,
    canRemoveMember,
    currentMemberRole,
    isOwner,
    onAlert,
  } = props;

  void errors;
  void dirty;
  void props.status;
  // Per-section alert banners (roster load/invite/remove/copy failures)
  // have been intentionally removed below — a dedicated notification
  // system is planned to replace them. `onAlert` and `section` stay on
  // the prop surface for that future system; failures are still logged
  // to the console for debugging in the meantime.
  void onAlert;
  void section;

  const activeValue = useMemo(
    () => normalizeFoundersSectionValue(value),
    [value],
  );

  const effectiveHasWorkspaceAccess =
    workspaceSnapshot?.hasWorkspaceAccess ?? false;

  const effectiveIsOwner = workspaceSnapshot?.isOwner ?? isOwner ?? false;

  const effectiveCurrentMemberRole = (
    workspaceSnapshot?.currentMemberRole ?? currentMemberRole ?? ""
  )
    .trim()
    .toLowerCase();

  const isOwnerMember =
    effectiveIsOwner || effectiveCurrentMemberRole === "owner";

  const rosterApplicationId =
    applicationId ?? workspaceSnapshot?.activeApplicationId ?? null;

  const canViewRoster =
    Boolean(rosterApplicationId) && effectiveHasWorkspaceAccess;

  const canManageRoster = canViewRoster && isOwnerMember;

  const canInviteRoster = canManageRoster;

  const canRemoveRoster = canManageRoster;

  const [serverMembers, setServerMembers] = useState<FounderRosterMember[]>([]);
  const [serverInvitations, setServerInvitations] = useState<
    FounderRosterInvite[]
  >([]);
  const [isInviteComposerOpen, setIsInviteComposerOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteSubmissionPending, setIsInviteSubmissionPending] =
    useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [isRemovalSubmissionPending, setIsRemovalSubmissionPending] =
    useState(false);
  const [removingMemberIds, setRemovingMemberIds] = useState<
    Record<string, boolean>
  >({});
  const [pendingRemoval, setPendingRemoval] =
    useState<PendingRemovalTarget>(null);

  const rosterAbortRef = useRef<AbortController | null>(null);
  const refreshRosterRef = useRef<(() => Promise<void>) | null>(null);
  
  const acceptedMembers = useMemo(
    () =>
      normalizeMemberRows(serverMembers).sort((left, right) => {
        if (left.isOwner !== right.isOwner) {
          return left.isOwner ? -1 : 1;
        }

        const nameCompare = left.fullName.localeCompare(right.fullName);
        if (nameCompare !== 0) return nameCompare;

        return (left.createdAt ?? "").localeCompare(right.createdAt ?? "");
      }),
    [serverMembers],
  );

  const pendingInvites = useMemo(
    () => normalizeInvitationRows(serverInvitations),
    [serverInvitations],
  );

  const hasMultipleFounders = acceptedMembers.length > 1;

  const writeValue = useCallback(
    (updater: (current: FoundersSectionValue) => FoundersSectionValue) => {
      if (!onChange || locked || disabled || Boolean(readonlyReason)) return;

      const next = updater(activeValue);
      onChange(next);
    },
    [activeValue, disabled, locked, onChange, readonlyReason],
  );

  const setDraftField = useCallback(
    (key: keyof FoundersSectionValue, nextValue: string | YesNo) => {
      writeValue((current) => ({
        ...current,
        [key]: nextValue,
      }));
    },
    [writeValue],
  );

  const refreshRoster = useCallback(async () => {
    rosterAbortRef.current?.abort();

    if (!canViewRoster || !rosterApplicationId) {
      return;
    }

    const controller = new AbortController();
    rosterAbortRef.current = controller;

    try {
      const membersResponse = await requestJson<MemberListResponse>(
        MEMBERS_ENDPOINT,
        {
          method: "GET",
          signal: controller.signal,
        },
      );

      if (controller.signal.aborted) return;

      const nextMembers = normalizeMemberRows(
        normalizeMembersResponse(membersResponse),
      );

      let nextInvitations: FounderRosterInvite[] = [];

      if (canManageRoster) {
        const invitationsResponse = await requestJson<InvitationListResponse>(
          INVITATIONS_ENDPOINT,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        nextInvitations = normalizeInvitationRows(
          normalizeInvitationsResponse(invitationsResponse),
        );
      }

      setServerMembers(nextMembers);
      setServerInvitations((current) =>
        canManageRoster ? mergeInvitationRows(current, nextInvitations) : [],
      );

      if (canManageRoster) {
        writeRosterCache(rosterApplicationId, nextMembers, nextInvitations);
      }
    } catch (error) {
      if (controller.signal.aborted) return;

      console.error(
        "[Founders] roster refresh failed:",
        getErrorMessage(error),
      );
    }
  }, [canManageRoster, canViewRoster, rosterApplicationId]);

  const removeInvitation = useCallback(
    async (invitationId: string | null) => {
      if (!invitationId || !canRemoveRoster) return;

      setServerInvitations((current) =>
        current.filter((invite) => invite.id !== invitationId),
      );

      try {
        await requestJson("/api/application/application-invitations", {
          method: "DELETE",
          body: JSON.stringify({ invitationId }),
        });

        void refreshRoster();
      } catch (error) {
        console.error(
          "[Founders] invitation removal failed:",
          getErrorMessage(error),
        );

        void refreshRoster();
      }
    },
    [canRemoveRoster, refreshRoster],
  );

  const ownerMemberIds = useMemo(
    () =>
      new Set(
        acceptedMembers
          .filter((member) => member.isOwner)
          .map((member) => member.id),
      ),
    [acceptedMembers],
  );

  const removeFounder = useCallback(
    async (memberId: string | null) => {
      if (!memberId || !canRemoveRoster || ownerMemberIds.has(memberId)) {
        return;
      }

      setRemovingMemberIds((prev) => ({
        ...prev,
        [memberId]: true,
      }));

      setServerMembers((current) =>
        current.filter((member) => member.id !== memberId),
      );

      try {
        await requestJson(
          `/api/application/application-members/${encodeURIComponent(memberId)}`,
          {
            method: "DELETE",
          },
        );

        void refreshRoster();
      } catch (error) {
        const message = getErrorMessage(error);

        if (message === "CANNOT_REMOVE_OWNER") {
          console.warn(
            "[Founders] attempted to remove the primary founder; blocked.",
          );
          void refreshRoster();
          return;
        }

        console.error("[Founders] member removal failed:", message);

        void refreshRoster();
      } finally {
        setRemovingMemberIds((prev) => {
          const next = { ...prev };
          delete next[memberId];
          return next;
        });
      }
    },
    [canRemoveRoster, ownerMemberIds, refreshRoster],
  );

    const confirmPendingRemoval = useCallback(async () => {
    if (!pendingRemoval || !canRemoveRoster || isRemovalSubmissionPending) return;

    const target = pendingRemoval;
    setIsRemovalSubmissionPending(true);
    setPendingRemoval(null);

    try {
      if (target.kind === "member") {
        await removeFounder(target.id);
        return;
      }

      await removeInvitation(target.id);
    } finally {
      setIsRemovalSubmissionPending(false);
    }
  }, [
    canRemoveRoster,
    isRemovalSubmissionPending,
    pendingRemoval,
    removeFounder,
    removeInvitation,
  ]);

  useEffect(() => {
    if (!copiedInviteId) return;

    const timeout = window.setTimeout(() => {
      setCopiedInviteId(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [copiedInviteId]);

  useEffect(() => {
    refreshRosterRef.current = refreshRoster;
  }, [refreshRoster]);

  useEffect(() => {
    void refreshRoster();

    return () => {
      rosterAbortRef.current?.abort();
    };
  }, [refreshRoster]);

  useEffect(() => {
    if (!canViewRoster || !rosterApplicationId) return;

    const interval = window.setInterval(() => {
      void refreshRosterRef.current?.();
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [canViewRoster, rosterApplicationId]);

  useLayoutEffect(() => {
    const cached = readRosterCache(rosterApplicationId);
    if (!cached) return;

    setServerMembers(cached.members);
    setServerInvitations(cached.invitations);
  }, [rosterApplicationId]);

  useEffect(() => {
    if (!canManageRoster) {
      setIsInviteComposerOpen(false);
      setInviteEmail("");
    }
  }, [canManageRoster]);

  const openInviteComposer = useCallback(() => {
    if (!canInviteRoster) return;
    setIsInviteComposerOpen(true);
  }, [canInviteRoster]);

  const copyInvitationLink = useCallback(
    async (inviteId: string, acceptUrl: string | null) => {
      const resolvedUrl = acceptUrl?.trim();

      if (!resolvedUrl) {
        console.warn(
          "[Founders] copy link requested but no accept URL is available for this invite in the current session.",
        );
        return;
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(resolvedUrl);
        } else {
          const fallback = document.createElement("textarea");
          fallback.value = resolvedUrl;
          fallback.setAttribute("readonly", "true");
          fallback.style.position = "absolute";
          fallback.style.left = "-9999px";
          document.body.appendChild(fallback);
          fallback.select();
          document.execCommand("copy");
          document.body.removeChild(fallback);
        }

        setCopiedInviteId(inviteId);
      } catch (error) {
        console.error(
          "[Founders] copy invitation link failed:",
          getErrorMessage(error),
        );
      }
    },
    [],
  );

  const requestRemoval = useCallback(
    (kind: "invite" | "member", id: string, label: string) => {
      if (!canRemoveRoster) return;
      setPendingRemoval({ kind, id, label });
    },
    [canRemoveRoster],
  );

  const closeRemovalConfirm = useCallback(() => {
    setPendingRemoval(null);
  }, []);

  const closeInviteComposer = useCallback(() => {
    setIsInviteComposerOpen(false);
    setInviteEmail("");
  }, []);

  const sendCoFounderInvite = useCallback(async () => {
    const trimmedEmail = inviteEmail.trim().toLowerCase();
    const ownerEmail = workspaceSnapshot?.email?.trim().toLowerCase() ?? "";

    if (!trimmedEmail || !canInviteRoster) return;

    if (ownerEmail && trimmedEmail === ownerEmail) {
      console.warn("[Founders] blocked an attempt to invite the owner's own email.");
      return;
    }

    setIsInviteSubmissionPending(true);

    try {
      const response = await requestJson<InviteFounderResponse>(
        INVITATIONS_ENDPOINT,
        {
          method: "POST",
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        },
      );

      setInviteEmail("");
      setIsInviteComposerOpen(false);

      setServerInvitations((current) => [
        {
          id: response.invitationId,
          email: response.email,
          role: "CO_FOUNDER",
          expiresAt: response.expiresAt,
          acceptedAt: null,
          createdAt: new Date().toISOString(),
          acceptUrl: response.acceptUrl,
        },
        ...current.filter((invite) => invite.id !== response.invitationId),
      ]);

      if (response.emailDelivery === "degraded") {
        console.warn(
          "[Founders] invitation created but email delivery is degraded (production mail settings not configured).",
        );
      }

      await refreshRoster();
    } catch (error) {
      const message = getErrorMessage(error);

      if (message === "CANNOT_INVITE_SELF") {
        console.warn("[Founders] server rejected invite: cannot invite self.");
        return;
      }

      if (message === "INVITATION_ALREADY_SENT") {
        console.warn(
          "[Founders] server rejected invite: an active invitation already exists for that email.",
        );
        return;
      }

      console.error("[Founders] invite send failed:", message);
    } finally {
      setIsInviteSubmissionPending(false);
    }
  }, [canInviteRoster, inviteEmail, refreshRoster, workspaceSnapshot?.email]);

  const inviteRows = useMemo<FoundersDisplayInviteRow[]>(
    () =>
      pendingInvites.map((invite) => ({
        id: invite.id,
        label: invite.email || "Invited founder",
        kind: "invite" as const,
        acceptUrl: invite.acceptUrl,
      })),
    [pendingInvites],
  );

  const memberRows = useMemo<FoundersDisplayMemberRow[]>(
    () =>
      acceptedMembers.map((member) => ({
        id: member.id,
        label: member.fullName || "Founder",
        kind: "member" as const,
        isOwner: member.isOwner,
      })),
    [acceptedMembers],
  );

  const displayRows = useMemo<FoundersDisplayRow[]>(
    () => [...memberRows, ...inviteRows],
    [inviteRows, memberRows],
  );

  const whoBuildsToday = readString(activeValue.whoBuildsToday);
  const criticalWorkByNonFounders = readYesNo(
    activeValue.criticalWorkByNonFounders,
  );
  const criticalWorkExplain = readString(activeValue.criticalWorkExplain);
  const howFoundersMet = readString(activeValue.howFoundersMet);
  const metInPerson = readYesNo(activeValue.metInPerson);
  const metInPersonExplain = readString(activeValue.metInPersonExplain);
  const allFullTime = readYesNo(activeValue.allFullTime);
  const fullTimeExplain = readString(activeValue.fullTimeExplain);
  const whyTeam = readString(activeValue.whyTeam);
  const lookingForCoFounder = readYesNo(activeValue.lookingForCoFounder);
  const coFounderNeedExplain = readString(activeValue.coFounderNeedExplain);

  const isReadOnly = locked || disabled || Boolean(readonlyReason);
  const inviteButtonDisabled =
    !canInviteRoster || isInviteSubmissionPending;

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          Founders
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-white/50">
          Understand who is building the company, how the team operates, and
          why this team is capable of executing successfully together.
        </p>
      </div>

      <div className="space-y-4">
        {canInviteRoster ? (
          <button
            type="button"
            onClick={openInviteComposer}
            aria-expanded={isInviteComposerOpen ? "true" : "false"}
            disabled={inviteButtonDisabled}
            className={`
              inline-flex h-8 items-center justify-center rounded-full border px-4 text-xs font-medium
              transition-all duration-200 focus:outline-none
              ${
                isInviteComposerOpen
                  ? "border-blue-400/25 bg-blue-500/15 text-white shadow-[0_10px_30px_rgba(59,130,246,.12)]"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-400/20 hover:bg-blue-500/8 hover:text-white"
              }
              ${inviteButtonDisabled ? "cursor-not-allowed opacity-50 hover:bg-white/[0.03] hover:text-white/70" : ""}
            `}
          >
            Add a co-founder
          </button>
        ) : null}

        <AnimatePresence initial={false}>
          {isInviteComposerOpen && canInviteRoster && (
            <motion.div
              key="invite-composer"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <InviteFounderDialog
                open={isInviteComposerOpen}
                email={inviteEmail}
                pending={isInviteSubmissionPending}
                onEmailChange={setInviteEmail}
                onSubmit={sendCoFounderInvite}
                onClose={closeInviteComposer}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {displayRows.length > 0 && (
            <motion.div
              key="sent-invites"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-3 pt-1"
            >
              {displayRows.map((row) => (
                <motion.div
                  key={`${row.kind}-${row.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/85">
                        {row.label}
                      </p>
                    </div>

                    <MemberActionsDropdown
                      kind={row.kind}
                      canCopyLink={row.kind === "invite"}
                      canRemove={
                        row.kind === "member"
                          ? canRemoveRoster && !row.isOwner
                          : canRemoveRoster
                      }
                      acceptUrl={row.kind === "invite" ? row.acceptUrl : null}
                      copied={row.kind === "invite" && copiedInviteId === row.id}
                      onCopyLink={
                        row.kind === "invite"
                          ? () => void copyInvitationLink(row.id, row.acceptUrl)
                          : undefined
                      }
                      onRemove={
                        canRemoveRoster
                          ? () => requestRemoval(row.kind, row.id, row.label)
                          : undefined
                      }
                      removing={
                        row.kind === "member"
                          ? Boolean(removingMemberIds[row.id])
                          : false
                      }
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RemoveMemberConfirm
        open={Boolean(pendingRemoval)}
        title={
          pendingRemoval?.kind === "member"
            ? "Remove co-founder?"
            : "Remove invitation?"
        }
        description={
          pendingRemoval?.kind === "member"
            ? `This will remove ${pendingRemoval.label} from the application workspace.`
            : `This will cancel the invitation for ${pendingRemoval?.label ?? ""}.`
        }
        pending={isRemovalSubmissionPending}
        onConfirm={() => void confirmPendingRemoval()}
        onCancel={closeRemovalConfirm}
      />

      <div className="space-y-8">
        <Question
          label="Who is responsible for building and operating the product today? *"
          description="Explain who handles engineering, product, operations, sales, research, or other critical work."
        >
          <Textarea
            value={whoBuildsToday}
            onChange={(next) => setDraftField("whoBuildsToday", next)}
            placeholder="Example: I handle backend infrastructure and model training. My co-founder handles product design and growth."
            disabled={isReadOnly}
          />
        </Question>

        <Question
          label="Has any critical product, engineering, or operational work been done by people who are not founders? *"
          description="Contractors, agencies, employees, researchers, friends, advisors, or anyone else who materially contributed."
        >
          <Radio<YesNo>
            name="critical-work"
            value={criticalWorkByNonFounders}
            onChange={(next) =>
              setDraftField("criticalWorkByNonFounders", next)
            }
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
          />

          {criticalWorkByNonFounders === "Yes" && (
            <Textarea
              value={criticalWorkExplain}
              onChange={(next) => setDraftField("criticalWorkExplain", next)}
              placeholder="Explain who contributed, what they worked on, and why."
              disabled={isReadOnly}
            />
          )}
        </Question>

        {hasMultipleFounders && (
          <>
            <Question
              label="How did the founders meet, and what have you worked on together before this company? *"
              description="Explain how the founders met, how the relationship evolved, and any previous projects, companies, research, or work experience shared together."
            >
              <Textarea
                value={howFoundersMet}
                onChange={(next) => setDraftField("howFoundersMet", next)}
                placeholder="Example: We met at university in 2021, collaborated on machine learning research together, and later started this company after seeing the same problem repeatedly in healthcare workflows."
                disabled={isReadOnly}
              />
            </Question>

            <Question label="Have all founders met and worked together in person for a meaningful period of time? *">
              <Radio<YesNo>
                name="met-in-person"
                value={metInPerson}
                onChange={(next) => setDraftField("metInPerson", next)}
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
              />

              {metInPerson === "No" && (
                <Textarea
                  value={metInPersonExplain}
                  onChange={(next) =>
                    setDraftField("metInPersonExplain", next)
                  }
                  placeholder="Explain how the team collaborates effectively across locations, time zones, communication workflows, and day-to-day execution."
                  disabled={isReadOnly}
                />
              )}
            </Question>

            <Question label="Are all founders currently working on the company full-time? *">
              <Radio<YesNo>
                name="full-time"
                value={allFullTime}
                onChange={(next) => setDraftField("allFullTime", next)}
                options={[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ]}
              />

              {allFullTime === "No" && (
                <Textarea
                  value={fullTimeExplain}
                  onChange={(next) => setDraftField("fullTimeExplain", next)}
                  placeholder="Be transparent about who is not full-time and the timeline toward full-time commitment."
                  disabled={isReadOnly}
                />
              )}
            </Question>

            <Question
              label="Why is this team uniquely positioned to solve this problem? *"
              description="Experience, insight, technical advantage, domain expertise, obsession, relationships, or lived experience."
            >
              <Textarea
                value={whyTeam}
                onChange={(next) => setDraftField("whyTeam", next)}
                placeholder="Explain the team’s specific advantage in a concrete way."
                disabled={isReadOnly}
              />
            </Question>
          </>
        )}

        <Question
          label="Are you looking for another founder or key early team member? *"
          description="Technical, product, AI research, growth, operations, design, biotech, or another capability gap."
        >
          <Radio<YesNo>
            name="looking-for-cofounder"
            value={lookingForCoFounder}
            onChange={(next) => setDraftField("lookingForCoFounder", next)}
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
          />

          {lookingForCoFounder === "Yes" && (
            <Textarea
              value={coFounderNeedExplain}
              onChange={(next) => setDraftField("coFounderNeedExplain", next)}
              placeholder="What role or capability are you looking for?"
              disabled={isReadOnly}
            />
          )}
        </Question>
      </div>
    </div>
  );
}