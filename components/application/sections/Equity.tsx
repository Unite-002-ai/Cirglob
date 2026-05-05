"use client";

import React, { useEffect, useState } from "react";

type EquityData = {
  hasEntity: string;
  entityDetails: string;
  ownership: string;

  raisedBefore: string;
  investors: string;
  totalRaised: string;

  cashInBank: string;
  monthlyBurn: string;
  runway: string;

  fundraising: string;
  currentRound: string;

  debt: string;
};

const STORAGE_KEY = "cirglob-application-draft";

const defaultData: EquityData = {
  hasEntity: "",
  entityDetails: "",
  ownership: "",

  raisedBefore: "",
  investors: "",
  totalRaised: "",

  cashInBank: "",
  monthlyBurn: "",
  runway: "",

  fundraising: "",
  currentRound: "",

  debt: "",
};

export default function Equity() {
  const [data, setData] = useState<EquityData>(defaultData);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.equity) setData(parsed.equity);
    } catch {}
  }, []);

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
          equity: data,
        })
      );
    }, 300);

    return () => clearTimeout(t);
  }, [data]);

  const update = (key: keyof EquityData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          6. Equity
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Goal: ownership clarity + fundraising intelligence.
        </p>
      </div>

      <div className="space-y-8">

        {/* 1 */}
        <Select
          label="1. Have you formed a legal entity?"
          value={data.hasEntity}
          onChange={(v) => update("hasEntity", v)}
          options={["Yes", "No"]}
        />

        {data.hasEntity === "Yes" && (
          <Textarea
            label="2. What entity and where formed?"
            value={data.entityDetails}
            onChange={(v) => update("entityDetails", v)}
            placeholder="e.g. Delaware C-Corp, USA"
          />
        )}

        {/* 3 */}
        <Textarea
          label="3. Equity ownership breakdown (founders + employees + others)"
          value={data.ownership}
          onChange={(v) => update("ownership", v)}
          placeholder="Founder 1: 60%, Founder 2: 40%..."
        />

        {/* 4 */}
        <Select
          label="4. Have you raised money before?"
          value={data.raisedBefore}
          onChange={(v) => update("raisedBefore", v)}
          options={["Yes", "No"]}
        />

        {data.raisedBefore === "Yes" && (
          <>
            <Textarea
              label="5. List investors, amount, date, instrument"
              value={data.investors}
              onChange={(v) => update("investors", v)}
              placeholder="Angel - $50K - SAFE - Jan 2025..."
            />

            <Input
              label="6. Total money raised?"
              value={data.totalRaised}
              onChange={(v) => update("totalRaised", v)}
              placeholder="e.g. $250K"
            />
          </>
        )}

        {/* 7-9 */}
        <Grid>
          <Input
            label="7. Cash in bank?"
            value={data.cashInBank}
            onChange={(v) => update("cashInBank", v)}
            placeholder="e.g. $120K"
          />

          <Input
            label="8. Monthly burn?"
            value={data.monthlyBurn}
            onChange={(v) => update("monthlyBurn", v)}
            placeholder="e.g. $15K/month"
          />
        </Grid>

        <Input
          label="9. Runway remaining?"
          value={data.runway}
          onChange={(v) => update("runway", v)}
          placeholder="e.g. 8 months"
        />

        {/* 10 */}
        <Select
          label="10. Currently fundraising?"
          value={data.fundraising}
          onChange={(v) => update("fundraising", v)}
          options={["Yes", "No"]}
        />

        {data.fundraising === "Yes" && (
          <Textarea
            label="11. Details of current round"
            value={data.currentRound}
            onChange={(v) => update("currentRound", v)}
            placeholder="SAFE, valuation, target raise..."
          />
        )}

        {/* 12 */}
        <Textarea
          label="12. Any SAFEs / notes / debt outstanding?"
          value={data.debt}
          onChange={(v) => update("debt", v)}
          placeholder="Convertible notes, loans, SAFEs..."
        />

      </div>
    </div>
  );
}

/* ================= UI ================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/60">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/60">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input min-h-[140px]"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/60">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}