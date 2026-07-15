// app/account/page.tsx
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PROFILE } from "@/lib/constants";

import AccountPageClient from "@/components/account/settings/AccountPageClient";

type InitialProfile = {
  full_name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string | null;
  avatar_url: string | null;
};

type InitialSettings = {
  notifications_enabled: boolean;
  login_alerts: boolean;
  system_updates: boolean;
  app_updates: boolean;
  trusted_devices: boolean;
};

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveDisplayName(
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
  } | null,
): string {
  const profileParts = [safeString(profile?.first_name), safeString(profile?.last_name)]
    .filter(Boolean)
    .join(" ")
    .trim();

  const profileFullName = safeString(profile?.full_name);

  return profileParts || profileFullName || "";
}

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/signin?error=unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/auth/error?reason=profile_missing");
  }

  const { data: settings } = await supabase
    .from("profile_settings")
    .select(
      "user_id, notifications_enabled, login_alerts, system_updates, app_updates, trusted_devices, dark_mode",
    )
    .eq("user_id", user.id)
    .maybeSingle();

    const displayName = resolveDisplayName(profile);

  const initialUser = {
    id: user.id,
    name: displayName,
    email: profile.email ?? user.email ?? "",
    image: profile.avatar_url ?? null,
  };

  const initialProfile: InitialProfile = {
    full_name: profile.full_name ?? null,
    first_name: profile.first_name ?? null,
    last_name: profile.last_name ?? null,
    email: profile.email ?? user.email ?? null,
    avatar_url: profile.avatar_url ?? null,
  };

  const initialSettings: InitialSettings = {
    notifications_enabled: settings?.notifications_enabled ?? true,
    login_alerts: settings?.login_alerts ?? true,
    system_updates: settings?.system_updates ?? true,
    app_updates: settings?.app_updates ?? true,
    trusted_devices: settings?.trusted_devices ?? true,
  };

  return (
    <AccountPageClient
      userId={user.id}
      initialUser={initialUser}
      initialProfile={initialProfile}
      initialSettings={initialSettings}
    />
  );
}
