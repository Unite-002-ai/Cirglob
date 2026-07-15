"use client";

import { ActionButton, InfoRow, ToggleLine } from "../../ui";

type ProfileSettings = {
  login_alerts: boolean;
  trusted_devices: boolean;
};

type SecurityOverviewProps = {
  settings: ProfileSettings;
  saving: boolean;

  onToggle: (key: keyof ProfileSettings, value: boolean) => void;
  onChangePassword: () => void;
};

export default function SecurityOverview({
  settings,
  saving,
  onToggle,
  onChangePassword,
}: SecurityOverviewProps) {
  return (
    <div className="space-y-6 transition-all duration-200 ease-out">
      {/* SECURITY INFO BLOCK */}
      <div className="space-y-0">
        <InfoRow label="Password" value="••••••••" />
        <InfoRow label="Last changed" value="Not available" />
        <InfoRow label="Active sessions" value="1 device" />
        <InfoRow label="Login activity" value="View recent logins" />
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2">
        <ActionButton
          type="button"
          onClick={onChangePassword}
        >
          Change password
        </ActionButton>
      </div>

      {/* SECURITY TOGGLES */}
      <div className="space-y-4 pt-2">
        <ToggleLine
          label="Login alerts"
          description="Get notified when a new device signs in"
          enabled={settings.login_alerts}
          onToggle={() =>
            !saving &&
            onToggle("login_alerts", !settings.login_alerts)
          }
        />

        <ToggleLine
          label="Trusted devices"
          description="Remember devices you use often"
          enabled={settings.trusted_devices}
          onToggle={() =>
            !saving &&
            onToggle("trusted_devices", !settings.trusted_devices)
          }
        />
      </div>

      {/* SAVING STATE (subtle, non-blocking UI hint) */}
      {saving && (
        <p className="text-xs text-white/30 pt-1">
          Updating security settings...
        </p>
      )}
    </div>
  );
}
