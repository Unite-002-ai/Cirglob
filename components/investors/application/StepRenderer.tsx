"use client";

import type { StepKey, InvestorApplicationData } from "./ApplicationShell";

/**
 * 🧩 STEP IMPORTS
 */
import IdentityStep from "@/components/investors/steps/IdentityStep";
import TypeStep from "@/components/investors/steps/TypeStep";
import ProfileStep from "@/components/investors/steps/ProfileStep";
import ExperienceStep from "@/components/investors/steps/ExperienceStep";
import AlignmentStep from "@/components/investors/steps/AlignmentStep";
import VerificationStep from "@/components/investors/steps/VerificationStep";
import ReviewStep from "@/components/investors/steps/ReviewStep";

/**
 * 📦 PROPS CONTRACT (STRICT)
 */
interface StepRendererProps {
  step: StepKey;
  data?: Record<string, any>;
  allData: InvestorApplicationData;

  onNext: (data?: Record<string, any>) => void;
  onBack: () => void;
  onSubmit: () => void;

  isFirst: boolean;
  isLast: boolean;

  onEdit?: (step: StepKey) => void;
}

/**
 * 🧠 RENDERER
 */
export default function StepRenderer({
  step,
  data,
  allData,
  onNext,
  onBack,
  onSubmit,
  isFirst,
  isLast,
  onEdit,
}: StepRendererProps) {
  const sharedProps = {
    data,
    allData,
    onNext,
    onBack,
    onSubmit,
    isFirst,
    isLast,
  };

  switch (step) {
    case "identity":
      return <IdentityStep {...sharedProps} />;

    case "type":
      return <TypeStep {...sharedProps} />;

    case "profile":
      return <ProfileStep {...sharedProps} />;

    case "experience":
      return <ExperienceStep {...sharedProps} />;

    case "alignment":
      return <AlignmentStep {...sharedProps} />;

    case "verification":
      return <VerificationStep {...sharedProps} />;

    case "review":
      return <ReviewStep {...sharedProps} onEdit={onEdit} />;

    default:
      return (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/40">
          Unknown step
        </div>
      );
  }
}
