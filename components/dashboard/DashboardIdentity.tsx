// components/account/identity/DashboardIdentity.tsx

"use client";

import { useRef } from "react";

import IdentityCluster from "@/components/account/identity/IdentityCluster";
import AccountDropdown from "@/components/account/ui/AccountDropdown";
import { useAccountIdentity } from "@/components/account/hooks/useAccountIdentity";

type DashboardIdentityProps = {
  initialUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export default function DashboardIdentity({
  initialUser,
}: DashboardIdentityProps) {
  const {
    user,
    dropdownOpen,
    toggleDropdown,
    closeDropdown,
  } = useAccountIdentity(initialUser);

  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={anchorRef}
      className="flex items-center"
    >
      <IdentityCluster
        name={user?.name || "Account"}
        image={user?.image ?? null}
        open={dropdownOpen}
        onToggle={toggleDropdown}
      />

      <AccountDropdown
        open={dropdownOpen}
        onClose={closeDropdown}
        anchorRef={anchorRef}
      />
    </div>
  );
}