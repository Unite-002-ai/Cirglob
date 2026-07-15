"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  ACCOUNT_PROVIDER,
  LOCAL_STORAGE_KEYS,
  PROFILE,
  STORAGE,
} from "@/lib/constants";
import type { RealtimeChannel, Session, User as SupabaseUser } from "@supabase/supabase-js";

export const PROFILE_TABLE = PROFILE.TABLE;

export type AccountProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  completed: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type AccountIdentity = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type StoredActiveApplicationId = string | null;

export type AccountContext = {
  user: SupabaseUser | null;
  profile: AccountProfile | null;
  identity: AccountIdentity | null;
};

export type AccountContextHydrationOptions = {
  /**
   * Reserved for future account-layer options.
   * Workspace authority now lives in the workspace runtime layer.
   */
};

export const DEFAULT_ACCOUNT_IDENTITY: AccountIdentity = {
  id: "",
  name: "",
  email: "",
  image: PROFILE.DEFAULT_AVATAR,
};

const ACTIVE_APPLICATION_ID_STORAGE_KEY = LOCAL_STORAGE_KEYS.LAST_ACTIVE_APPLICATION;
const ACTIVE_APPLICATION_ID_EVENT = "cirglob:active-application-updated";

let profileCache: AccountProfile | null = null;
let identityCache: AccountIdentity | null = null;
let activeApplicationIdCache: StoredActiveApplicationId = null;
let authChannel: RealtimeChannel | null = null;

const profileRequestCache = new Map<string, Promise<AccountProfile | null>>();
let authUserPromise: Promise<SupabaseUser | null> | null = null;
let authSessionPromise: Promise<Session | null> | null = null;

export const ACCOUNT_PROFILE_UPDATED_EVENT = ACCOUNT_PROVIDER.EVENTS.PROFILE_UPDATED;
export const ACCOUNT_IDENTITY_UPDATED_EVENT = "cirglob:account-identity-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return null;
}

function isLockError(error: unknown): boolean {
  const message = getErrorMessage(error)?.toLowerCase() ?? "";
  return (
    message.includes("lock") ||
    message.includes("steal") ||
    message.includes("another request") ||
    message.includes("stole it") ||
    message.includes("auth-token")
  );
}

function isMissingSessionError(error: unknown): boolean {
  const message = getErrorMessage(error)?.toLowerCase() ?? "";
  return (
    message.includes("auth session missing") ||
    message.includes("session missing") ||
    message.includes("no active session")
  );
}

function buildDisplayName(profile: AccountProfile): string {
  const first = safeString(profile.first_name);
  const last = safeString(profile.last_name);
  const fullName = safeString(profile.full_name);

  const joined = [first, last].filter(Boolean).join(" ").trim();

  if (joined) return joined;
  if (fullName) return fullName;

  return "";
}

function normalizeProfile(row: Record<string, unknown>): AccountProfile {
  const first_name = safeString(row.first_name);
  const last_name = safeString(row.last_name);
  const full_name = safeString(row.full_name);

  return {
    id: String(row.id ?? ""),
    email: safeString(row.email) || "",
    first_name,
    last_name,
    full_name,
    avatar_url: safeString(row.avatar_url) || null,
    completed: Boolean(row.completed ?? false),
    created_at: safeString(row.created_at) || null,
    updated_at: safeString(row.updated_at) || null,
  };
}

function mapProfileToIdentity(profile: AccountProfile): AccountIdentity {
  return {
    id: profile.id,
    name: buildDisplayName(profile),
    email: profile.email ?? "",
    image: profile.avatar_url ?? null,
  };
}

function identityFromSupabaseUser(user: SupabaseUser): AccountIdentity {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackName =
    safeString(metadata.first_name) ||
    safeString(metadata.last_name) ||
    safeString(metadata.full_name) ||
    safeString(metadata.name) ||
    PROFILE.DEFAULT_NAME ||
    (safeString(user.email)?.split("@")[0] ?? PROFILE.DEFAULT_NAME);

  return {
    id: user.id,
    name: fallbackName,
    email: user.email ?? "",
    image: safeString(metadata.avatar_url) ?? null,
  };
}

