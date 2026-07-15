"use client";

import { useEffect, useRef, useState } from "react";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

type InsightForm = {
  whyProblemMatter: string;
  whyNow: string;
  marketInsight: string;
  scalingDurable: string;
  failureReason: string;
  category: string;
};

const STORAGE_KEY = "cirglob-application-draft";
const STORAGE_FIELD = "insight";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeInsightForm(
  input: Partial<InsightForm> | null | undefined,
): InsightForm {
  return {
    whyProblemMatter:
      typeof input?.whyProblemMatter === "string"
        ? input.whyProblemMatter
        : "",
    whyNow: typeof input?.whyNow === "string" ? input.whyNow : "",
    marketInsight:
      typeof input?.marketInsight === "string" ? input.marketInsight : "",
    scalingDurable:
      typeof input?.scalingDurable === "string" ? input.scalingDurable : "",
    failureReason:
      typeof input?.failureReason === "string" ? input.failureReason : "",
    category: typeof input?.category === "string" ? input.category : "",
  };
}

function readInsightDraft(): InsightForm | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const candidate = isRecord(parsed[STORAGE_FIELD])
      ? parsed[STORAGE_FIELD]
      : isRecord(parsed.idea)
        ? parsed.idea
        : null;

    if (!candidate) return null;

    return normalizeInsightForm(candidate as Partial<InsightForm>);
  } catch {
    return null;
  }
}

function persistInsightDraft(form: InsightForm): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};

    const base = isRecord(parsed) ? parsed : {};

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...base,
        [STORAGE_FIELD]: form,
      }),
    );
  } catch {
    // Ignore storage failures
  }
}

export default function Insight() {
  const [form, setForm] = useState<InsightForm>({
    whyProblemMatter: "",
    whyNow: "",
    marketInsight: "",
    scalingDurable: "",
    failureReason: "",
    category: "",
  });

  const hydratedRef = useRef(false);

  useEffect(() => {
    const saved = readInsightDraft();
    if (saved) {
      setForm(saved);
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistInsightDraft(form);
  }, [form]);

  const update = (key: keyof InsightForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          5. Insight
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Reveal the founder’s understanding of the problem, timing, market
          reality, and strategic insight behind the company.
        </p>
      </div>

      <div className="space-y-8">
        <Textarea
          label="Why does this problem matter deeply enough for you to build a company around it? *"
          value={form.whyProblemMatter}
          onChange={(v) => update("whyProblemMatter", v)}
          placeholder="What exposed you to this problem, why existing solutions fall short, and why you believe this problem is important to solve."
        />

        <Textarea
          label="Why is this the right time for this company to exist? *"
          value={form.whyNow}
          onChange={(v) => update("whyNow", v)}
          placeholder="Technology shifts, market behavior, regulation, infrastructure, cultural changes, or other conditions that make this newly possible."
        />

        <Textarea
          label="What important reality about this market, system, or problem do most people misunderstand or overlook? *"
          value={form.marketInsight}
          onChange={(v) => update("marketInsight", v)}
          placeholder="Customer behavior, operational realities, industry blind spots, technical insight, or anything you believe is widely misunderstood."
        />

        <Textarea
          label="If this succeeds broadly, what makes this difficult to replace over time? *"
          value={form.scalingDurable}
          onChange={(v) => update("scalingDurable", v)}
          placeholder="Business model, customer demand, expansion potential, infrastructure advantages, defensibility, or long-term strategic leverage."
        />

        <Textarea
          label="What is the most likely reason this company could fail? *"
          value={form.failureReason}
          onChange={(v) => update("failureReason", v)}
          placeholder="Market risks, technical limitations, adoption challenges, timing risks, operational weaknesses, or anything else that could prevent success."
        />

        <Select
          label="Primary company category *"
          value={form.category}
          onChange={(v) => update("category", v)}
          options={[
            "AI",
            "SaaS",
            "Education",
            "Fintech",
            "Cybersecurity",
            "Healthcare",
            "Climate",
            "Consumer",
            "Marketplace",
            "Deep Tech",
            "Robotics",
            "Infrastructure",
            "Biotech",
            "Developer Tools",
            "Defense",
            "Other",
          ]}
        />
      </div>
    </div>
  );
}