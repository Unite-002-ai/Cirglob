"use client";

import React from "react";

type Props = {
  data?: Record<string, any>;
  allData: Record<string, any>;
  onNext: (value?: Record<string, any>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  onEdit?: (step: string) => void;
};

export default function ReviewStep({ data, allData, onEdit }: Props) {
  const application = allData || data || {};

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
          Review Application
        </h2>

        <p className="mt-3 text-sm text-white/50 max-w-xl leading-relaxed">
          Confirm your details before submitting your application to the Cirglob Investor Network.
        </p>
      </div>

      {/* Review Container */}
      <div className="w-full max-w-3xl space-y-6">
        <Section title="Identity" onEdit={() => onEdit?.("identity")}>
          <Row label="Full Name" value={application.identity?.fullName} />
          <Row label="Email" value={application.identity?.email} />
          <Row label="Phone" value={application.identity?.phone} />
          <Row label="Country" value={application.identity?.country} />
          <Row label="LinkedIn" value={application.identity?.linkedin} />
          <Row
            label="Firm / Individual"
            value={application.identity?.entityType || application.identity?.type}
          />
        </Section>

        <Section title="Investor Type" onEdit={() => onEdit?.("type")}>
          <Row label="Type" value={application.type?.investorType || application.type} />
        </Section>

        <Section title="Investment Profile" onEdit={() => onEdit?.("profile")}>
          <Row label="Check Size" value={application.profile?.checkSize} />
          <Row label="Stage Preference" value={application.profile?.stage} />
          <Row label="Geography" value={application.profile?.geography?.join(", ")} />
          <Row label="Sectors" value={application.profile?.sectors?.join(", ")} />
        </Section>

        <Section title="Experience" onEdit={() => onEdit?.("experience")}>
          <Row
            label="Number of Investments"
            value={application.experience?.investmentCount || application.experience?.investments}
          />
          <Row
            label="Notable Companies"
            value={application.experience?.notableInvestments || application.experience?.companies?.join(", ")}
          />
          <Row label="Current Role" value={application.experience?.currentPosition || application.experience?.role} />
          <Row label="Bio" value={application.experience?.bio} />
        </Section>

        <Section title="Alignment" onEdit={() => onEdit?.("alignment")}>
          <Row label="Why Cirglob" value={application.alignment?.whyCirglob || application.alignment?.why} />
          <Row
            label="Founder Profile Interest"
            value={application.alignment?.founderPreference || application.alignment?.founders}
          />
        </Section>

        <Section title="Verification" onEdit={() => onEdit?.("verification")}>
          <Row
            label="Accuracy Confirmed"
            value={application.verification?.accuracyConfirmed ? "Yes" : "No"}
          />
          <Row
            label="Terms Accepted"
            value={application.verification?.termsAccepted ? "Yes" : "No"}
          />
          <Row
            label="No Guarantees Accepted"
            value={application.verification?.noGuaranteesAccepted ? "Yes" : "No"}
          />
          <Row
            label="Consent to Contact"
            value={application.verification?.contactConsent ? "Yes" : "No"}
          />
        </Section>
      </div>

      {/* Footer Note */}
      <div className="mt-12 max-w-3xl">
        <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-xs text-white/40 leading-relaxed">
            By submitting this application, you acknowledge that Cirglob
            operates a selective investor admission process. Submission does
            not guarantee access, allocation, or participation in any
            opportunity.
          </p>
        </div>

        <div className="mt-6 text-xs text-white/30">
          Please ensure all information is accurate before submission.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SUB COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="text-sm text-white font-medium tracking-tight">
          {title}
        </h3>

        <button
          onClick={onEdit}
          className="text-xs text-white/40 hover:text-white transition"
        >
          Edit
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-xs text-white/40 w-1/3">{label}</span>

      <span className="text-xs text-white/80 w-2/3 text-right break-words">
        {value || "—"}
      </span>
    </div>
  );
}
