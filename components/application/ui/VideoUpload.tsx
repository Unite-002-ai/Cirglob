"use client";

import React, { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

type VideoUploadProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  file: File | null;
  fileName?: string | null;
  preview: string | null;
  onClick: () => void;
  onPick: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  label?: string;
  emptyLabel?: string;
  accept?: string;
  limitText?: string;
  error?: string | null;
  checking?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
  uploaded?: boolean;
  canRemove?: boolean;
  variant?: "company" | "founder";
};

export default function VideoUpload({
  inputRef,
  file,
  fileName,
  preview,
  onClick,
  onPick,
  onRemove,
  label,
  emptyLabel,
  accept = "video/*",
  limitText,
  error,
  checking,
  uploading,
  uploadProgress = 0,
  uploaded = false,
  canRemove = true,
  variant = "company",
}: VideoUploadProps) {
  const isFounder = variant === "founder";
  const triggerLabel = emptyLabel ?? label ?? "Upload video";
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const hasPreview = Boolean(preview);
  const isActiveUpload = Boolean(file) || hasPreview || uploading || uploaded;

  const displayName = useMemo(() => {
    if (file?.name) return file.name;
    if (fileName && fileName.trim().length > 0) return fileName;
    if (uploaded) return "Saved video";
    return null;
  }, [file?.name, fileName, uploaded]);

  const displaySize = useMemo(() => {
    if (!file) return null;
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [file]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setConfirmOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <div className="space-y-3">
      {!isActiveUpload ? (
        <button
          type="button"
          onClick={onClick}
          className={`
            flex w-full cursor-pointer items-center justify-between rounded-2xl
            border border-white/10 bg-white/[0.03] px-4 py-3 text-left
            transition-all duration-200 hover:border-cyan-400/20 hover:bg-cyan-500/8
          `}
        >
          <span className="text-sm text-white/65">{triggerLabel}</span>
          <span className="text-xs text-white/40">MP4, MOV</span>
        </button>
      ) : (
        <div
          className={
            isFounder
              ? "rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              : "rounded-2xl border border-white/10 bg-white/5 p-3"
          }
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-white">
                {displayName ?? "Video"}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {displaySize ?? (uploaded ? "Saved" : "Preparing")}
              </p>
            </div>

            <div ref={menuRef} className="relative flex shrink-0 gap-2">
              <button
                type="button"
                onClick={onClick}
                className="
                  inline-flex h-8 items-center justify-center rounded-full border
                  border-cyan-400/25 bg-cyan-500/15 px-4 text-xs font-medium
                  text-white transition-all duration-200 hover:bg-cyan-500/20
                "
              >
                Replace
              </button>

              {uploading ? (
                <button
                  type="button"
                  onClick={onRemove}
                  className="
                    inline-flex h-8 items-center justify-center rounded-full border
                    border-white/10 bg-white/[0.03] px-3 text-xs font-medium
                    text-white/75 transition-all duration-200
                    hover:border-white/15 hover:bg-white/10 hover:text-white
                  "
                  aria-label="Cancel upload"
                  title="Cancel upload"
                >
                  ×
                </button>
              ) : canRemove ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen((value) => !value);
                      setConfirmOpen(false);
                    }}
                    className="
                      inline-flex h-8 items-center justify-center rounded-full border
                      border-white/10 bg-white/[0.03] px-3 text-xs font-medium
                      text-white/75 transition-all duration-200
                      hover:border-white/15 hover:bg-white/10 hover:text-white
                    "
                    aria-label="Video options"
                    title="Video options"
                  >
                    ⋯
                  </button>

                  {menuOpen ? (
                    <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#09101f] shadow-2xl shadow-black/30">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmOpen(true);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
                      >
                        Remove video
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          {preview ? (
            <video
              src={preview}
              controls
              className={
                isFounder
                  ? "max-h-[360px] w-full rounded-xl border border-white/10 bg-black"
                  : "max-h-[360px] w-full rounded-xl bg-black"
              }
            />
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-white/40">
              Video preview will appear here.
            </div>
          )}

          {uploading ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/45">
                <span>Uploading…</span>
                <span>{Math.min(100, Math.max(0, uploadProgress))}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onPick}
        className="hidden"
      />

      {limitText || checking || error ? (
        <div className="space-y-1">
          {limitText ? <p className="text-xs text-white/40">{limitText}</p> : null}
          {checking ? (
            <p className="text-xs text-white/40">Checking video...</p>
          ) : null}
          {error ? <p className="text-xs text-red-400/80">{error}</p> : null}
        </div>
      ) : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#08101d] p-6 shadow-2xl shadow-black/40">
            <h4 className="text-lg font-semibold text-white">Remove video?</h4>
            <p className="mt-2 text-sm leading-6 text-white/55">
              This will permanently delete the uploaded video from Cirglob
              storage and remove it from the database.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/75 transition hover:bg-white/8 hover:text-white"
              >
                Keep video
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  onRemove();
                }}
                className="rounded-full border border-red-500/25 bg-red-500/15 px-4 py-2 text-sm text-red-100 transition hover:bg-red-500/20"
              >
                Remove video
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}