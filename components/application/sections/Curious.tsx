"use client";

import React, { useEffect, useState } from "react";

type CuriousData = {
  whyCirglob: string;
  helpNeeded: string[];
  source: string;
  referral: string;
  referredBy: string;
  successVision: string;
  extra: string;
};

const STORAGE_KEY = "cirglob-application-draft";

const defaultData: CuriousData = {
  whyCirglob: "",
  helpNeeded: [],
  source: "",
  referral: "",
  referredBy: "",
  successVision: "",
  extra: "",
};

const OPTIONS = [
  "Fundraising",
  "Product",
  "Growth",
  "Hiring",
  "GTM",
  "Network",
  "AI Strategy",
  "Enterprise Sales",
  "Global Expansion",
];

export default function Curious() {
  const [data, setData] = useState<CuriousData>(defaultData);

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.curious) {
        setData(parsed.curious);
      }
    } catch {}
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      const existing = localStorage.getItem(STORAGE_KEY);

      let parsed: any = {};
      try {
        parsed = existing ? JSON.parse(existing) : {};
      } catch {}

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          curious: data,
        })
      );
    }, 400);

    return () => clearTimeout(t);
  }, [data]);

  const toggleOption = (option: string) => {
    setData((prev) => {
      const exists = prev.helpNeeded.includes(option);

      return {
        ...prev,
        helpNeeded: exists
          ? prev.helpNeeded.filter((o) => o !== option)
          : [...prev.helpNeeded, option],
      };
    });
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          Curious & Intent
        </h3>
        <p className="text-sm text-white/50 mt-1">
          Why Cirglob, and what you actually want from us.
        </p>
      </div>

      {/* WHY CIRGLOB */}
      <Field label="Why do you want Cirglob specifically? *">
        <textarea
          className="input min-h-[140px]"
          placeholder="Be precise. Why us, why now, why this program..."
          value={data.whyCirglob}
          onChange={(e) =>
            setData((p) => ({ ...p, whyCirglob: e.target.value }))
          }
        />
      </Field>

      {/* HELP NEEDED */}
      <Field label="What do you want help with most? (max 3)">
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={`px-4 py-3 rounded-xl border text-sm transition text-left ${
                data.helpNeeded.includes(opt)
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="text-xs text-white/40 mt-2">
          Select up to 3 areas where Cirglob adds real leverage.
        </p>
      </Field>

      {/* SOURCE */}
      <Field label="How did you hear about Cirglob?">
        <input
          className="input"
          placeholder="Twitter, founder, investor, referral..."
          value={data.source}
          onChange={(e) =>
            setData((p) => ({ ...p, source: e.target.value }))
          }
        />
      </Field>

      <Field label="Has anyone encouraged you to apply?">
        <select
          className="input"
          value={data.referral}
          onChange={(e) =>
            setData((p) => ({ ...p, referral: e.target.value }))
          }
        >
          <option value="" className="bg-black">
            Select
          </option>
          <option value="yes" className="bg-black">
            Yes
          </option>
          <option value="no" className="bg-black">
            No
          </option>
        </select>
      </Field>

      <Field label="If yes, who?">
        <input
          className="input"
          placeholder="Name / investor / founder..."
          value={data.referredBy}
          onChange={(e) =>
            setData((p) => ({ ...p, referredBy: e.target.value }))
          }
        />
      </Field>

      {/* SUCCESS */}
      <Field label="What does success look like in 12 months?">
        <textarea
          className="input min-h-[140px]"
          placeholder="Revenue, users, funding, product milestones..."
          value={data.successVision}
          onChange={(e) =>
            setData((p) => ({ ...p, successVision: e.target.value }))
          }
        />
      </Field>

      {/* EXTRA */}
      <Field label="Anything else we should know?">
        <textarea
          className="input min-h-[120px]"
          placeholder="Optional..."
          value={data.extra}
          onChange={(e) =>
            setData((p) => ({ ...p, extra: e.target.value }))
          }
        />
      </Field>
    </div>
  );
}

/* UI — SAME SYSTEM AS APPLICATION */

function Field({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="text-sm text-white/60 mb-2 block">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}