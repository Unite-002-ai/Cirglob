"use client";

import React from "react";

type VerificationState = {
  termsAccepted: boolean;
  accuracyConfirmed: boolean;
  noGuaranteesAccepted: boolean;
  contactConsent: boolean;
};

type Props = {
  data?: Record<string, any>;
  allData: Record<string, any>;
  onNext: (value?: Record<string, any>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export default function VerificationStep({ data, onNext }: Props) {
  const value: VerificationState = {
    termsAccepted: Boolean(data?.termsAccepted),
    accuracyConfirmed: Boolean(data?.accuracyConfirmed),
    noGuaranteesAccepted: Boolean(data?.noGuaranteesAccepted),
    contactConsent: Boolean(data?.contactConsent),
  };

  const update = (key: keyof VerificationState, newValue: boolean) => {
    onNext({
      ...value,
      [key]: newValue,
    });
  };

  const canProceed =
    value.termsAccepted &&
    value.accuracyConfirmed &&
    value.noGuaranteesAccepted &&
    value.contactConsent;

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
          Verification
        </h2>

        <p className="mt-3 text-sm text-white/50 max-w-xl leading-relaxed">
          This step ensures alignment with Cirglob’s investor standards. All confirmations are required
          to continue.
        </p>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-2xl space-y-4">
        <VerificationItem
          title="Information Accuracy"
          description="I confirm that all provided information is accurate and complete."
          checked={value.accuracyConfirmed}
          onChange={(v) => update("accuracyConfirmed", v)}
        />

        <VerificationItem
          title="Terms Acknowledgment"
          description="I understand this application does not guarantee acceptance into the network."
          checked={value.termsAccepted}
          onChange={(v) => update("termsAccepted", v)}
        />

        <VerificationItem
          title="No Guarantees"
          description="I acknowledge that Cirglob does not guarantee deal flow, access, or allocation."
          checked={value.noGuaranteesAccepted}
          onChange={(v) => update("noGuaranteesAccepted", v)}
        />

        <VerificationItem
          title="Consent to Contact"
          description="I consent to being contacted regarding my application and potential next steps."
          checked={value.contactConsent}
          onChange={(v) => update("contactConsent", v)}
        />
      </div>

      {/* Subtle Legal Note */}
      <div className="mt-10 text-xs text-white/30 max-w-xl leading-relaxed">
        Cirglob maintains a selective investor network. Submission of an application does not constitute
        membership, allocation rights, or investment eligibility.
      </div>

      {/* Status Indicator (optional UX clarity) */}
      <div className="mt-8 flex items-center gap-2 text-xs">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            canProceed ? "bg-emerald-400" : "bg-white/20"
          }`}
        />
        <span className="text-white/40">
          {canProceed ? "Verification complete" : "All confirmations required"}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SUB COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function VerificationItem({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`
        group flex items-start gap-4 p-5 rounded-xl cursor-pointer
        border border-white/10
        bg-white/[0.02]
        hover:bg-white/[0.04]
        transition-all duration-300
      `}
    >
      <div className="mt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="hidden"
        />

        <div
          className={`
            w-5 h-5 rounded-md border transition-all duration-300
            flex items-center justify-center
            ${
              checked
                ? "bg-white text-black border-white"
                : "border-white/30 group-hover:border-white/60"
            }
          `}
        >
          {checked && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-white text-sm font-medium tracking-tight">
          {title}
        </span>

        <span className="text-white/40 text-sm mt-1 leading-relaxed">
          {description}
        </span>
      </div>
    </label>
  );
}
