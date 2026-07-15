// components/account/settings/tabs/ProfileTab.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Avatar from "@/components/account/ui/Avatar";
import { ActionButton, Grid, Input } from "../ui";
import { ERRORS, SECURITY } from "@/lib/constants";
import {
  updateAccountProfile,
  uploadAccountAvatar,
  type AccountProfile,
} from "@/lib/account-user";
import { useOptionalAccountProvider } from "@/providers/account-provider";
import type { InitialProfile } from "../types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

type ProfileTabProps = {
  userId: string;
  initialProfile: InitialProfile;
};

type ProfileSnapshot = Pick<
  AccountProfile,
  "id" | "email" | "first_name" | "last_name" | "full_name" | "avatar_url"
>;

function fileIsAllowed(file: File) {
  return SECURITY.ALLOWED_AVATAR_TYPES.includes(file.type as never);
}

function normalizeName(firstName: string, lastName: string) {
  const full = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ").trim();
  return full.length > 0 ? full : "";
}

function splitFullName(value?: string | null) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function snapshotToForm(profile: ProfileSnapshot | InitialProfile) {
  const nameParts = splitFullName(
    profile.full_name ??
      [profile.first_name, profile.last_name]
        .filter((part) => typeof part === "string" && part.trim().length > 0)
        .join(" "),
  );

  return {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    email: profile.email ?? "",
    avatarUrl: profile.avatar_url ?? null,
  };
}

export default function ProfileTab({
  userId,
  initialProfile,
}: ProfileTabProps) {
  const provider = useOptionalAccountProvider();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const activeProfile = provider?.profile ?? null;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialProfile.avatar_url ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState<ProfileForm>(() => {
    const initial = snapshotToForm(initialProfile);
    return {
      firstName: initial.firstName,
      lastName: initial.lastName,
      email: initial.email,
      avatarUrl: initial.avatarUrl,
    };
  });

  const clearPreviewObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const syncFromProfile = (profile: ProfileSnapshot | InitialProfile) => {
    clearPreviewObjectUrl();
    setAvatarFile(null);

    const next = snapshotToForm(profile);

    setForm({
      firstName: next.firstName,
      lastName: next.lastName,
      email: next.email,
      avatarUrl: next.avatarUrl,
    });

    setPreview(next.avatarUrl);
  };

  useEffect(() => {
    syncFromProfile(activeProfile ?? initialProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeProfile?.id,
    activeProfile?.email,
    activeProfile?.first_name,
    activeProfile?.last_name,
    activeProfile?.full_name,
    activeProfile?.avatar_url,
    initialProfile.email,
    initialProfile.full_name,
    initialProfile.first_name,
    initialProfile.last_name,
    initialProfile.avatar_url,
  ]);

  useEffect(() => {
    return () => {
      clearPreviewObjectUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) return;

    if (!fileIsAllowed(file)) {
      setError(ERRORS.INVALID_FILE_TYPE);
      return;
    }

    if (file.size > SECURITY.AVATAR_MAX_UPLOAD_SIZE) {
      setError(ERRORS.FILE_TOO_LARGE);
      return;
    }

    clearPreviewObjectUrl();

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setAvatarFile(file);
    setPreview(objectUrl);
  };

  const handleSave = async () => {
    if (!userId || saving) return;

    setSaving(true);
    setError(null);

    try {
      const nextFullName = normalizeName(form.firstName, form.lastName);
      let avatarUrl = form.avatarUrl;

      if (avatarFile) {
        const uploaded = await uploadAccountAvatar(userId, avatarFile);

        if (!uploaded) {
          throw new Error("Avatar upload failed.");
        }

        avatarUrl = uploaded;
      }

      const updated = await updateAccountProfile(userId, {
        first_name: form.firstName.trim() || null,
        last_name: form.lastName.trim() || null,
        full_name: nextFullName,
        avatar_url: avatarUrl,
      });

      if (!updated) {
        throw new Error("Unable to save profile.");
      }

      clearPreviewObjectUrl();
      setAvatarFile(null);

      const updatedNameParts = splitFullName(updated.full_name);

      setForm({
        firstName: updatedNameParts.firstName,
        lastName: updatedNameParts.lastName,
        email: updated.email ?? "",
        avatarUrl: updated.avatar_url ?? null,
      });

      setPreview(updated.avatar_url ?? null);
      void provider?.refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!userId || saving) return;

    setSaving(true);
    setError(null);

    try {
      clearPreviewObjectUrl();

      setPreview(null);
      setAvatarFile(null);
      updateField("avatarUrl", null);

      const updated = await updateAccountProfile(userId, {
        first_name: form.firstName.trim() || null,
        last_name: form.lastName.trim() || null,
        full_name: normalizeName(form.firstName, form.lastName),
        avatar_url: null,
      });

      if (!updated) {
        throw new Error("Unable to update avatar.");
      }

      const updatedNameParts = splitFullName(updated.full_name);

      setForm({
        firstName: updatedNameParts.firstName,
        lastName: updatedNameParts.lastName,
        email: updated.email ?? "",
        avatarUrl: updated.avatar_url ?? null,
      });

      setPreview(updated.avatar_url ?? null);
      void provider?.refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to remove avatar.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayName = useMemo(
    () => normalizeName(form.firstName, form.lastName),
    [form.firstName, form.lastName],
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">Profile</h2>
        <p className="text-sm text-white/40">
          Edit your identity and public presence inside Cirglob.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-4 xl:items-start">
          <div className="relative">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={saving}
              className="rounded-full transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Avatar src={preview} name={displayName} size={96} />
            </button>

            <span className="absolute -bottom-1 -right-1 rounded-full border border-white/10 bg-[#05060A] px-2 py-1 text-[10px] text-white/60">
              Upload
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={SECURITY.ALLOWED_AVATAR_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            disabled={saving}
          />

          <div className="flex flex-wrap justify-center gap-2 xl:justify-start">
            <ActionButton
              type="button"
              onClick={handleAvatarClick}
              disabled={saving}
              className="px-4 py-2 text-sm"
            >
              Choose image
            </ActionButton>

            <ActionButton
              type="button"
              tone="secondary"
              onClick={handleRemoveImage}
              disabled={saving || !preview}
              className="px-4 py-2 text-sm"
            >
              Remove
            </ActionButton>
          </div>

          <p className="max-w-[240px] text-center text-xs leading-relaxed text-white/35 xl:text-left">
            Upload a square profile image for the top bar and dropdown.
          </p>
        </div>

        <div className="space-y-6">
          <Grid className="grid-cols-1 gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                First Name
              </span>

              <Input
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="First name"
                disabled={saving}
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Last Name
              </span>

              <Input
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Last name"
                disabled={saving}
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Email
              </span>

              <Input
                value={form.email}
                readOnly
                className="opacity-80"
                placeholder="you@domain.com"
              />
            </label>
          </Grid>

          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ) : null}

          <div className="pt-2">
            <ActionButton
              type="button"
              onClick={handleSave}
              disabled={saving || !userId}
              className="px-6 py-2.5 text-sm"
            >
              {saving ? "Saving..." : "Save changes"}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}