"use client";

import type { ReactNode } from "react";
import type { InitialProfile, InitialSettings, Tab } from "./types";

import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import NotificationsTab from "./tabs/NotificationsTab";

type SettingsContentProps = {
  activeTab: Tab;
  userId: string;
  initialProfile: InitialProfile;
  initialSettings: InitialSettings;
};

export default function SettingsContent({
  activeTab,
  userId,
  initialProfile,
  initialSettings,
}: SettingsContentProps) {
  const contentMap: Record<Tab, ReactNode> = {
    profile: (
      <ProfileTab userId={userId} initialProfile={initialProfile} />
    ),
    security: (
      <SecurityTab userId={userId} initialSettings={initialSettings} />
    ),
    notifications: (
      <NotificationsTab
        userId={userId}
        initialSettings={initialSettings}
      />
    ),
  };

  return <div className="h-full">{contentMap[activeTab]}</div>;
}