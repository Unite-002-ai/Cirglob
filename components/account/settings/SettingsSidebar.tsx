"use client";

import { cn } from "@/lib/utils";
import type { Tab } from "./types";

type SidebarItem = {
  id: Tab;
  label: string;
};

type SettingsSidebarProps = {
  activeTab: Tab;
  onTabChange?: (tab: Tab) => void;
};

const items: SidebarItem[] = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "applications", label: "Applications" },
  { id: "system", label: "System Info" },
];

export default function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                "relative w-full rounded-xl px-4 py-3 text-left transition-all duration-150",
                "border border-transparent",
                isActive
                  ? "bg-white/10 text-white border-white/10"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              <div
                className={cn(
                  "absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-all",
                  isActive ? "bg-blue-400" : "bg-transparent"
                )}
              />
              <span className="pl-2 text-sm font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}