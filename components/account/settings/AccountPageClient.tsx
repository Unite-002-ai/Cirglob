"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AccountLayout from "@/components/account/settings/AccountLayout";
import SettingsContent from "@/components/account/settings/SettingsContent";
import type { Tab } from "@/components/account/settings/types";
import type { AccountIdentity } from "@/components/account/hooks/useAccountIdentity";

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

type AccountPageClientProps = {
  userId: string;
  initialUser: AccountIdentity;
  initialProfile: InitialProfile;
  initialSettings: InitialSettings;
};

const VALID_TABS: Tab[] = ["profile", "security", "notifications"];

function isTab(value: string | null): value is Tab {
  return value !== null && VALID_TABS.includes(value as Tab);
}

export default function AccountPageClient({
  userId,
  initialUser,
  initialProfile,
  initialSettings,
}: AccountPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromUrl = useMemo<Tab>(() => {
    const tab = searchParams.get("tab");
    return isTab(tab) ? tab : "profile";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <AccountLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      initialUser={initialUser}
    >
      <SettingsContent
        activeTab={activeTab}
        userId={userId}
        initialProfile={initialProfile}
        initialSettings={initialSettings}
      />
    </AccountLayout>
  );
}