function readStoredActiveApplicationIdFromStorage(): StoredActiveApplicationId {
  if (!isBrowser()) return null;

  try {
    return safeString(window.localStorage.getItem(ACTIVE_APPLICATION_ID_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStoredActiveApplicationIdToStorage(
  activeApplicationId: StoredActiveApplicationId,
): void {
  if (!isBrowser()) return;

  try {
    if (activeApplicationId) {
      window.localStorage.setItem(
        ACTIVE_APPLICATION_ID_STORAGE_KEY,
        activeApplicationId,
      );
    } else {
      window.localStorage.removeItem(ACTIVE_APPLICATION_ID_STORAGE_KEY);
    }
  } catch {
    // non-fatal
  }
}

function emitActiveApplicationIdUpdate(): void {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event(ACTIVE_APPLICATION_ID_EVENT));
}

function syncStoredActiveApplicationIdCacheFromStorage(): void {
  activeApplicationIdCache = readStoredActiveApplicationIdFromStorage();
}

function updateCaches(profile: AccountProfile | null): void {
  profileCache = profile;
  identityCache = profile ? mapProfileToIdentity(profile) : null;
  emitProfileUpdate();
}

function removeAuthChannel(): void {
  if (!authChannel) return;

  try {
    const supabase = getSupabaseClient();
    void supabase.removeChannel(authChannel);
  } catch {
    // non-fatal
  } finally {
    authChannel = null;
  }
}

function emitProfileUpdate(): void {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event(ACCOUNT_PROFILE_UPDATED_EVENT));
  window.dispatchEvent(new Event(ACCOUNT_IDENTITY_UPDATED_EVENT));
}

export function getStoredActiveApplicationId(): StoredActiveApplicationId {
  if (activeApplicationIdCache !== null) return activeApplicationIdCache;

  syncStoredActiveApplicationIdCacheFromStorage();
  return activeApplicationIdCache;
}

export function setStoredActiveApplicationId(
  activeApplicationId: StoredActiveApplicationId,
): void {
  activeApplicationIdCache = safeString(activeApplicationId);
  writeStoredActiveApplicationIdToStorage(activeApplicationIdCache);
  emitActiveApplicationIdUpdate();
}

export function clearStoredActiveApplicationId(): void {
  activeApplicationIdCache = null;
  writeStoredActiveApplicationIdToStorage(null);
  emitActiveApplicationIdUpdate();
}

export function clearAccountState(): void {
  profileCache = null;
  identityCache = null;
  clearStoredActiveApplicationId();
  removeAuthChannel();
  emitProfileUpdate();
}

export function getSnapshotIdentity(): AccountIdentity | null {
  return identityCache;
}

export function getCachedProfile(): AccountProfile | null {
  return profileCache;
}

export function getCachedIdentity(): AccountIdentity | null {
  return identityCache;
}

export async function getAuthenticatedUser(): Promise<SupabaseUser | null> {
  if (authUserPromise) return authUserPromise;

  authUserPromise = (async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      if (!isMissingSessionError(error) && !isLockError(error)) {
        const message = getErrorMessage(error);
        if (message) console.error("[Cirglob Auth Error]", message);
      }

      return null;
    }

    return data.user ?? null;
  })();

  try {
    return await authUserPromise;
  } finally {
    authUserPromise = null;
  }
}

export async function getAuthenticatedSession(): Promise<Session | null> {
  if (authSessionPromise) return authSessionPromise;

  authSessionPromise = (async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      if (!isMissingSessionError(error) && !isLockError(error)) {
        const message = getErrorMessage(error);
        if (message) console.error("[Cirglob Session Error]", message);
      }
      return null;
    }

    return data.session ?? null;
  })();

  try {
    return await authSessionPromise;
  } finally {
    authSessionPromise = null;
  }
}

export async function getAccountProfile(userId: string): Promise<AccountProfile | null> {
  if (!userId) return null;

  if (profileCache?.id === userId) return profileCache;

  const existingRequest = profileRequestCache.get(userId);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select("id,email,first_name,last_name,full_name,avatar_url,completed,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      if (profileCache?.id === userId) {
        updateCaches(null);
      }

      if (!isLockError(error)) {
        const message = getErrorMessage(error);
        if (message) console.error("[Cirglob Profile Fetch Error]", message);
      }

      return null;
    }

    const normalized = normalizeProfile(data as Record<string, unknown>);
    updateCaches(normalized);
    return normalized;
  })();

  profileRequestCache.set(userId, request);

  try {
    return await request;
  } finally {
    profileRequestCache.delete(userId);
  }
}

export async function getAccountIdentity(userId: string): Promise<AccountIdentity | null> {
  const profile = await getAccountProfile(userId);
  if (!profile) return null;
  return mapProfileToIdentity(profile);
}

export async function hydrateAccountContext(
  _options: AccountContextHydrationOptions = {},
): Promise<AccountContext> {
  const user = await getAuthenticatedUser();

  if (!user) {
    clearAccountState();
    return {
      user: null,
      profile: null,
      identity: null,
    };
  }

  const profile = await getAccountProfile(user.id);
  const identity = profile ? mapProfileToIdentity(profile) : identityFromSupabaseUser(user);

  return {
    user,
    profile,
    identity,
  };
}
export type UpdateAccountProfileInput = {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  completed?: boolean | null;
};

