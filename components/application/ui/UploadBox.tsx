"use client";

import React, { useCallback, useRef, useState } from "react";

type UploadBoxProps = {
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  error?: string;
};

export default function UploadBox({
  label,
  description,
  accept = "*",
  multiple = false,
  maxFiles = 5,
  value = [],
  onChange,
  error,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      let newFiles = Array.from(files);

      if (!multiple) {
        newFiles = newFiles.slice(0, 1);
      }

      const merged = multiple
        ? [...value, ...newFiles].slice(0, maxFiles)
        : newFiles;

      onChange?.(merged);
    },
    [multiple, value, onChange, maxFiles]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm text-white/80 font-medium">
            {label}
          </label>

          {description && (
            <span className="text-xs text-white/40">{description}</span>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative cursor-pointer rounded-2xl transition-all duration-300
          bg-white/[0.03]
          border border-white/10
          backdrop-blur-xl
          p-6
          hover:bg-white/[0.05]
          hover:border-white/20
          ${isDragging ? "border-blue-500/40 bg-blue-500/5" : ""}
        `}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity" />

        <div className="relative flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 8v8m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>

          <div className="text-sm text-white/70">
            Drag & drop files here, or click to upload
          </div>

          <div className="text-xs text-white/40">
            {accept === "*"
              ? "Any file type"
              : `Accepted: ${accept.replaceAll(".", "").toUpperCase()}`}
            {multiple && ` • Max ${maxFiles} files`}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2 pt-2">
          {value.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10"
            >
              <div className="flex flex-col">
                <span className="text-sm text-white/80 truncate max-w-[260px]">
                  {file.name}
                </span>
                <span className="text-xs text-white/40">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-xs text-white/40 hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400/80 pl-1">{error}</p>
      )}
    </div>
  );
}