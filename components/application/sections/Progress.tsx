"use client";

import { useState } from "react";

type ProgressForm = {
  stage: string;
  timeWorked: string;
  fullTimePercent: string;
  stack: string;

  hasUsers: string;
  activeUsers: string;
  payingUsers: string;
  growth: string;

  hasRevenue: string;
  revenueHistory: string;
  bestCustomer: string;

  proudBuild: string;
  hardestThing: string;

  pivoted: string;
  pivotExplanation: string;
};

const STORAGE_KEY = "cirglob-application-draft";

export default function Progress() {
  const [form, setForm] = useState<ProgressForm>({
    stage: "",
    timeWorked: "",
    fullTimePercent: "",
    stack: "",

    hasUsers: "",
    activeUsers: "",
    payingUsers: "",
    growth: "",

    hasRevenue: "",
    revenueHistory: "",
    bestCustomer: "",

    proudBuild: "",
    hardestThing: "",

    pivoted: "",
    pivotExplanation: "",
  });

  const update = (key: keyof ProgressForm, value: string) => {
    const updated = { ...form, [key]: value };
    setForm(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        progress: updated,
      })
    );
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          4. Progress
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Goal: execution signal.
        </p>
      </div>

      <div className="space-y-8">

        {/* 1 */}
        <Select
          label="1. How far along are you? *"
          value={form.stage}
          onChange={(v) => update("stage", v)}
          options={[
            "Idea stage",
            "MVP built",
            "Beta live",
            "Public launch",
            "Revenue generating",
            "Fast growing",
          ]}
        />

        {/* 2 */}
        <Input
          label="2. How long have you worked on this?"
          value={form.timeWorked}
          onChange={(v) => update("timeWorked", v)}
          placeholder="e.g. 10 months"
        />

        {/* 3 */}
        <Input
          label="3. How much of that full-time?"
          value={form.fullTimePercent}
          onChange={(v) => update("fullTimePercent", v)}
          placeholder="e.g. 70% full-time"
        />

        {/* 4 */}
        <Textarea
          label="4. What stack are you using? (include AI tools/models)"
          value={form.stack}
          onChange={(v) => update("stack", v)}
          placeholder="Next.js, Python, OpenAI GPT-4, LangChain..."
        />

        {/* 5 USERS */}
        <Radio
          label="5. Are users actively using product?"
          value={form.hasUsers}
          onChange={(v) => update("hasUsers", v)}
        />

        {form.hasUsers === "Yes" && (
          <div className="space-y-6">
            <Input
              label="6. Number of active users?"
              value={form.activeUsers}
              onChange={(v) => update("activeUsers", v)}
              placeholder="e.g. 5,000 MAU"
            />

            <Input
              label="7. Number paying?"
              value={form.payingUsers}
              onChange={(v) => update("payingUsers", v)}
              placeholder="e.g. 320"
            />

            <Input
              label="8. Growth last 3 months?"
              value={form.growth}
              onChange={(v) => update("growth", v)}
              placeholder="e.g. 15% MoM"
            />
          </div>
        )}

        {/* 9 REVENUE */}
        <Radio
          label="9. Do you have revenue?"
          value={form.hasRevenue}
          onChange={(v) => update("hasRevenue", v)}
        />

        {form.hasRevenue === "Yes" && (
          <div className="space-y-6">
            <Textarea
              label="10. Monthly revenue last 6 months"
              value={form.revenueHistory}
              onChange={(v) => update("revenueHistory", v)}
              placeholder="Month-by-month breakdown..."
            />

            <Textarea
              label="11. Who pays you most and why?"
              value={form.bestCustomer}
              onChange={(v) => update("bestCustomer", v)}
              placeholder="Describe strongest paying segment..."
            />
          </div>
        )}

        {/* 12 */}
        <Textarea
          label="12. What have you built that you're proud of?"
          value={form.proudBuild}
          onChange={(v) => update("proudBuild", v)}
        />

        {/* 13 */}
        <Textarea
          label="13. What is the hardest thing solved so far?"
          value={form.hardestThing}
          onChange={(v) => update("hardestThing", v)}
        />

        {/* 14 PIVOT */}
        <Radio
          label="14. Have you pivoted before?"
          value={form.pivoted}
          onChange={(v) => update("pivoted", v)}
        />

        {form.pivoted === "Yes" && (
          <Textarea
            label="Explain pivot"
            value={form.pivotExplanation}
            onChange={(v) => update("pivotExplanation", v)}
          />
        )}
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
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function Radio({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm text-white/60">
        {label}
      </label>

      <div className="flex gap-3">
        {["Yes", "No"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-10 rounded-full px-4 text-sm transition ${
              value === opt
                ? "bg-white text-black"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}