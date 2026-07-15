"use client";

import {
  createPortal,
} from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import SignOut from "@/components/account/actions/SignOut";

type AccountDropdownProps = {
  open: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLDivElement | null>;
};

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19.4 15a7.8 7.8 0 0 0 .1-1l2-1.2-2-3.4-2.3.6a7.6 7.6 0 0 0-1.7-1l-.3-2.4H11l-.3 2.4a7.6 7.6 0 0 0-1.7 1l-2.3-.6-2 3.4 2 1.2a7.8 7.8 0 0 0 0 2l-2 1.2 2 3.4 2.3-.6c.5.4 1.1.7 1.7 1l.3 2.4h4l.3-2.4c.6-.3 1.2-.6 1.7-1l2.3.6 2-3.4-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MENU_WIDTH = 256;
const VIEWPORT_MARGIN = 8;
const MENU_GAP = 12;

export default function AccountDropdown({
  open,
  onClose,
  anchorRef,
}: AccountDropdownProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (typeof window === "undefined") return;

    const anchor = anchorRef?.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();

    const left = Math.min(
      window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, rect.right - MENU_WIDTH),
    );

    const top = rect.bottom + MENU_GAP;

    setPosition({ top, left });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      if (menuRef.current?.contains(target)) return;
      if (anchorRef?.current?.contains(target)) return;

      onClose();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !mounted || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Account menu"
      className={cn(
        "fixed z-[9999] w-64 rounded-2xl border border-white/10 bg-[#0b1020]/95 p-2 shadow-2xl backdrop-blur-2xl",
        "pointer-events-auto",
      )}
      style={{
        top: position.top,
        left: position.left,
        width: MENU_WIDTH,
      }}
    >
      <div className="space-y-1">
        <Link
          href={`${ROUTES.ACCOUNT}?tab=profile`}
          prefetch
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
            "text-white/75 transition hover:bg-white/5 hover:text-white",
          )}
          role="menuitem"
        >
        <IconSettings />
          Account settings
        </Link>
      </div>

      <div className="my-2 h-px bg-white/10" />

      <SignOut
        onSignedOut={onClose}
        className={cn(
          "justify-start rounded-xl px-3 py-2.5 text-sm",
          "text-white/75 hover:bg-white/5 hover:text-white",
        )}
      />
    </div>,
    document.body,
  );
}