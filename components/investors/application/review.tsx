"use client";

import React from "react";

type Props = {
  data: any;
  onSubmit?: () => void;
  onBack?: () => void;
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
    <p className="text-xs tracking-[0.2em] uppercase text-white/40 mb-3">
      {title}
    </p>
    <div className="text-white/80 text-sm space-y-1">{children}</div>
  </div>
);

export default function Review({ data, onSubmit, onBack }: Props) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] uppercase text-white/40">
            Final Step • Review
          </p>
          <h1 className="mt-2 text-3xl font-light text-white">
            Application Review
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-2xl">
            This is the final consolidated view of your investor profile.
            Cirglob evaluates consistency across capital, network, and
            alignment signals.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Section title="Profile">
            <div>Full Name: {data?.fullName || "—"}</div>
            <div>Email: {data?.email || "—"}</div>
            <div>Phone: {data?.phone || "—"}</div>
            <div>
              Location: {data?.city || "—"}, {data?.country || "—"}
            </div>
          </Section>

          <Section title="Investor Type">
            <div>Type: {data?.investorType || "—"}</div>
            <div>Entity: {data?.entityName || "—"}</div>
          </Section>

          <Section title="Capital Profile">
            <div>Check Size: {data?.checkSize || "—"}</div>
            <div>Annual Deployment: {data?.annualDeployment || "—"}</div>
            <div>Follow-On: {data?.followOn || "—"}</div>
            <div>Stages: {(data?.stages || []).join(", ") || "—"}</div>
          </Section>

          <Section title="Sector Focus">
            <div>Sectors: {(data?.sectors || []).join(", ") || "—"}</div>
            <div>
              Operating Sectors:{" "}
              {(data?.operatingSectors || []).join(", ") || "—"}
            </div>
          </Section>

          <Section title="Network Value">
            <div>
              Value Add: {(data?.valueAdd || []).join(", ") || "—"}
            </div>
            <div>Geography: {(data?.geographies || []).join(", ") || "—"}</div>
          </Section>

          <Section title="Experience">
            <div>Portfolio Count: {data?.portfolioCount || "—"}</div>
            <div>Exits: {data?.exitsCount || "—"}</div>
            <div>
              Notable Investments: {data?.notableInvestments || "—"}
            </div>
            <div>Role: {data?.currentRole || "—"}</div>
          </Section>

          <div className="md:col-span-2">
            <Section title="Alignment">
              <div className="whitespace-pre-wrap">
                {data?.whyCirglob || "—"}
              </div>
              <div className="mt-2 text-white/60">
                Mentoring: {data?.mentoring ? "Yes" : "No"}
              </div>
            </Section>
          </div>
        </div>

        {/* SCORE PREVIEW */}
        <div className="mt-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02]">
          <p className="text-xs tracking-[0.2em] uppercase text-white/40">
            Cirglob Evaluation Layer
          </p>
          <p className="mt-2 text-sm text-white/60">
            Capital Strength • Network Strength • Sector Relevance • Reputation
            • Value Add • Long-Term Alignment
          </p>
          <p className="mt-2 text-xs text-white/40">
            Final classification: Elite Approved / Approved / Waitlist / Reject
          </p>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-5 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition"
          >
            Back
          </button>

          <button
            onClick={onSubmit}
            className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-white/90 to-white text-black hover:opacity-90 transition"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}