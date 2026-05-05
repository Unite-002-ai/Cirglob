"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AccountLayout from "@/components/account/settings/AccountLayout";
import SettingsContent from "@/components/account/settings/SettingsContent";
import type { Tab } from "@/components/account/settings/types";

const VALID_TABS: Tab[] = [
  "profile",
  "security",
  "preferences",
  "notifications",
  "privacy",
  "applications",
  "system",
];

function isTab(value: string | null): value is Tab {
  return value !== null && VALID_TABS.includes(value as Tab);
}

export default function AccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo<Tab>(() => {
    const tab = searchParams.get("tab");
    return isTab(tab) ? tab : "profile";
  }, [searchParams]);

  const handleTabChange = (tab: Tab) => {
    router.replace(`${pathname}?tab=${tab}`);
  };

  return (
    <main className="min-h-screen bg-[#05060A] text-white">
      <AccountLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <SettingsContent activeTab={activeTab} />
      </AccountLayout>
    </main>
  );
}