"use client";

import React from "react";

type Props = {
  data: any;
  update: (key: string, value: any) => void;
  onNext: () => void;
  onBack?: () => void;
};

const Input = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs tracking-wider uppercase text-zinc-400">
        {label}
      </label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-4 py-3
          rounded-xl
          bg-zinc-950/60
          border border-zinc-800
          text-white
          placeholder:text-zinc-600
          outline-none
          focus:border-blue-500/40
          focus:ring-1 focus:ring-blue-500/20
          transition
        "
      />
    </div>
  );
};

export default function Step1Identity({ data, update, onNext, onBack }: Props) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl space-y-10">

        {/* HEADER */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
            Identity & Contact
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            This step is used to verify investor credibility and ensure Cirglob maintains
            a high-trust capital network. All data is treated with strict confidentiality.
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Input
            label="Full Legal Name"
            value={data.fullName}
            onChange={(v) => update("fullName", v)}
            placeholder="John Alexander Smith"
          />

          <Input
            label="Preferred Name"
            value={data.preferredName}
            onChange={(v) => update("preferredName", v)}
            placeholder="John Smith"
          />

          <Input
            label="Email Address"
            value={data.email}
            onChange={(v) => update("email", v)}
            placeholder="john@domain.com"
          />

          <Input
            label="Mobile Number"
            value={data.phone}
            onChange={(v) => update("phone", v)}
            placeholder="+1 (555) 000-0000"
          />

          <Input
            label="Country of Residence"
            value={data.country}
            onChange={(v) => update("country", v)}
            placeholder="United States"
          />

          <Input
            label="City"
            value={data.city}
            onChange={(v) => update("city", v)}
            placeholder="New York"
          />

          <Input
            label="LinkedIn"
            value={data.linkedin}
            onChange={(v) => update("linkedin", v)}
            placeholder="https://linkedin.com/in/..."
          />

          <Input
            label="Personal Website (Optional)"
            value={data.website}
            onChange={(v) => update("website", v)}
            placeholder="https://..."
          />
        </div>

        {/* TRUST NOTICE */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Verification Standard
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Cirglob applies institutional-grade review standards. Submissions are assessed
            for capital credibility, professional reputation, and long-term alignment with founders.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          >
            Back
          </button>

          <button
            onClick={onNext}
            className="
              px-6 py-2.5 rounded-xl
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-500 hover:to-indigo-500
              text-white font-medium
              shadow-[0_0_40px_rgba(59,130,246,0.25)]
              transition
            "
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}