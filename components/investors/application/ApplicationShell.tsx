"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import StepRenderer from "@/components/investors/application/StepRenderer";
import StepSidebar from "@/components/investors/application/StepSidebar";

/**
 * 🔢 STEP ORDER (single source of truth)
 */
export const STEPS = [
  "identity",
  "type",
  "profile",
  "experience",
  "alignment",
  "verification",
  "review",
] as const;

export type StepKey = (typeof STEPS)[number];

/**
 * 🧠 GLOBAL APPLICATION DATA SHAPE
 */
export interface InvestorApplicationData {
  identity?: Record<string, any>;
  type?: Record<string, any>;
  profile?: Record<string, any>;
  experience?: Record<string, any>;
  alignment?: Record<string, any>;
  verification?: Record<string, any>;
  review?: Record<string, any>;
}

const STEP_LABELS: Record<StepKey, string> = {
  identity: "Identity",
  type: "Investor Type",
  profile: "Investment Profile",
  experience: "Experience",
  alignment: "Alignment",
  verification: "Verification",
  review: "Review",
};

/**
 * 🚀 MAIN SHELL
 */
export default function ApplicationShell() {
  const router = useRouter();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<InvestorApplicationData>({});

  const steps = useMemo(
    () =>
      STEPS.map((key) => ({
        key,
        label: STEP_LABELS[key],
      })),
    []
  );

  const currentStep = STEPS[currentStepIndex];
  const currentStepData = data[currentStep];

  const saveCurrentStep = (stepData?: Record<string, any>) => {
    if (stepData) {
      setData((prev) => ({
        ...prev,
        [currentStep]: stepData,
      }));
    }
  };

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (step: StepKey) => {
    const index = STEPS.indexOf(step);
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  };

  const handleSubmit = () => {
    console.log("Investor Application Submitted:", data);
    router.push("/investors/submitted");
  };

  const isLast = currentStepIndex === STEPS.length - 1;
  const isFirst = currentStepIndex === 0;

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#05060A] text-white">
      {/* SIDEBAR */}
      <aside className="hidden w-[340px] shrink-0 border-r border-white/5 bg-white/[0.02] lg:block">
        <div className="h-full min-h-0 px-5 py-6">
          <StepSidebar
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden px-6 py-8 md:px-10">


        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <StepRenderer
              step={currentStep}
              data={currentStepData}
              allData={data}
              onNext={saveCurrentStep}
              onBack={goBack}
              onSubmit={handleSubmit}
              isFirst={isFirst}
              isLast={isLast}
              onEdit={goToStep}
            />
          </div>
        </div>

        <div className="mt-6 flex shrink-0 items-center justify-between text-xs text-white/30">
          <div>
            {!isFirst && (
              <button
                type="button"
                onClick={goBack}
                className="transition-colors hover:text-white"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isLast ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-white px-4 py-2 text-black transition-colors hover:bg-white/90"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
