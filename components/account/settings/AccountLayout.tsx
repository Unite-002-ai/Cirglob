"use client";

import type { ReactNode } from "react";

import CirglobBrand from "@/components/CirglobBrand";
import Avatar from "@/components/account/ui/Avatar";
import { useAccountIdentity } from "@/components/account/hooks/useAccountIdentity";
import { cn } from "@/lib/utils";
import SettingsSidebar from "./SettingsSidebar";
import type { Tab } from "./types";

type AccountLayoutProps = {
  children: ReactNode;
  activeTab: Tab;
  onTabChange?: (tab: Tab) => void;
  initialUser?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
};

export default function AccountLayout({
  children,
  activeTab,
  onTabChange,
  initialUser = null,
}: AccountLayoutProps) {
  const { user } = useAccountIdentity(initialUser);

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-[#05060A] text-white">
      <div className="absolute left-8 top-7 z-20">
        <CirglobBrand />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-20%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-15%] h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[220px]" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-2 py-8 sm:px-4 sm:py-10 md:px-6 md:py-12">
        <div
          className={cn(
            "flex h-[560px] max-h-[calc(100vh-6rem)] w-full max-w-[860px] overflow-hidden rounded-[24px]",
            "border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl",
            "-translate-y-2 sm:-translate-y-1",
          )}
        >
          <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.image ?? null}
                  name={user?.name || ""}
                  size={36}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/90">
                    Account settings
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    Manage identity, security, and access
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <SettingsSidebar activeTab={activeTab} onTabChange={onTabChange} />
            </div>
          </aside>

          <section className="min-w-0 flex-1 bg-transparent">
            <div
              className={cn(
                "h-full overflow-y-auto px-4 py-4 sm:px-5 sm:py-5",
                "[scrollbar-width:none] [-ms-overflow-style:none]",
                "[&::-webkit-scrollbar]:hidden",
              )}
            >
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}