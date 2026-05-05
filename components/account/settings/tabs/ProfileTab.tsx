"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/account/ui/Avatar";
import { ActionButton, Field, Grid, Input, SectionCard, SectionTitle, TextArea } from "../ui";
import {
  DEFAULT_USER,
  getStoredUser,
  setStoredUser,
  type CirglobUser,
} from "@/lib/account-user";

type ProfileForm = CirglobUser;

export default function ProfileTab() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>(() => DEFAULT_USER);

  useEffect(() => {
    const user = getStoredUser();
    setForm(user);
    setPreview(user.image ?? null);
  }, []);

  const initials = useMemo(() => {
    return (form.name || "U")
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [form.name]);

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextUser: CirglobUser = {
        ...form,
        image: preview,
      };

      setForm(nextUser);
      setStoredUser(nextUser);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle>Identity Core</SectionTitle>

        <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">
          <div className="flex flex-col items-center xl:items-start gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-white/15"
              >
                <Avatar
                  src={preview}
                  name={form.name || "User"}
                  size={96}
                />
              </button>

              <span className="absolute -bottom-1 -right-1 rounded-full border border-white/10 bg-[#05060A] px-2 py-1 text-[10px] text-white/55">
                Upload
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />

            <div className="flex flex-wrap gap-2 justify-center xl:justify-start">
              <ActionButton type="button" onClick={handleAvatarClick}>
                Choose image
              </ActionButton>
              <ActionButton type="button" onClick={handleRemoveImage}>
                Remove
              </ActionButton>
            </div>

            <p className="max-w-[220px] text-xs text-white/35 leading-relaxed text-center xl:text-left">
              Upload a square profile image for a cleaner identity layer in the top bar and dropdown.
            </p>
          </div>

          <div className="space-y-5">
            <Grid className="md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Name</span>
                <Input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your full name"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Username</span>
                <Input
                  value={form.username || ""}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="@username"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Email</span>
                <Input
                  value={form.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@domain.com"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Location</span>
                <Input
                  value={form.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="City, Country"
                />
              </label>
            </Grid>

            <label className="space-y-2 block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Bio</span>
              <TextArea
                value={form.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder="A short description of your profile..."
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                  Language
                </span>
                <Input
                  value={form.language || ""}
                  onChange={(e) => updateField("language", e.target.value)}
                  placeholder="English"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">
                  Timezone
                </span>
                <Input
                  value={form.timezone || ""}
                  onChange={(e) => updateField("timezone", e.target.value)}
                  placeholder="UTC"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ActionButton type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </ActionButton>

              <div className="text-xs text-white/35">
                Stored locally for now. Hook this to your API when ready.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Quick identity snapshot</SectionTitle>

        <Grid>
          <Field label="Avatar state" value={preview ? "Custom image uploaded" : "Using initials fallback"} />
          <Field label="Display name" value={form.name || initials} />
          <Field label="Username" value={form.username || "Not set"} />
          <Field label="Email" value={form.email || "Not set"} />
        </Grid>
      </SectionCard>
    </div>
  );
}