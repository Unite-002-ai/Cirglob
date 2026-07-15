"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { browserSignOut } from "@/lib/supabase/client";
import { clearAccountState } from "@/lib/account-user";
import { DEFAULT_SIGNOUT_REDIRECT, SUCCESS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useOptionalAccountProvider } from "@/providers/account-provider";

type SignOutProps = {
  onSignedOut?: () => void;
  className?: string;
  label?: string;
};

function IconLogout() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 7V5.8A2.8 2.8 0 0 1 12.8 3h4.4A2.8 2.8 0 0 1 20 5.8v12.4A2.8 2.8 0 0 1 17.2 21h-4.4A2.8 2.8 0 0 1 10 18.2V17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 12H4m0 0 3-3m-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SignOut({
  onSignedOut,
  className,
  label = "Sign out",
}: SignOutProps) {
  const router = useRouter();
  const provider = useOptionalAccountProvider();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await browserSignOut();
    } catch (error) {
      console.error("[Cirglob] SignOut failed:", error);
    } finally {
      try {
        provider?.clearAccount();
      } catch {
        // non-fatal
      }

      clearAccountState();
      onSignedOut?.();

      router.replace(DEFAULT_SIGNOUT_REDIRECT);
      setIsSigningOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors",
        "text-red-400 hover:bg-red-500/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-label={label}
      title={label}
    >
      <IconLogout />
      <span>{isSigningOut ? SUCCESS.SIGNED_OUT : label}</span>
    </button>
  );
}