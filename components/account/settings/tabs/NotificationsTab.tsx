"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { InfoRow, ToggleLine } from "../ui";

type ProfileSettings = {
  app_updates: boolean;
  system_updates: boolean;
  notifications_enabled?: boolean;
};

type InitialSettings = {
  app_updates: boolean;
  system_updates: boolean;
  notifications_enabled?: boolean;
};

type NotificationsTabProps = {
  userId: string;
  initialSettings: InitialSettings;
};

const DEFAULT_SETTINGS: ProfileSettings = {
  app_updates: true,
  system_updates: true,
  notifications_enabled: true,
};

export default function NotificationsTab({
  userId,
  initialSettings,
}: NotificationsTabProps) {
  const supabase = createClient();

  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<ProfileSettings>({
    app_updates: initialSettings.app_updates ?? true,
    system_updates: initialSettings.system_updates ?? true,
    notifications_enabled: initialSettings.notifications_enabled ?? true,
  });

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profile_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        setSettings(DEFAULT_SETTINGS);
      } else {
        setSettings({
          app_updates: data.app_updates ?? true,
          system_updates: data.system_updates ?? true,
          notifications_enabled: data.notifications_enabled ?? true,
        });
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, [supabase, userId]);

  const updateSettings = async (patch: Partial<ProfileSettings>) => {
    setSaving(true);

    const next = { ...settings, ...patch };
    setSettings(next);

    const { error } = await supabase
      .from("profile_settings")
      .upsert(
        {
          user_id: userId,
          ...next,
        },
        {
          onConflict: "user_id",
        },
      );

    if (error) {
      setSettings(settings);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Manage how Cirglob communicates with you.
        </p>
      </div>

      <div className="space-y-0">
        <ToggleLine
          label="Application updates"
          description="Product changes and releases"
          enabled={settings.app_updates}
          onToggle={() =>
            updateSettings({
              app_updates: !settings.app_updates,
            })
          }
        />

        <ToggleLine
          label="System updates"
          description="Important account or platform notices"
          enabled={settings.system_updates}
          onToggle={() =>
            updateSettings({
              system_updates: !settings.system_updates,
            })
          }
        />
      </div>

      <div className="space-y-0">
        <InfoRow
          label="Email notifications"
          value={
            settings.app_updates || settings.system_updates
              ? "Enabled"
              : "Disabled"
          }
        />

        <InfoRow label="Critical alerts" value="Always enabled" />

        {saving && (
          <p className="pt-2 text-xs text-white/30">Saving changes...</p>
        )}
      </div>
    </div>
  );
}
