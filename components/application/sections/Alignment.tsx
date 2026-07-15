'use client';

import React, { useEffect, useMemo, useState } from "react";
import Radio from "../ui/Radio";
import Textarea from "../ui/Textarea";
import Field from "../ui/Field";


type AlignmentData = {
  whyCirglob: string;
  helpNeeded: string[];
  relationship: string;
};

const STORAGE_KEY = "cirglob-application-draft";

const defaultData: AlignmentData = {
  whyCirglob: "",
  helpNeeded: [],
  relationship: "",
};

const OPTIONS = [
  "Fundraising",
  "Strategic Partnerships",
  "AI Infrastructure",
  "Go-to-Market",
  "Enterprise Access",
  "Growth",
  "Recruiting",
  "Global Expansion",
  "Regulatory / Compliance",
  "Technical Architecture",
] as const;

const MAX_HELP_SELECTED = 3;
const WHY_MAX = 700;

function isAlignmentOption(value: string): value is (typeof OPTIONS)[number] {
  return OPTIONS.includes(value as (typeof OPTIONS)[number]);
}

function normalizeAlignmentDraft(value: unknown): AlignmentData {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const whyCirglob =
    typeof raw.whyCirglob === "string" ? raw.whyCirglob : defaultData.whyCirglob;

  const relationship =
    typeof raw.relationship === "string"
      ? raw.relationship
      : defaultData.relationship;

  const helpNeeded = Array.isArray(raw.helpNeeded)
    ? raw.helpNeeded
        .filter((item): item is string => typeof item === "string")
        .filter(isAlignmentOption)
        .slice(0, MAX_HELP_SELECTED)
    : defaultData.helpNeeded;

  return {
    whyCirglob,
    helpNeeded,
    relationship,
  };
}

function readAlignmentDraft(): AlignmentData {
  if (typeof window === "undefined") return defaultData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;

    const parsed = JSON.parse(raw);
    return normalizeAlignmentDraft(parsed?.alignment);
  } catch {
    return defaultData;
  }
}

function writeAlignmentDraft(data: AlignmentData): void {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const existing =
      existingRaw && existingRaw.trim().length > 0
        ? (JSON.parse(existingRaw) as Record<string, unknown>)
        : {};

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...existing,
        alignment: {
          whyCirglob: data.whyCirglob,
          helpNeeded: data.helpNeeded.filter(isAlignmentOption).slice(0, MAX_HELP_SELECTED),
          relationship: data.relationship,
        },
      })
    );
  } catch {
    // Ignore storage failures.
  }
}

export default function Alignment() {
  const [data, setData] = useState<AlignmentData>(defaultData);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setData(readAlignmentDraft());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    const t = window.setTimeout(() => {
      writeAlignmentDraft(data);
    }, 400);

    return () => window.clearTimeout(t);
  }, [data, hasLoaded]);

  const selectedCount = data.helpNeeded.length;

  const helpText = useMemo(() => {
    if (selectedCount > MAX_HELP_SELECTED) {
      return `Over limit by ${selectedCount - MAX_HELP_SELECTED}.`;
    }
    if (selectedCount === MAX_HELP_SELECTED) {
      return `You’ve selected ${MAX_HELP_SELECTED} of ${MAX_HELP_SELECTED} areas.`;
    }
    return `${selectedCount} of ${MAX_HELP_SELECTED} selected.`;
  }, [selectedCount]);

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium tracking-tight text-white">
            7. Alignment
          </h3>
          <p className="mt-1 text-sm text-white/50">
            Understand strategic alignment, ecosystem fit, and how Cirglob could
            meaningfully support the company’s growth.
          </p>
        </div>
      </div>

      <Field
        label="Why Cirglob specifically? *"
        description="Explain why Cirglob is strategically relevant to your company at this stage."
      >
        <Textarea
          placeholder="Why this ecosystem, why now, and what kind of long-term leverage or partnership are you seeking?"
          value={data.whyCirglob}
          maxLength={WHY_MAX}
          onChange={(v) =>
            setData((p) => ({ ...p, whyCirglob: v }))
          }
        />
        <LimitCounter value={data.whyCirglob.length} max={WHY_MAX} />
      </Field>

      <Field
        label="Where could Cirglob most meaningfully accelerate the company? (Select up to 3)"
        description="Select the areas where strategic support from Cirglob would have the greatest impact."
      >
        <Radio
          multiple
          options={OPTIONS.map((opt) => ({
            label: opt,
            value: opt,
          }))}
          selectedValues={data.helpNeeded}
          onMultiChange={(values) =>
            setData((prev) => ({
              ...prev,
              helpNeeded: values.filter(isAlignmentOption).slice(0, MAX_HELP_SELECTED),
            }))
          }
          optionsClassName="grid grid-cols-2 gap-3"
          isOptionDisabled={(_opt, selected) =>
            data.helpNeeded.length >= MAX_HELP_SELECTED && !selected
          }
        />

        <p
          className={`mt-2 text-xs ${
            selectedCount > MAX_HELP_SELECTED ? "text-red-400" : "text-white/40"
          }`}
        >
          {helpText}
        </p>
      </Field>
    </div>
  );
}

function LimitCounter({ value, max }: { value: number; max: number }) {
  const overLimit = value > max;

  return (
    <div
      className={`mt-2 text-right text-xs ${
        overLimit ? "text-red-400" : "text-white/40"
      }`}
    >
      {overLimit ? `${value}/${max} — over by ${value - max}` : `${value}/${max}`}
    </div>
  );
}