"use client";

import React, { useMemo, useState } from "react";

type AlignmentData = {
  whyCirglob?: string;
  founderType?: string;
  mentoring?: boolean;
  standards?: {
    respectfulConduct?: boolean;
    confidentiality?: boolean;
    ethicalInvesting?: boolean;
    longTermMindset?: boolean;
    noPredatoryBehavior?: boolean;
  };
};

type Props = {
  value?: AlignmentData;
  onChange?: (v: AlignmentData) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

export default function Step7Alignment({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [local, setLocal] = useState<AlignmentData>(
    value || {
      standards: {
        respectfulConduct: false,
        confidentiality: false,
        ethicalInvesting: false,
        longTermMindset: false,
        noPredatoryBehavior: false,
      },
      mentoring: false,
    }
  );

  const data = value ?? local;

  const setData = (patch: Partial<AlignmentData>) => {
    const next = { ...data, ...patch };
    setLocal(next);
    onChange?.(next);
  };

  const setStandard = (key: keyof NonNullable<AlignmentData["standards"]>) => {
    const updated = {
      ...(data.standards || {}),
      [key]: !(data.standards as any)?.[key],
    };

    setData({
      standards: updated,
    });
  };

  const isComplete = useMemo(() => {
    const s = data.standards || {};
    return (
      !!data.whyCirglob &&
      data.whyCirglob.length > 15 &&
      Object.values(s).every(Boolean)
    );
  }, [data]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.25em] uppercase text-white/40">
            Step 7 • Alignment
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-light text-white">
            Why Cirglob
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-2xl">
            Alignment defines whether capital becomes strategic or purely
            transactional. This is the final filter of network quality.
          </p>
        </div>

        {/* WHY CIRGLOB */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <label className="text-xs text-white/50">
            Why do you want to join the Cirglob Investor Network?
          </label>
          <textarea
            value={data.whyCirglob || ""}
            onChange={(e) => setData({ whyCirglob: e.target.value })}
            placeholder="Explain your motivation, investment philosophy, and long-term intent..."
            className="mt-3 w-full min-h-[140px] bg-transparent outline-none text-white text-lg placeholder:text-white/20 resize-none"
          />
        </div>

        {/* FOUNDER TYPE */}
        <div className="mt-5 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <label className="text-xs text-white/50">
            What kind of founders do you back best?
          </label>
          <input
            value={data.founderType || ""}
            onChange={(e) => setData({ founderType: e.target.value })}
            placeholder="e.g. technical founders, early-stage deep tech teams..."
            className="mt-3 w-full bg-transparent outline-none text-white text-lg placeholder:text-white/20"
          />
        </div>

        {/* MENTORING */}
        <div className="mt-5 p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Mentorship Participation</p>
            <p className="text-xs text-white/40 mt-1">
              Are you open to actively mentoring founders?
            </p>
          </div>

          <button
            onClick={() => setData({ mentoring: !data.mentoring })}
            className={cx(
              "px-4 py-2 rounded-xl border text-sm transition",
              data.mentoring
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/70 border-white/20 hover:border-white/40"
            )}
          >
            {data.mentoring ? "Yes" : "No"}
          </button>
        </div>

        {/* STANDARDS */}
        <div className="mt-6">
          <p className="text-xs text-white/50 mb-3 tracking-[0.2em] uppercase">
            Cirglob Network Standards
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                key: "respectfulConduct",
                label: "Respectful Conduct",
              },
              {
                key: "confidentiality",
                label: "Confidentiality",
              },
              {
                key: "ethicalInvesting",
                label: "Ethical Investing",
              },
              {
                key: "longTermMindset",
                label: "Long-Term Mindset",
              },
              {
                key: "noPredatoryBehavior",
                label: "No Predatory Behavior",
              },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStandard(item.key as any)}
                className={cx(
                  "p-4 rounded-2xl border text-left transition backdrop-blur-xl",
                  (data.standards as any)?.[item.key]
                    ? "bg-white text-black border-white"
                    : "bg-white/[0.03] text-white/70 border-white/10 hover:border-white/30"
                )}
              >
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs mt-1 opacity-70">
                  Required for network admission
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* REVIEW NOTE */}
        <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02]">
          <p className="text-xs text-white/50">
            Final Evaluation Layer
          </p>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">
            This step directly impacts your Cirglob investor scorecard:
            alignment, reputation, and long-term network trust. Missing
            standards typically result in waitlist classification.
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

          <div className="flex items-center gap-3">
            {!isComplete && (
              <p className="text-xs text-white/40">
                Complete alignment + standards
              </p>
            )}

            <button
              onClick={onNext}
              disabled={!isComplete}
              className={cx(
                "px-6 py-3 rounded-xl font-medium transition",
                isComplete
                  ? "bg-gradient-to-r from-white/90 to-white text-black hover:opacity-90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              Review Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}