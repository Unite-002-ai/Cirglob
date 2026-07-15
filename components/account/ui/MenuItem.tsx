"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type MenuItemProps = {
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function MenuItem({
  label,
  description,
  href,
  onClick,
  disabled = false,
  className,
}: MenuItemProps) {
  const content = (
    <div className="flex flex-col items-start gap-0.5">
      <span>{label}</span>
      {description ? (
        <span className="text-xs text-white/40">{description}</span>
      ) : null}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={cn(
          "flex w-full items-center rounded-lg px-4 py-2 text-sm transition",
          "text-white/80 hover:bg-white/10 hover:text-white",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      disabled={disabled}
      className={cn(
        "flex w-full items-center rounded-lg px-4 py-2 text-sm transition",
        disabled
          ? "cursor-not-allowed text-white/30"
          : "cursor-pointer text-white/80 hover:bg-white/10 hover:text-white",
        className,
      )}
    >
      {content}
    </button>
  );
}
