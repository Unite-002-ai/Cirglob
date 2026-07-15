"use client";

import React from "react";
import { motion } from "framer-motion";

import Field from "@/components/investors/ui/Field";

/**
 * AlignmentStep
 * Investor intent + philosophy signal extraction
 *
 * Purpose:
 * - Understand why investor wants Cirglob access
 * - Capture founder preference signal
 * - Filter low-intent / curiosity applicants
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

export const AlignmentStep: React.FC<Props> = ({ data, onNext }) => {
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
          Investment Alignment
        </h2>
        <p className="text-sm text-white/50 leading-relaxed">
          This section helps us understand your investment philosophy and the
          types of founders you naturally align with.
        </p>
      </div>

      {/* Why Cirglob */}
      <Field
        label="Why Cirglob Investor Network?"
        as="textarea"
        value={data?.whyCirglob || ""}
        onChange={(value) =>
          onNext({
            ...(data || {}),
            whyCirglob: value,
          })
        }
        placeholder="Describe what specifically attracts you to structured, curated deal flow..."
        rows={5}
      />

      {/* Founder preference */}
      <Field
        label="What types of founders do you typically invest in?"
        as="textarea"
        value={data?.founderPreference || ""}
        onChange={(value) =>
          onNext({
            ...(data || {}),
            founderPreference: value,
          })
        }
        placeholder="e.g. technical founders, repeat entrepreneurs, deep tech operators..."
        rows={5}
      />

      {/* Optional thesis layer */}
      <Field
        label="Optional: Investment Thesis / Conviction Areas"
        as="textarea"
        value={data?.thesis || ""}
        onChange={(value) =>
          onNext({
            ...(data || {}),
            thesis: value,
          })
        }
        placeholder="e.g. AI infra, climate intelligence, fintech rails, deep SaaS infrastructure..."
        rows={4}
      />

      {/* Subtle evaluation note */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-xs text-white/40 leading-relaxed">
          Alignment responses are used to evaluate investment philosophy
          compatibility and network fit. This is not a scoring guarantee.
        </p>
      </div>
    </motion.div>
  );
};

export default AlignmentStep;
