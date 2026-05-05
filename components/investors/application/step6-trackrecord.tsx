"use client";

import React, { useMemo, useState } from "react";

type TrackRecordData = {
  portfolioCount?: number;
  exitsCount?: number;
  notableInvestments?: string;
  currentRole?: string;
  previousCompanies?: string;
  bio?: string;
  investorDeck?: File | null;
  references?: string;
};

type Props = {
  value?: TrackRecordData;
  onChange?: (v: TrackRecordData) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const cx = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function Step6TrackRecord({
  value,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [local, setLocal] = useState<TrackRecordData>(
    value || {
      investorDeck: null,
    }
  );

  const data = value ?? local;

  const setData = (patch: Partial<TrackRecordData>) => {
    const next = { ...data, ...patch };
    setLocal(next);
    onChange?.(next);
  };

  const isValid = useMemo(() => {
    return (
      (data.portfolioCount !== undefined && data.portfolioCount >= 0) ||
      (data.bio?.length || 0) > 10
    );
  }, [data]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.25em] uppercase text-white/40">
            Step 6 • Experience & Reputation
          </p>
          <h1 className="mt-2 text-2xl md:text-3xl font-light text-white">
            Track Record
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-2xl">
            We evaluate capital history, execution quality, and reputation. This
            is a signal layer — not just data.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Portfolio Count */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <label className="text-xs text-white/50">
              Number of Startup Investments
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 12"
              value={data.portfolioCount ?? ""}
              onChange={(e) =>
                setData({ portfolioCount: Number(e.target.value) })
              }
              className="mt-2 w-full bg-transparent outline-none text-white text-lg placeholder:text-white/20"
            />
          </div>

          {/* Exits */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <label className="text-xs text-white/50">
              Number of Exits
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 3"
              value={data.exitsCount ?? ""}
              onChange={(e) =>
                setData({ exitsCount: Number(e.target.value) })
              }
              className="mt-2 w-full bg-transparent outline-none text-white text-lg placeholder:text-white/20"
            />
          </div>

          {/* Current Role */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <label className="text-xs text-white/50">Current Role</label>
            <input
              type="text"
              placeholder="e.g. Managing Partner, Angel Investor"
              value={data.currentRole ?? ""}
              onChange={(e) => setData({ currentRole: e.target.value })}
              className="mt-2 w-full bg-transparent outline-none text-white text-lg placeholder:text-white/20"
            />
          </div>

          {/* Previous Companies */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <label className="text-xs text-white/50">
              Previous Companies
            </label>
            <input
              type="text"
              placeholder="e.g. Goldman Sachs, Sequoia, Stripe"
              value={data.previousCompanies ?? ""}
              onChange={(e) => setData({ previousCompanies: e.target.value })}
              className="mt-2 w-full bg-transparent outline-none text-white text-lg placeholder:text-white/20"
            />
          </div>
        </div>

        {/* NOTABLE INVESTMENTS */}
        <div className="mt-5 p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <label className="text-xs text-white/50">
            Notable Companies Invested In
          </label>
          <textarea
            placeholder="List your most meaningful investments (e.g. Notion, Stripe, Anthropic...)"
            value={data.notableInvestments ?? ""}
            onChange={(e) => setData({ notableInvestments: e.target.value })}
            className="mt-2 w-full min-h-[90px] bg-transparent outline-none text-white text-lg placeholder:text-white/20 resize-none"
          />
        </div>

        {/* BIO */}
        <div className="mt-5 p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          <label className="text-xs text-white/50">
            Short Professional Bio
          </label>
          <textarea
            placeholder="Describe your investing background, thesis, and operator experience..."
            value={data.bio ?? ""}
            onChange={(e) => setData({ bio: e.target.value })}
            className="mt-2 w-full min-h-[120px] bg-transparent outline-none text-white text-lg placeholder:text-white/20 resize-none"
          />
        </div>

        {/* UPLOAD + REFERENCES */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Investor Deck */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <label className="text-xs text-white/50">
              Upload Investor Deck (optional)
            </label>

            <div className="mt-3 border border-dashed border-white/20 rounded-xl p-5 text-center">
              <input
                type="file"
                className="hidden"
                id="deckUpload"
                onChange={(e) =>
                  setData({ investorDeck: e.target.files?.[0] || null })
                }
              />
              <label
                htmlFor="deckUpload"
                className="cursor-pointer text-sm text-white/70 hover:text-white transition"
              >
                {data.investorDeck
                  ? data.investorDeck.name
                  : "Click to upload PDF / Deck"}
              </label>
            </div>
          </div>

          {/* References */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <label className="text-xs text-white/50">
              References / Verification Links
            </label>
            <textarea
              placeholder="LinkedIn references, introductions, or verification notes..."
              value={data.references ?? ""}
              onChange={(e) => setData({ references: e.target.value })}
              className="mt-2 w-full min-h-[110px] bg-transparent outline-none text-white text-lg placeholder:text-white/20 resize-none"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-5 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {!isValid && (
              <p className="text-xs text-white/40">
                Complete key fields to continue
              </p>
            )}

            <button
              onClick={onNext}
              disabled={!isValid}
              className={cx(
                "px-6 py-3 rounded-xl font-medium transition",
                isValid
                  ? "bg-gradient-to-r from-white/90 to-white text-black hover:opacity-90"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              )}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}