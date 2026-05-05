"use client";

import { useEffect, useState } from "react";

type Batch = "Summer 2026" | "Winter 2027" | "Next Available" | "Flexible";
type Style = "In person" | "Hybrid" | "Remote";

interface BatchPreferenceData {
  batch?: Batch;
  relocate?: "Yes" | "No";
  style?: Style;
}

const BATCH_OPTIONS: Batch[] = [
  "Summer 2026",
  "Winter 2027",
  "Next Available",
  "Flexible",
];

const STYLE_OPTIONS: Style[] = ["In person", "Hybrid", "Remote"];

export default function BatchPreference() {
  const [form, setForm] = useState<BatchPreferenceData>({});

  // Load draft
  useEffect(() => {
    const saved = localStorage.getItem("cirglob-application-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(parsed?.batchPreference || {});
      } catch {}
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const saved = localStorage.getItem("cirglob-application-draft");

    let base = {};
    try {
      base = saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn("Corrupt localStorage draft reset:", e);
      base = {};
    }

    const updated = {
      ...base,
      batchPreference: form,
    };

    localStorage.setItem(
      "cirglob-application-draft",
      JSON.stringify(updated)
    );
  }, [form]);

  const update = (key: keyof BatchPreferenceData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          Batch Preference
        </h3>
        <p className="text-sm text-white/50 mt-1">
          Timing, relocation, and program style alignment.
        </p>
      </div>

      {/* BATCH */}
      <Field label="Which batch do you want?">
        <div className="grid grid-cols-2 gap-3">
          {BATCH_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("batch", option)}
              className={`px-4 py-3 rounded-xl border text-sm transition ${
                form.batch === option
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </Field>

      {/* RELOCATION */}
      <Field label="Can you relocate if needed?">
        <div className="flex gap-3">
          {["Yes", "No"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("relocate", option)}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm transition ${
                form.relocate === option
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </Field>

      {/* STYLE */}
      <Field label="Preferred program style">
        <div className="grid grid-cols-3 gap-3">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("style", option)}
              className={`px-4 py-3 rounded-xl border text-sm transition ${
                form.style === option
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </Field>

      {/* NOTE */}
      <p className="text-xs text-white/40 leading-relaxed">
        Cirglob selects founders based on execution speed, ambition, and
        strategic fit. Batch timing reflects readiness and conviction — not
        preference alone.
      </p>
    </div>
  );
}

/* UI (match JobApplication style) */

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