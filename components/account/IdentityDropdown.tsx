"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import MenuItem from "@/components/account/ui/MenuItem";
import SignOut from "@/components/account/actions/SignOut";

type IdentityDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export default function IdentityDropdown({
  open,
  onClose,
}: IdentityDropdownProps) {
  const router = useRouter();

  if (!open) return null;

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
      />

      <div
        className={cn(
          "absolute right-0 mt-3 w-72 z-50",
          "rounded-2xl border border-white/10",
          "bg-[#0A0C12]/95 backdrop-blur-xl shadow-2xl",
          "overflow-hidden"
        )}
      >
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm text-white/80 font-medium">Account</p>
          <p className="text-xs text-white/40">Manage your Cirglob identity</p>
        </div>

        <div className="p-2 space-y-1">
          <MenuItem
            label="Account Settings"
            description="Open your settings home"
            onClick={() => handleNavigate("/account")}
          />

          <MenuItem
            label="Profile"
            description="Avatar, name, bio"
            onClick={() => handleNavigate("/account?tab=profile")}
          />

          <MenuItem
            label="Security"
            description="Password and sessions"
            onClick={() => handleNavigate("/account?tab=security")}
          />

          <MenuItem
            label="Applications"
            description="Drafts and submissions"
            onClick={() => handleNavigate("/account?tab=applications")}
          />

          <MenuItem
            label="Help Center"
            description="Docs and support"
            onClick={() => handleNavigate("/faq")}
          />
        </div>

        <div className="border-t border-white/10 my-1" />

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