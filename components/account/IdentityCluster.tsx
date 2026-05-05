"use client";

import Avatar from "@/components/account/ui/Avatar";
import { cn } from "@/lib/utils";

type IdentityClusterProps = {
  name: string;
  email?: string;
  image?: string | null;
  open: boolean;
  onToggle: () => void;
};

export default function IdentityCluster({
  name,
  email,
  image,
  open,
  onToggle,
}: IdentityClusterProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 px-2 py-1 rounded-full transition-all",
        "hover:bg-white/5 active:scale-[0.99]",
        "focus:outline-none focus:ring-1 focus:ring-white/10"
      )}
    >
      {/* AVATAR (IDENTITY ANCHOR) */}
      <Avatar src={image} name={name} size={32} />

      {/* TEXTUAL IDENTITY (DESKTOP ONLY CONTEXT) */}
      <div className="hidden sm:flex flex-col items-start leading-tight">
        <span className="text-sm font-medium text-white/80">
          {name}
        </span>

        {email && (
          <span className="text-[11px] text-white/40">
            {email}
          </span>
        )}
      </div>

      {/* SYSTEM INDICATOR */}
      <span className="text-white/40 text-xs ml-1">
        ▾
      </span>
    </button>
  );
}