export async function updateAccountProfile(
  userId: string,
  input: UpdateAccountProfileInput,
): Promise<AccountProfile | null> {
  if (!userId) return null;
  const payload: Record<string, unknown> = {};

  if (input.first_name !== undefined) payload.first_name = safeString(input.first_name);
  if (input.last_name !== undefined) payload.last_name = safeString(input.last_name);
  if (input.full_name !== undefined) payload.full_name = safeString(input.full_name);
  if (input.avatar_url !== undefined) payload.avatar_url = safeString(input.avatar_url);
  if (input.completed !== undefined && input.completed !== null) {
    payload.completed = Boolean(input.completed);
  }

  if (Object.keys(payload).length === 0) {
    return await getAccountProfile(userId);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .update(payload)
    .eq("id", userId)
    .select("id,email,first_name,last_name,full_name,avatar_url,completed,created_at,updated_at")
    .maybeSingle();
  if (error || !data) {
    if (!isLockError(error)) {
      const message = getErrorMessage(error);
      if (message) console.error("[Cirglob Profile Update Error]", message);
    }
    return null;
  }

  const normalized = normalizeProfile(data as Record<string, unknown>);
  updateCaches(normalized);
  return normalized;
}

export function buildAvatarPath(userId: string): string {
  return STORAGE.PATHS.avatar(userId);
}

export async function uploadAccountAvatar(
  userId: string,
  file: File,
): Promise<string | null> {
  if (!userId || !file) return null;
  const supabase = getSupabaseClient();
  const avatarPath = buildAvatarPath(userId);
  const { error: uploadError } = await supabase.storage
    .from(STORAGE.BUCKETS.AVATARS)
    .upload(avatarPath, file, {
      upsert: true,
      cacheControl: STORAGE.CACHE.AVATAR_MAX_AGE,
    });

  if (uploadError) {
    console.error("[Cirglob Avatar Upload Error]", uploadError.message);
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE.BUCKETS.AVATARS).getPublicUrl(avatarPath);

  const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
  const updated = await updateAccountProfile(userId, { 
    avatar_url: cacheBustedUrl,
  });

  if (!updated) return null;
  return cacheBustedUrl;
}

export function subscribeToAccountProfile(
  userId: string,
  callback?: (profile: AccountProfile) => void,
): () => void {
  if (!userId) return () => {};

  const supabase = getSupabaseClient();

  removeAuthChannel();

  authChannel = supabase
    .channel(`cirglob-profile-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: PROFILE_TABLE,
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === "DELETE") {
          clearAccountState();
          return;
        }

        const row = (payload.new ?? payload.old) as Record<string, unknown> | null;
        if (!row) return;

        const normalized = normalizeProfile(row);
        updateCaches(normalized);
        callback?.(normalized);
      },
    )
    .subscribe();

  return () => {
    removeAuthChannel();
  };
}

export function subscribeToAuthChanges(
  callback?: (context: AccountContext) => void,
): () => void {
  const supabase = getSupabaseClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    void (async () => {
      try {
        if (!session?.user) {
          clearAccountState();
          callback?.({
            user: null,
            profile: null,
            identity: null,
          });
          return;
        }

        const profile = await getAccountProfile(session.user.id);
        const identity = profile
          ? mapProfileToIdentity(profile)
          : identityFromSupabaseUser(session.user);

        callback?.({
          user: session.user,
          profile,
          identity,
        });
      } catch (error) {
        if (!isLockError(error)) {
          const message = getErrorMessage(error);
          if (message) {
            console.error("[Cirglob Auth State Sync Error]", message);
          }
        }
      }
    })();
  });

  return () => {
    subscription.unsubscribe();
  };
}

export function onAccountIdentityChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (): void => handler();

  window.addEventListener(ACCOUNT_PROFILE_UPDATED_EVENT, listener);
  window.addEventListener(ACCOUNT_IDENTITY_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(ACCOUNT_PROFILE_UPDATED_EVENT, listener);
    window.removeEventListener(ACCOUNT_IDENTITY_UPDATED_EVENT, listener);
  };
}

export function onStoredActiveApplicationIdChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const sync = (): void => {
    syncStoredActiveApplicationIdCacheFromStorage();
    handler();
  };

  const handleStorageEvent = (event: StorageEvent): void => {
    if (event.key && event.key !== ACTIVE_APPLICATION_ID_STORAGE_KEY) {
      return;
    }

    syncStoredActiveApplicationIdCacheFromStorage();
    handler();
  };

  window.addEventListener(ACTIVE_APPLICATION_ID_EVENT, sync);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(ACTIVE_APPLICATION_ID_EVENT, sync);
    window.removeEventListener("storage", handleStorageEvent);
  };
}