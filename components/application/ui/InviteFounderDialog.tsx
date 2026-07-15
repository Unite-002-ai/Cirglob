"use client";

import React from "react";
import Input from "@/components/application/ui/Input";

type InviteFounderDialogProps = {
  open: boolean;
  email: string;
  pending?: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function InviteFounderDialog({
  open,
  email,
  pending = false,
  onEmailChange,
  onSubmit,
  onClose,
}: InviteFounderDialogProps) {
  if (!open) return null;

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0b1020] p-4 shadow-[0_16px_40px_rgba(0,0,0,.22)] md:p-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white/90">Invite founder</p>
        <p className="text-sm leading-6 text-white/45">
          The invite link is created immediately. Email delivery is sent
          separately when mail settings are available.
        </p>
      </div>

      <Input
        placeholder="Founder email"
        value={email}
        onChange={onEmailChange}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className="
            inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-medium
            transition-colors duration-200 focus:outline-none
            border-white/10 bg-white/[0.04] text-white/80
            hover:border-white/20 hover:bg-white/[0.07] hover:text-white
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {pending ? "Creating…" : "Create invite"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="
            inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-medium
            transition-colors duration-200 focus:outline-none
            border-white/10 bg-white/[0.03] text-white/65
            hover:border-white/20 hover:bg-white/[0.06] hover:text-white
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}