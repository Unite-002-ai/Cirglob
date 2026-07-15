"use client";

import { motion } from "framer-motion";
import type { StepKey } from "./ApplicationShell";

type SidebarStep = {
  key: StepKey;
  label: string;
};

type StepSidebarProps = {
  steps: SidebarStep[];
  currentStep: StepKey;
  onStepClick: (step: StepKey) => void;
};

/**
 * 🎯 MINIMAL SIDEBAR (FAQ STYLE)
 */
export default function StepSidebar({
  steps,
  currentStep,
  onStepClick,
}: StepSidebarProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <aside className="flex h-full min-h-0 flex-col px-4 py-6">
      {/* Step list */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className="space-y-2">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = index < currentIndex;

            return (
              <button
                key={step.key}
                onClick={() => onStepClick(step.key)}
                className="relative w-full text-left px-4 py-3 rounded-xl transition"
              >
                {/* Active background + indicator */}
                {isActive && (
                  <>
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-white/[0.06] border border-white/10 rounded-xl"
                    />
                    <motion.div
                      layoutId="active-line"
                      className="absolute left-0 top-2 bottom-2 w-[2px] bg-white rounded-full"
                    />
                  </>
                )}

                <span
                  className={`relative z-10 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white"
                      : isCompleted
                      ? "text-white/70"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
