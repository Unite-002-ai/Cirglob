"use client";

import React from "react";

type Props = {
  data: any;
  update: (key: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
};

const types = [
  { id: "angel", label: "Angel Investor", desc: "Personal capital deployment" },
  { id: "vc", label: "Venture Capital Fund", desc: "Institutional venture fund" },
  { id: "family", label: "Family Office", desc: "Private wealth management capital" },
  { id: "corp", label: "Corporate Venture Arm", desc: "Strategic corporate investing" },
  { id: "private", label: "Private Investment Firm", desc: "Multi-strategy capital firm" },
  { id: "operator", label: "Founder / Operator Investor", desc: "Founder-led investing" },
  { id: "institutional", label: "Institutional Capital", desc: "Pension / endowment / large-scale capital" },
  { id: "other", label: "Other", desc: "Specialized structure" },
];

function Card({
  active,
  label,
  desc,
  onClick,
}: {
  active?: boolean;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        text-left p-5 rounded-2xl border transition-all duration-300
        ${
          active
            ? "border-blue-500/40 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/70"
        }
      `}
    >
      <div className="text-white text-sm font-medium">{label}</div>
      <div className="text-xs text-zinc-400 mt-1">{desc}</div>
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-4 py-3 rounded-xl
          bg-zinc-950/60 border border-zinc-800
          text-white placeholder:text-zinc-600
          focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20
          outline-none transition
        "
      />
    </div>
  );
}

export default function Step2Type({ data, update, onNext, onBack }: Props) {
  const selected = data.investorType;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl space-y-10">

        {/* HEADER */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
            Investor Classification
          </h2>

          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Define how you deploy capital. This classification determines review
            priority, network routing, and value-add scoring within the Cirglob system.
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* GRID OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((t) => (
            <Card
              key={t.id}
              label={t.label}
              desc={t.desc}
              active={selected === t.id}
              onClick={() => update("investorType", t.id)}
            />
          ))}
        </div>

        {/* CONDITIONAL SECTION */}
        <div className="space-y-6 pt-4">

          {selected === "vc" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Fund Name"
                value={data.fundName}
                onChange={(v: any) => update("fundName", v)}
                placeholder="Cirglob Capital Partners"
              />
              <Input
                label="Fund Website"
                value={data.fundWebsite}
                onChange={(v: any) => update("fundWebsite", v)}
                placeholder="https://..."
              />
              <Input
                label="AUM Range (Optional)"
                value={data.aum}
                onChange={(v: any) => update("aum", v)}
                placeholder="$100M - $500M"
              />
            </div>
          )}

          {selected === "family" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Family Office Name (Optional)"
                value={data.familyOffice}
                onChange={(v: any) => update("familyOffice", v)}
                placeholder="Smith Family Office"
              />
              <Input
                label="Estimated AUM (Optional)"
                value={data.aum}
                onChange={(v: any) => update("aum", v)}
                placeholder="$500M+"
              />
            </div>
          )}

          {selected === "angel" && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Investment Style"
                value={data.angelStyle}
                onChange={(v: any) => update("angelStyle", v)}
                placeholder="Solo / Syndicate / SPV"
              />
              <Input
                label="Typical Check Size"
                value={data.checkSize}
                onChange={(v: any) => update("checkSize", v)}
                placeholder="$25k - $250k"
              />
            </div>
          )}
        </div>

        {/* TRUST SIGNAL */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Classification Impact
          </p>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Investor classification directly impacts Cirglob’s internal scoring system,
            including access tiering, founder match priority, and network introductions.
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
            disabled={!selected}
            className={`
              px-6 py-2.5 rounded-xl font-medium transition
              ${
                selected
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:from-blue-500 hover:to-indigo-500"
                  : "bg-zinc-900 text-zinc-600 cursor-not-allowed"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}