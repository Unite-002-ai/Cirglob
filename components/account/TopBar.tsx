"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/account/ui/Avatar";
import AccountDropdown from "@/components/account/ui/AccountDropdown";
import {
  DEFAULT_USER,
  getStoredUser,
  onStoredUserChange,
  type CirglobUser,
} from "@/lib/account-user";

type TopBarProps = {
  user?: CirglobUser;
};

export default function TopBar({ user }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CirglobUser>(
    user ?? DEFAULT_USER
  );

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }

    setCurrentUser(getStoredUser());

    const unsubscribe = onStoredUserChange(() => {
      setCurrentUser(getStoredUser());
    });

    return unsubscribe;
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#05060A]/70 backdrop-blur-xl">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white/10" />
          <span className="text-sm text-white/70 tracking-tight">
            Cirglob
          </span>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex items-center gap-3 px-2 py-1 rounded-full",
              "hover:bg-white/5 transition-colors",
              "focus:outline-none focus:ring-1 focus:ring-white/10"
            )}
          >
            <Avatar
              src={currentUser.image}
              name={currentUser.name}
              size={32}
            />

            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm text-white/80">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-white/40">
                {currentUser.email}
              </span>
            </div>

            <span className="text-white/40 text-xs">▾</span>
          </button>

          {/* ✅ ONLY THIS controls navigation now */}
          <AccountDropdown
            open={open}
            onClose={() => setOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}