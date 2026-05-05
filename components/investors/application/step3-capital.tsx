"use client";

import React from "react";

type Props = {
  data: any;
  update: (key: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
};

const Option = ({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-3 rounded-xl border text-sm transition text-left
        ${
          active
            ? "border-blue-500/40 bg-blue-500/10 text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-white"
        }
      `}
    >
      {label}
    </button>
  );
};

const SectionTitle = ({ title, desc }: any) => (
  <div className="space-y-2">
    <h3 className="text-sm uppercase tracking-widest text-zinc-400">
      {title}
    </h3>
    <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
  </div>
);

export default function Step3Capital({
  data,
  update,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl space-y-10">

        {/* HEADER */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
            Investment Capacity
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            Capital profile determines investor tiering, allocation priority,
            and access to Cirglob’s highest-quality founder pipeline.
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* CHECK SIZE */}
        <div className="space-y-4">
          <SectionTitle
            title="Typical Initial Check Size"
            desc="Defines entry-level investment capacity per deal."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "$10k–25k",
              "$25k–100k",
              "$100k–250k",
              "$250k–1M",
              "$1M+",
            ].map((opt) => (
              <Option
                key={opt}
                label={opt}
                active={data.checkSize === opt}
                onClick={() => update("checkSize", opt)}
              />
            ))}
          </div>
        </div>

        {/* ANNUAL DEPLOYMENT */}
        <div className="space-y-4">
          <SectionTitle
            title="Annual Deployment Capacity"
            desc="Total capital deployable per year across all investments."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["<$250k", "$250k–1M", "$1M–5M", "$5M+"].map((opt) => (
              <Option
                key={opt}
                label={opt}
                active={data.annualDeployment === opt}
                onClick={() => update("annualDeployment", opt)}
              />
            ))}
          </div>
        </div>

        {/* FOLLOW-ON */}
        <div className="space-y-4">
          <SectionTitle
            title="Follow-On Capability"
            desc="Ability to support portfolio companies in subsequent rounds."
          />

          <div className="grid grid-cols-3 gap-3">
            {["Yes", "No", "Selective"].map((opt) => (
              <Option
                key={opt}
                label={opt}
                active={data.followOn === opt}
                onClick={() => update("followOn", opt)}
              />
            ))}
          </div>
        </div>

        {/* STAGE PREFERENCE */}
        <div className="space-y-4">
          <SectionTitle
            title="Preferred Investment Stage"
            desc="Select all stages where you actively invest."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Pre-Seed",
              "Seed",
              "Series A",
              "Growth",
              "Flexible",
            ].map((opt) => {
              const selected = data.stages || [];
              return (
                <Option
                  key={opt}
                  label={opt}
                  active={selected.includes(opt)}
                  onClick={() => {
                    const exists = selected.includes(opt);
                    const updated = exists
                      ? selected.filter((x: string) => x !== opt)
                      : [...selected, opt];

                    update("stages", updated);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* STRATEGIC SIGNAL BOX */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Capital Intelligence Layer
          </p>

          <p className="text-sm text-zinc-300 leading-relaxed">
            This data is used to calculate the <span className="text-white">Capital Strength Score</span>,
            which directly impacts investor tiering (Tier A / Tier B / Waitlist / Reject)
            and founder matching priority inside Cirglob.
          </p>
        </div>

        {/* NAVIGATION */}
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
              px-6 py-2.5 rounded-xl font-medium text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-500 hover:to-indigo-500
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