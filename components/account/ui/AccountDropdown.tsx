"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import MenuItem from "@/components/account/ui/MenuItem";
import SignOut from "@/components/account/actions/SignOut";

type AccountDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export default function AccountDropdown({
  open,
  onClose,
}: AccountDropdownProps) {
  const router = useRouter();

  if (!open) return null;

  const go = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
      />

      {/* DROPDOWN */}
      <div
        className={cn(
          "absolute right-0 mt-3 w-64 z-50",
          "rounded-xl border border-white/10",
          "bg-[#0A0C12]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        )}
      >
        {/* ITEMS */}
        <div className="p-2 space-y-1">
          <MenuItem
            label="Account Settings"
            description="Open full settings"
            onClick={() => go("/account")}
          />

          <MenuItem
            label="Profile"
            description="Edit your identity"
            onClick={() => go("/account?tab=profile")}
          />

          <MenuItem
            label="Applications"
            description="Your activity"
            onClick={() => go("/account?tab=applications")}
          />
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 my-1" />

        {/* LOGOUT */}
        <div className="p-2">
          <SignOut
            onSignedOut={() => {
              onClose();
              router.push("/");
            }}
          />
        </div>
      </div>
    </>
  );
}