"use client";

import React from "react";
import { motion } from "framer-motion";

import Field from "@/components/investors/ui/Field";
import Select from "@/components/investors/ui/Select";
import MultiSelect from "@/components/investors/ui/MultiSelect";

/**
 * ProfileStep
 * Investor profile + capital preferences
 *
 * Purpose:
 * - Understand investment capacity + focus areas
 * - Maintain minimal cognitive load
 * - Extract high-signal allocation data
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

const STAGE_OPTIONS = [
  { label: "Pre-Seed", value: "pre_seed" },
  { label: "Seed", value: "seed" },
  { label: "Series A", value: "series_a" },
  { label: "Series B+", value: "series_b_plus" },
  { label: "Growth / Late Stage", value: "growth" },
];

const CHECK_SIZE_OPTIONS = [
  { label: "$10K – $50K", value: "10k_50k" },
  { label: "$50K – $250K", value: "50k_250k" },
  { label: "$250K – $1M", value: "250k_1m" },
  { label: "$1M – $5M", value: "1m_5m" },
  { label: "$5M+", value: "5m_plus" },
];

const GEOGRAPHY_OPTIONS = [
  { label: "North America", value: "north_america" },
  { label: "Europe", value: "europe" },
  { label: "Middle East", value: "middle_east" },
  { label: "Asia", value: "asia" },
  { label: "Global (No Preference)", value: "global" },
];

const SECTOR_OPTIONS = [
  { label: "AI / ML", value: "ai_ml" },
  { label: "Fintech", value: "fintech" },
  { label: "SaaS", value: "saas" },
  { label: "HealthTech", value: "healthtech" },
  { label: "Climate / Energy", value: "climate" },
  { label: "Web3 / Crypto", value: "web3" },
  { label: "Consumer Tech", value: "consumer" },
];

export const ProfileStep: React.FC<Props> = ({ data, onNext }) => {
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
          Investment Profile
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          Define your allocation preferences. This helps Cirglob match you with
          relevant, high-signal opportunities.
        </p>
      </div>

      {/* Check Size */}
      <Field label="Typical Check Size">
        <Select
          value={data?.checkSize}
          options={CHECK_SIZE_OPTIONS}
          placeholder="Select range"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              checkSize: value,
            })
          }
        />
      </Field>

      {/* Stage Preference */}
      <Field label="Preferred Stage">
        <Select
          value={data?.stage}
          options={STAGE_OPTIONS}
          placeholder="Select stage"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              stage: value,
            })
          }
        />
      </Field>

      {/* Geography */}
      <Field label="Geographic Focus">
        <Select
          value={data?.geography}
          options={GEOGRAPHY_OPTIONS}
          placeholder="Select region"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              geography: value,
            })
          }
        />
      </Field>

      {/* Sectors */}
      <Field label="Sector Focus">
        <MultiSelect
          value={data?.sectors || []}
          options={SECTOR_OPTIONS}
          placeholder="Select sectors"
          onChange={(value) =>
            onNext({
              ...(data || {}),
              sectors: value,
            })
          }
        />
      </Field>

      {/* Subtle divider note */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-xs text-white/40 leading-relaxed">
          This profile is used strictly for matching purposes. It does not
          guarantee allocation or deal flow.
        </p>
      </div>
    </motion.div>
  );
};

export default ProfileStep;
