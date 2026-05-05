"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type DropdownItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  separator?: boolean;
  disabled?: boolean;
};

type DropdownProps = {
  open: boolean;
  onClose: () => void;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
};

export default function Dropdown({
  open,
  onClose,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // Close on ESC (premium UX expectation)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-3 w-64 z-50",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {/* PANEL */}
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-[#0A0B10]/95 backdrop-blur-xl",
          "shadow-[0_10px_40px_rgba(0,0,0,0.45)] overflow-hidden"
        )}
      >
        {/* MENU ITEMS */}
        <div className="py-2">
          {items.map((item, idx) => {
            if (item.separator) {
              return (
                <div
                  key={idx}
                  className="my-2 h-px bg-white/10 mx-3"
                />
              );
            }

            const baseStyle =
              "w-full flex items-center px-4 py-2 text-sm transition-colors";

            const stateStyle = item.disabled
              ? "text-white/30 cursor-not-allowed"
              : item.danger
              ? "text-red-400 hover:bg-red-500/10"
              : "text-white/80 hover:bg-white/10 hover:text-white";

            const content = (
              <button
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick?.();
                  onClose();
                }}
                className={cn(baseStyle, stateStyle)}
              >
                {item.label}
              </button>
            );

            return <div key={idx}>{content}</div>;
          })}
        </div>
      </div>

      {/* subtle glow layer (luxury SaaS detail) */}
      <div className="absolute inset-0 -z-10 blur-2xl opacity-20 bg-blue-500/20 rounded-xl" />
    </div>
  );
}