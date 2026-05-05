"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  step: number; // current step (1–7)
  totalSteps?: number;
  label?: string;
}

export default function ProgressBar({
  step,
  totalSteps = 7,
  label = "Investor Application",
}: ProgressBarProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full bg-[#05060A] text-white">

      {/* Container */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">

        {/* Top Label Row */}
        <div className="flex items-center justify-between mb-4">

          <div>
            <p className="text-[12px] uppercase tracking-[0.2em] text-gray-500">
              {label}
            </p>

            <h2 className="text-[16px] md:text-[18px] font-medium text-white mt-1">
              Step {step} of {totalSteps}
            </h2>
          </div>

          {/* Optional status indicator */}
          <div className="text-right">
            <p className="text-[12px] text-gray-500">
              Cirglob Investor Network
            </p>
            <p className="text-[12px] text-blue-400 mt-1">
              Private Review System
            </p>
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-[6px] rounded-full bg-white/5 overflow-hidden border border-white/10">

          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-sm" />

          {/* Animated Fill */}
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Glow layer */}
            <div className="absolute inset-0 bg-white/10 blur-sm" />
          </motion.div>
        </div>

        {/* Step markers */}
        <div className="flex justify-between mt-3 px-1">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const index = i + 1;
            const isActive = index <= step;

            return (
              <div
                key={index}
                className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    : "bg-white/10"
                }`}
              />
            );
          })}
        </div>

        {/* Bottom Micro Trust Line */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-gray-500">

          <p>
            High-signal investor verification system
          </p>

          <p className="text-gray-400">
            Tier-based evaluation active
          </p>
        </div>
      </div>
    </div>
  );
}