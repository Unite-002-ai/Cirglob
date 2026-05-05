"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

type Props = {
  value?: string[];
  geographies?: string[];
  note?: string;
  onChange?: (data: {
    valueAdd: string[];
    geographies: string[];
    note: string;
  }) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const VALUE_ADD = [
  "Enterprise customer introductions",
  "Hiring / executive recruiting",
  "Fundraising introductions",
  "Media / PR reach",
  "Distribution channels",
  "Regulatory expertise",
  "Technical guidance",
  "Global market expansion",
  "Manufacturing / supply chain",
  "M&A relationships",
  "Strategic partnerships",
];

const GEOGRAPHIES = [
  "United States",
  "Europe",
  "Gulf / MENA",
  "Africa",
  "Asia",
  "Latin America",
  "Global",
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
        px-4 py-2 rounded-full text-sm font-medium
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

export default function Step5Network({
  value = [],
  geographies = [],
  note = "",
  onChange,
  onNext,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<string[]>(value);
  const [geo, setGeo] = useState<string[]>(geographies);
  const [text, setText] = useState(note);

  const toggleValue = (item: string) => {
    const updated = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];

    setSelected(updated);

    onChange?.({
      valueAdd: updated,
      geographies: geo,
      note: text,
    });
  };

  const toggleGeo = (item: string) => {
    const updated = geo.includes(item)
      ? geo.filter((i) => i !== item)
      : [...geo, item];

    setGeo(updated);

    onChange?.({
      valueAdd: selected,
      geographies: updated,
      note: text,
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
            Network & Strategic Value
          </h2>

          <p className="text-white/60 mt-2 leading-relaxed">
            Capital is not enough. Cirglob evaluates{" "}
            <span className="text-amber-300">
              distribution power, access, and real-world leverage.
            </span>
          </p>

          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <p className="text-sm text-white/70">
              Investors are ranked higher when they can directly impact startup
              growth through{" "}
              <span className="text-white">
                customers, capital access, hiring, or global expansion.
              </span>
            </p>
          </div>
        </motion.div>

        {/* VALUE ADD SECTION */}
        <div className="mb-12">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
            How You Create Value Beyond Capital
          </h3>

          <div className="flex flex-wrap gap-3">
            {VALUE_ADD.map((item) => (
              <Chip
                key={item}
                label={item}
                active={selected.includes(item)}
                onClick={() => toggleValue(item)}
              />
            ))}
          </div>

          <p className="text-xs text-white/40 mt-3">
            Select all forms of strategic leverage you can provide to founders.
          </p>
        </div>

        {/* GEOGRAPHY SECTION */}
        <div className="mb-12">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
            Relationship Geography
          </h3>

          <div className="flex flex-wrap gap-3">
            {GEOGRAPHIES.map((item) => (
              <Chip
                key={item}
                label={item}
                active={geo.includes(item)}
                onClick={() => toggleGeo(item)}
              />
            ))}
          </div>

          <p className="text-xs text-white/40 mt-3">
            Where your strongest founder or enterprise relationships exist.
          </p>
        </div>

        {/* STRATEGIC SIGNAL TEXT AREA */}
        <div className="mb-12">
          <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
            Network Intelligence (High Signal)
          </h3>

          <div className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onChange?.({
                  valueAdd: selected,
                  geographies: geo,
                  note: e.target.value,
                });
              }}
              placeholder="Describe your strongest network advantage. Example: Fortune 500 CIO network across healthcare + fintech executives in GCC..."
              className="w-full h-28 bg-transparent outline-none text-white/80 placeholder:text-white/30 resize-none"
            />
          </div>

          <p className="text-xs text-white/40 mt-3">
            This is heavily weighted in Tier A selection scoring.
          </p>
        </div>

        {/* INSIGHT PANEL */}
        <div className="mb-10 p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-blue-500/5">
          <h4 className="text-sm font-medium text-white mb-2">
            Cirglob Evaluation Logic
          </h4>
          <p className="text-sm text-white/60 leading-relaxed">
            Investors with high-value network distribution capability are
            prioritized over capital-only investors.
            <br />
            <span className="text-amber-300">
              (This is a core Tier A filter dimension)
            </span>
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