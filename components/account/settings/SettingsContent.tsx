"use client";

import type { ReactNode } from "react";
import type { Tab } from "./types";

import ProfileTab from "./tabs/ProfileTab";
import SecurityTab from "./tabs/SecurityTab";
import PreferencesTab from "./tabs/PreferencesTab";
import NotificationsTab from "./tabs/NotificationsTab";
import PrivacyTab from "./tabs/PrivacyTab";
import ApplicationsTab from "./tabs/ApplicationsTab";
import SystemTab from "./tabs/SystemTab";

type SettingsContentProps = {
  activeTab: Tab;
};

const contentMap: Record<Tab, ReactNode> = {
  profile: <ProfileTab />,
  security: <SecurityTab />,
  preferences: <PreferencesTab />,
  notifications: <NotificationsTab />,
  privacy: <PrivacyTab />,
  applications: <ApplicationsTab />,
  system: <SystemTab />,
};

const titleMap: Record<Tab, string> = {
  profile: "Profile",
  security: "Security",
  preferences: "Preferences",
  notifications: "Notifications",
  privacy: "Privacy",
  applications: "Applications",
  system: "System Info",
};

const descriptionMap: Record<Tab, string> = {
  profile: "Your identity and public presence inside Cirglob.",
  security: "Control how your account is protected and accessed.",
  preferences: "Define your environment and system behavior.",
  notifications: "Manage how Cirglob communicates with you.",
  privacy: "Control visibility and data exposure.",
  applications: "Track your activity across Cirglob systems.",
  system: "Read-only technical and account metadata.",
};

export default function SettingsContent({ activeTab }: SettingsContentProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          {titleMap[activeTab]}
        </h1>
        <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
          {descriptionMap[activeTab]}
        </p>
      </div>

      <div className="space-y-6">{contentMap[activeTab]}</div>
    </div>
  );
}