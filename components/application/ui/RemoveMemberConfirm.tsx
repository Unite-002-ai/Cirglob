"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type RemoveMemberConfirmProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function RemoveMemberConfirm({
  open,
  title,
  description,
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  pending = false,
  onConfirm,
  onCancel,
}: RemoveMemberConfirmProps) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="remove-member-confirm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1020] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className="text-base font-semibold tracking-tight text-white">
              {title}
            </h4>

            <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="
                  inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-medium
                  transition-all duration-200 focus:outline-none
                  border-white/10 bg-white/[0.03] text-white/70
                  hover:border-blue-400/20 hover:bg-blue-500/8 hover:text-white
                "
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="
                  inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-medium
                  transition-all duration-200 focus:outline-none
                  border-red-400/20 bg-red-500/15 text-white
                  hover:border-red-400/30 hover:bg-red-500/20
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {pending ? `${confirmLabel}…` : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}