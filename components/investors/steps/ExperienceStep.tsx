"use client";

import React from "react";
import { motion } from "framer-motion";

import Field from "@/components/investors/ui/Field";
import Select from "@/components/investors/ui/Select";
import MultiSelect from "@/components/investors/ui/MultiSelect";

/**
 * ExperienceStep
 * Investor credibility + history signal layer
 *
 * Purpose:
 * - Measure real investing experience
 * - Identify capital maturity level
 * - Extract soft signal (operator vs passive investor)
 */

type Props = {
  data?: Record<string, any>;
  allData: Record<string, any>;
  onNext: (value?: Record<string, any>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const INVESTMENT_COUNT_OPTIONS = [
  { label: "0 (First-time investor)", value: "0" },
  { label: "1–5 investments", value: "1_5" },
  { label: "6–20 investments", value: "6_20" },
  { label: "20–50 investments", value: "20_50" },
  { label: "50+ investments", value: "50_plus" },
];

const ROLE_OPTIONS = [
  { label: "Founder / Operator", value: "founder_operator" },
  { label: "Venture Capital Partner", value: "vc_partner" },
  { label: "Angel Investor", value: "angel" },
  { label: "Family Office Member", value: "family_office" },
  { label: "Corporate Executive", value: "corporate_exec" },
  { label: "Independent Investor", value: "independent" },
];

const NOTABLE_COMPANY_OPTIONS = [
  { label: "Early-stage startups", value: "early_startups" },
  { label: "Growth-stage companies", value: "growth_stage" },
  { label: "Public companies", value: "public" },
  { label: "Unicorn-backed companies", value: "unicorns" },
  { label: "Sector-leading enterprises", value: "enterprise" },
];

export const ExperienceStep: React.FC<Props> = ({ data, onNext }) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto space-y-10 text-white"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-medium tracking-tight text-white">
          Investment Experience
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          This helps us understand your exposure to startup ecosystems and
          capital allocation history.
        </p>
      </div>

      {/* Investment Count */}
      <Field label="Total Investments">
        <Select
          value={data?.investmentCount}
          options={INVESTMENT_COUNT_OPTIONS}
          placeholder="Select range"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              investmentCount: value,
            })
          }
        />
      </Field>

      {/* Role */}
      <Field label="Primary Role">
        <Select
          value={data?.role}
          options={ROLE_OPTIONS}
          placeholder="Select your role"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              role: value,
            })
          }
        />
      </Field>

      {/* Experience Domain */}
      <Field label="Investment Exposure">
        <MultiSelect
          value={data?.exposure || []}
          options={NOTABLE_COMPANY_OPTIONS}
          placeholder="Select exposure type"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              exposure: value,
            })
          }
        />
      </Field>

      {/* Optional Context */}
      <Field
        label="Notable Investments (Optional)"
        value={data?.notableInvestments || ""}
        onChange={(value) =>
          onNext({
            ...(data || {}),
            notableInvestments: value,
          })
        }
        placeholder="e.g. Stripe, Notion, early-stage AI startups..."
      />

      {/* Current Position */}
      <Field
        label="Current Position"
        value={data?.currentPosition || ""}
        onChange={(value) =>
          onNext({
            ...(data || {}),
            currentPosition: value,
          })
        }
        placeholder="e.g. Partner at VC firm, Founder, Managing Director..."
      />

      {/* Subtle signal footer */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-xs text-white/40 leading-relaxed">
          Experience data is used for qualification scoring and allocation
          prioritization. It does not guarantee access or deal flow.
        </p>
      </div>
    </motion.div>
  );
};

export default ExperienceStep;
