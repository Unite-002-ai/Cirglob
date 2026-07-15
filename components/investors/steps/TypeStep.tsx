"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  data?: Record<string, any>;
  allData: Record<string, any>;
  onNext: (value?: Record<string, any>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const OPTIONS = [
  {
    value: "angel",
    title: "Angel Investor",
    description: "Personal capital deployed into early-stage startups.",
  },
  {
    value: "vc",
    title: "Venture Capital",
    description: "Institutional or fund-based venture allocation.",
  },
  {
    value: "family_office",
    title: "Family Office",
    description: "Long-term private capital deployment strategy.",
  },
  {
    value: "corporate",
    title: "Corporate / Strategic",
    description: "Strategic investments aligned with corporate vision.",
  },
  {
    value: "operator",
    title: "Operator / Advisor",
    description: "Founders, executives, and strategic advisors investing.",
  },
  {
    value: "other",
    title: "Other",
    description: "Non-traditional or hybrid investment profile.",
  },
];

export default function TypeStep({ data, onNext }: Props) {
  const [selected, setSelected] = useState(data?.investorType || "");

  useEffect(() => {
    setSelected(data?.investorType || "");
  }, [data?.investorType]);

  function select(value: string) {
    setSelected(value);
    onNext({ ...(data || {}), investorType: value });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-3xl"
    >
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Investor Type
        </h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed max-w-xl">
          Define your capital profile. This determines how opportunities are
          structured and matched within the Cirglob network.
        </p>
      </div>

      {/* Options grid */}
      <div className="grid gap-3">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              className={[
                "group relative text-left rounded-xl px-5 py-4 transition-all duration-300",
                "border",
                active
                  ? "border-white/30 bg-white/[0.06]"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
              ].join(" ")}
            >
              {/* subtle glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl" />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className={[
                      "text-sm font-medium tracking-tight",
                      active ? "text-white" : "text-white/80",
                    ].join(" ")}
                  >
                    {opt.title}
                  </span>

                  <div
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-all",
                      active
                        ? "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]"
                        : "bg-white/10",
                    ].join(" ")}
                  />
                </div>

                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-10 border-t border-white/10 pt-6">
        <p className="text-xs text-white/40 leading-relaxed">
          Investor classification is used solely for opportunity matching and
          review structuring within the Cirglob network.
        </p>
      </div>
    </motion.div>
  );
}
