"use client";

import { cn } from "@/lib/utils";
import type { Tab } from "./types";

type SidebarItem = {
  id: Tab;
  label: string;
  /**
   * Optional flag for security-sensitive sections.
   * Used later for analytics / permission-aware UI / logging hooks.
   */
  security?: boolean;
};

type SettingsSidebarProps = {
  activeTab: Tab;
  onTabChange?: (tab: Tab) => void;
};

const items: SidebarItem[] = [
  { id: "profile", label: "Profile" },

  /**
   * SECURITY TAB (now upgraded into a flow engine internally)
   * - OTP flows
   * - password change state machine
   * - trusted devices
   * - sessions
   */
  { id: "security", label: "Security", security: true },

  /**
   * Notification system tied to:
   * - login alerts (new device detection)
   * - security events
   * - email alerts (Resend/Postmark integration layer later)
   */
  { id: "notifications", label: "Notifications" },
];

export default function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav className="h-full overflow-hidden">
      <div className="space-y-1.5 p-2.5">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isSecurity = item.security === true;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={cn(
                "group relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all duration-150",

                // ACTIVE STATE
                isActive
                  ? "border-white/10 bg-white/8 text-white"
                  : "border-transparent bg-transparent text-white/60 hover:border-white/5 hover:bg-white/[0.03] hover:text-white",
              )}
            >
              {/* ACTIVE INDICATOR BAR */}
              <div
                className={cn(
                  "absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-all",

                  isActive
                    ? "bg-[linear-gradient(180deg,#4AA8FF,#7D3DFF)]"
                    : "bg-transparent",
                )}
              />

              <div className="flex items-center justify-between pl-2">
                <div className="text-sm font-medium tracking-tight">
                  {item.label}
                </div>

                {/* SECURITY BADGE (future-ready, no visual change unless active) */}
                {isSecurity && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-[2px] text-[10px] font-medium tracking-wide",
                      isActive
                        ? "bg-white/10 text-white/80"
                        : "bg-white/5 text-white/30",
                    )}
                  >
                    SEC
                  </span>
                )}
              </div>

              {/* FUTURE HOOK PLACE (DO NOT REMOVE) */}
              {/* 
                This is intentionally reserved for:
                - security event tracking hooks
                - telemetry for login alerts system
                - session anomaly awareness
              */}
              <div className="hidden" data-tab-id={item.id} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
