"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import SecurityOverview from "./security/SecurityOverview";
import VerifyCodeView from "./security/VerifyCodeView";
import NewPasswordView from "./security/NewPasswordView";
import PasswordSuccessView from "./security/PasswordSuccessView";

type ProfileSettings = {
  login_alerts: boolean;
  trusted_devices: boolean;
};

type InitialSettings = {
  login_alerts: boolean;
  trusted_devices: boolean;
};

type SecurityView = "overview" | "verify" | "password" | "success";

type SecurityTabProps = {
  userId: string;
  initialSettings: InitialSettings;
};

const supabase = createClient();

export default function SecurityTab({
  userId,
  initialSettings,
}: SecurityTabProps) {
  const [view, setView] = useState<SecurityView>("overview");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<ProfileSettings>({
    login_alerts: initialSettings.login_alerts ?? true,
    trusted_devices: initialSettings.trusted_devices ?? true,
  });

  const updateSetting = useCallback(
    async (key: keyof ProfileSettings, value: boolean) => {
      if (!userId) return;

      setSaving(true);

      const previous = settings;
      const updated = {
        ...settings,
        [key]: value,
      };

      setSettings(updated);

      const { error } = await supabase
        .from("profile_settings")
        .upsert(
          {
            user_id: userId,
            ...updated,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

      if (error) {
        setSettings(previous);
      }

      setSaving(false);
    },
    [settings, userId],
  );

  const startPasswordFlow = () => setView("verify");
  const handleVerifySuccess = () => setView("password");
  const handlePasswordUpdated = () => setView("success");
  const resetToOverview = () => setView("overview");

  const handleResendCode = async () => {
    console.log("Resending verification code...");
  };

  const handleChangeEmail = () => {
    console.log("Change email requested");
  };

  const handleCancelFlow = () => {
    setView("overview");
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="h-4 w-64 rounded bg-white/10" />
        <div className="h-24 rounded bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Security
        </h2>
        <p className="mt-1 text-sm text-white/40">
          Manage password and account access.
        </p>
      </div>

      {view === "overview" && (
        <SecurityOverview
          settings={settings}
          saving={saving}
          onToggle={updateSetting}
          onChangePassword={startPasswordFlow}
        />
      )}

      {view === "verify" && (
        <VerifyCodeView
          onVerified={handleVerifySuccess}
          onResend={handleResendCode}
          onChangeEmail={handleChangeEmail}
          onCancel={handleCancelFlow}
        />
      )}

      {view === "password" && <NewPasswordView onSuccess={handlePasswordUpdated} />}

      {view === "success" && <PasswordSuccessView onDone={resetToOverview} />}
    </div>
  );
}