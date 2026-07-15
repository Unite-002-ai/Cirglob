"use client";

import React from "react";

type MemberActionsDropdownProps = {
  kind: "invite" | "member";
  canCopyLink?: boolean;
  canRemove?: boolean;
  acceptUrl?: string | null;
  copied?: boolean;
  onCopyLink?: () => void;
  onRemove?: () => void;
  removing?: boolean;
};

export default function MemberActionsDropdown({
  kind,
  canCopyLink = false,
  canRemove = false,
  acceptUrl = null,
  copied = false,
  onCopyLink,
  onRemove,
  removing = false,
}: MemberActionsDropdownProps) {
  const showCopy = kind === "invite" && canCopyLink && Boolean(acceptUrl);
  const showRemove = canRemove && Boolean(onRemove);

  if (!showCopy && !showRemove) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1 shadow-none">
      {showCopy ? (
        <button
          type="button"
          onClick={onCopyLink}
          className="
            inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-medium
            text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white
          "
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
      ) : null}

      {showRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="
            inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-medium
            text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      ) : null}
    </div>
  );
}