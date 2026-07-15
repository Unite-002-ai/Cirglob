"use client";

import { cn } from "@/lib/utils";
import Avatar from "@/components/account/ui/Avatar";

export type IdentityClusterProps = {
  name?: string;
  email?: string | null;
  image?: string | null;
  loading?: boolean;
  open?: boolean;
  onToggle?: () => void;
  className?: string;
  showEmail?: boolean;
};

export default function IdentityCluster({
  name,
  image,
  loading = false,
  open = false,
  onToggle,
  className,
}: IdentityClusterProps) {
  const displayName = name?.trim() || "";

  return (
    <button
      type="button"
      onClick={() => onToggle?.()}
      aria-haspopup="menu"
      aria-expanded={open ? "true" : "false"}
      aria-label={displayName ? `${displayName} menu` : "Profile menu"}
      aria-busy={loading}
      className={cn(
        "flex items-center gap-3 rounded-full px-2 py-1 transition-all",
        "hover:bg-white/5 active:scale-[0.99]",
        "focus:outline-none focus:ring-1 focus:ring-white/10",
        className,
      )}
    >
      <Avatar src={image ?? null} name={displayName} size={32} />

      <div className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
        <span className="max-w-[180px] truncate text-sm font-medium text-white/80">
          {displayName}
        </span>
      </div>

      <span
        className={cn(
          "ml-1 text-xs text-white/40 transition-transform duration-200",
          open && "rotate-180",
        )}
        aria-hidden="true"
      >
        ▾
      </span>
    </button>
  );
} 
    



