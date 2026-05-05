"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type MenuItemProps = {
  label?: string;
  href?: string;
  onClick?: () => void;

  icon?: React.ReactNode;
  description?: string;

  disabled?: boolean;
  danger?: boolean;

  separator?: boolean;

  className?: string;
};

export default function MenuItem({
  label,
  href,
  onClick,
  icon,
  description,
  disabled = false,
  danger = false,
  separator = false,
  className,
}: MenuItemProps) {
  // Divider line item (system separator)
  if (separator) {
    return <div className="my-2 h-px bg-white/10 mx-3" />;
  }

  const base =
    "w-full flex items-center gap-3 px-4 py-2 text-sm transition-all duration-150";

  const state = disabled
    ? "text-white/30 cursor-not-allowed"
    : danger
    ? "text-red-400 hover:bg-red-500/10"
    : "text-white/80 hover:bg-white/10 hover:text-white";

  const content = (
    <div
      className={cn(base, state, className)}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      {/* ICON SLOT (optional system enhancement) */}
      {icon && (
        <span className="flex items-center justify-center w-5 h-5 opacity-80">
          {icon}
        </span>
      )}

      {/* TEXT BLOCK */}
      <div className="flex flex-col leading-tight">
        {label && (
          <span className="text-sm font-medium tracking-tight">
            {label}
          </span>
        )}

        {description && (
          <span className="text-xs text-white/40 mt-0.5">
            {description}
          </span>
        )}
      </div>
    </div>
  );

  // LINK MODE (navigation)
  if (href && !disabled) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  // BUTTON MODE (action)
  return content;
}