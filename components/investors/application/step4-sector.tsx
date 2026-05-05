"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

type Props = {
  value?: string[];
  operatingSectors?: string[];
  onChange?: (data: {
    sectors: string[];
    operatingSectors: string[];
  }) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const SECTORS = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Fintech",
  "SaaS",
  "HealthTech",
  "Biotech",
  "Climate",
  "Consumer",
  "Creator Economy",
  "Robotics",
  "Deep Tech",
  "Defense Tech",
  "Logistics",
  "Education",
  "Web Infrastructure",
  "Emerging Markets",
  "Real Estate Tech",
  "Other",
];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-300 border
        ${
          active
            ? "bg-gradient-to-r from-amber-500/20 to-blue-500/10 border-amber-400/40 text-white shadow-[0_0_25px_rgba(251,191,36,0.15)]"
            : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/10"
        }
      `}
    >
      <div className="flex items-center gap-2">
        {active && <Check size={14} className="text-amber-300" />}
        {label}
      </div>
    </button>
  );
}

export default function Step4Sector({
  value = [],
  operatingSectors = [],
  onChange,
  onNext,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<string[]>(value);
  const [operating, setOperating] = useState<string[]>(operatingSectors);

  const toggle = (sector: string) => {
    let updated = selected.includes(sector)
      ? selected.filter((s) => s !== sector)
      : [...selected, sector];

    setSelected(updated);

    onChange?.({
      sectors: updated,
      operatingSectors: operating,
    });
  };

  const toggleOperating = (sector: string) => {
    let updated = operating.includes(sector)
      ? operating.filter((s) => s !== sector)
      : [...operating, sector];

    setOperating(updated);

    onChange?.({
      sectors: selected,
      operatingSectors: updated,
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
            Sector Intelligence
          </h2>

          <p className="text-white/60 mt-2 leading-relaxed">
            Where can you create the most strategic value — beyond capital?
          </p>

          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-sm text-white/70 leading-relaxed">
              Cirglob evaluates investors not just on money — but on{" "}
              <span className="text-amber-300">
                sector intelligence, pattern recognition, and real operator
                relevance.
              </span>
            </p>
          </div>
        </motion.div>

        {/* SECTION 1 */}
        <div className="mb-10">
          <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">
            Primary Investment Sectors
          </h3>

          <div className="flex flex-wrap gap-3">
            {SECTORS.map((sector) => (
              <Chip
                key={sector}
                label={sector}
                active={selected.includes(sector)}
                onClick={() => toggle(sector)}
              />
            ))}
          </div>

          <p className="text-xs text-white/40 mt-3">
            Select all sectors where you actively invest or have conviction.
          </p>
        </div>

        {/* SECTION 2 */}
        <div className="mb-12">
          <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4">
            Operating Relationships (High Signal)
          </h3>

          <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent mb-4">
            <p className="text-sm text-white/60 leading-relaxed">
              Which sectors do you have{" "}
              <span className="text-white">
                direct access, networks, or operating influence in?
              </span>
              <br />
              (Founders care more about this than capital size.)
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {SECTORS.map((sector) => (
              <Chip
                key={"op-" + sector}
                label={sector}
                active={operating.includes(sector)}
                onClick={() => toggleOperating(sector)}
              />
            ))}
          </div>
        </div>

        {/* INSIGHT PANEL */}
        <div className="mb-10 p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-blue-500/5">
          <h4 className="text-sm font-medium text-white mb-2">
            Cirglob Insight Filter
          </h4>
          <p className="text-sm text-white/60 leading-relaxed">
            Investors with strong operating-sector overlap are prioritized in
            Tier A allocation due to higher founder impact probability.
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <button
            onClick={onBack}
            className="px-5 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            Back
          </button>

          <button
            onClick={onNext}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-medium hover:opacity-90 transition shadow-[0_0_30px_rgba(251,191,36,0.25)]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}