"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SignOutProps = {
  onSignedOut?: () => void;
  className?: string;
  label?: string;
};

export default function SignOut({
  onSignedOut,
  className,
  label = "Sign out",
}: SignOutProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cirglob_session");
        localStorage.removeItem("cirglob_user");
      }

      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {
        // Best-effort server signout; continue redirect either way.
      });

      onSignedOut?.();
      window.location.href = "/";
    } catch (error) {
      console.error("SignOut failed, forcing redirect:", error);
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "w-full flex items-center px-4 py-2 text-sm transition-colors",
        "text-red-400 hover:bg-red-500/10",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isSigningOut ? "Signing out..." : label}
    </button>
  );
}