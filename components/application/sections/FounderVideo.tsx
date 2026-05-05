"use client";

import { useRef, useState } from "react";

export default function FounderVideo() {
  const introRef = useRef<HTMLInputElement | null>(null);
  const demoRef = useRef<HTMLInputElement | null>(null);

  const [introFile, setIntroFile] = useState<File | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "intro" | "demo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "intro") setIntroFile(file);
    else setDemoFile(file);
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          2. Founder Video
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Goal: judge clarity, intelligence, energy, and honesty.
        </p>
      </div>

      {/* REQUIRED UPLOAD */}
      <Field label="Required Upload">
        <div className="space-y-3">
          <div className="text-xs text-white/40">
            1-minute founder intro.
          </div>

          <div className="text-xs text-white/40">
            Prompt shown:
            <br />
            Introduce yourselves.
            <br />
            Why this startup?
            <br />
            Why now?
            <br />
            Why you?
          </div>

          <FileInput
            file={introFile}
            inputRef={introRef}
            onClick={() => introRef.current?.click()}
          />

          <input
            ref={introRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFile(e, "intro")}
            className="hidden"
          />
        </div>
      </Field>

      {/* OPTIONAL UPLOAD */}
      <Field label="Optional">
        <div className="space-y-3">
          <div className="text-xs text-white/40">
            Upload product walkthrough (max 3 min).
          </div>

          <FileInput
            file={demoFile}
            inputRef={demoRef}
            onClick={() => demoRef.current?.click()}
          />

          <input
            ref={demoRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFile(e, "demo")}
            className="hidden"
          />
        </div>
      </Field>
    </div>
  );
}

/* ================= UI SYSTEM (MATCH APPLICATION STYLE) ================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/60">{label}</label>
      {children}
    </div>
  );
}

function FileInput({
  file,
  inputRef,
  onClick,
}: {
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={() => {}}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      <div
        onClick={onClick}
        className="input flex cursor-pointer items-center justify-between"
      >
        <span className="text-white/60">
          {file ? file.name : "Upload video"}
        </span>

        <span className="text-xs text-white/40">MP4, MOV</span>
      </div>

      {file && (
        <p className="mt-1 text-xs text-white/40">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      )}
    </div>
  );
}