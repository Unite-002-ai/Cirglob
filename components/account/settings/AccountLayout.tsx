"use client";

import React from "react";
import { cn } from "@/lib/utils";
import SettingsSidebar from "./SettingsSidebar";
import type { Tab } from "./types";

type AccountLayoutProps = {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange?: (tab: Tab) => void;
};

export default function AccountLayout({
  children,
  activeTab,
  onTabChange,
}: AccountLayoutProps) {
  return (
    <div className="relative w-full h-screen bg-[#05060A] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 flex h-full">
        <aside className="w-[260px] border-r border-white/10 bg-[#05060A]/60 backdrop-blur-xl">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <SettingsSidebar activeTab={activeTab} onTabChange={onTabChange} />
            </div>
          </div>
        </aside>

        <main className="flex-1 relative">
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 md:py-12">
              <div
                className={cn(
                  "transition-all duration-300 ease-out",
                  "opacity-100 translate-y-0"
                )}
              >
                {children}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#05060A] to-transparent" />
        </main>
      </div>
    </div>
  );
}