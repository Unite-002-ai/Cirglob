'use client';

import { useEffect, useMemo, useState } from "react";
import Radio from "../ui/Radio";
import Textarea from "../ui/Textarea";
import Field from "../ui/Field";

type CycleSelection = "Upcoming Cycle" | "A Future Cycle";
type FutureCycle = "Winter 2027" | "Summer 2027";

type TimingCommitmentData = {
  applyingFor: CycleSelection | "";
  futureCycle: FutureCycle | "";
  futureCycleReason: string;
};

type StoredTimingCommitment = {
  applyingFor?: string;
  futureCycle?: string;
  futureCycleReason?: string;
};

const STORAGE_KEY = "cirglob-application-draft";
const STORAGE_SECTION_KEY = "timingCommitment";

const APPLYING_OPTIONS: CycleSelection[] = ["Upcoming Cycle", "A Future Cycle"];
const FUTURE_CYCLE_OPTIONS: FutureCycle[] = ["Winter 2027", "Summer 2027"];

function isCycleSelection(value: unknown): value is CycleSelection {
  return value === "Upcoming Cycle" || value === "A Future Cycle";
}

function isFutureCycle(value: unknown): value is FutureCycle {
  return value === "Winter 2027" || value === "Summer 2027";
}

function normalizeStoredTimingCommitment(
  value: unknown,
): TimingCommitmentData {
  const input = value as StoredTimingCommitment | null | undefined;

  const applyingFor = isCycleSelection(input?.applyingFor)
    ? input?.applyingFor
    : "";

  const futureCycle = isFutureCycle(input?.futureCycle) ? input?.futureCycle : "";

  const futureCycleReason =
    typeof input?.futureCycleReason === "string"
      ? input.futureCycleReason
      : "";

  if (applyingFor === "Upcoming Cycle") {
    return {
      applyingFor,
      futureCycle: "",
      futureCycleReason: "",
    };
  }

  return {
    applyingFor,
    futureCycle,
    futureCycleReason,
  };
}

function readDraft(): TimingCommitmentData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { applyingFor: "", futureCycle: "", futureCycleReason: "" };

    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    const section = parsed?.[STORAGE_SECTION_KEY];

    return normalizeStoredTimingCommitment(section);
  } catch {
    return { applyingFor: "", futureCycle: "", futureCycleReason: "" };
  }
}

function writeDraft(next: TimingCommitmentData): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const base = saved ? (JSON.parse(saved) as Record<string, unknown>) : {};

    const payload: StoredTimingCommitment = {
      applyingFor: next.applyingFor || undefined,
      futureCycle:
        next.applyingFor === "A Future Cycle" && next.futureCycle
          ? next.futureCycle
          : undefined,
      futureCycleReason:
        next.applyingFor === "A Future Cycle" && next.futureCycleReason.trim()
          ? next.futureCycleReason
          : undefined,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...base,
        [STORAGE_SECTION_KEY]: payload,
      }),
    );
  } catch {
    // Ignore storage failures.
  }
}

export default function TimingCommitment() {
  const [form, setForm] = useState<TimingCommitmentData>({
    applyingFor: "",
    futureCycle: "",
    futureCycleReason: "",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setForm(readDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeDraft(form);
  }, [form, hydrated]);

  const update = <K extends keyof TimingCommitmentData>(
    key: K,
    value: TimingCommitmentData[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "applyingFor" && value === "Upcoming Cycle") {
        next.futureCycle = "";
        next.futureCycleReason = "";
      }

      return next;
    });
  };

  const showFutureCycleFields = useMemo(
    () => form.applyingFor === "A Future Cycle",
    [form.applyingFor],
  );

  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <h3 className="text-2xl font-medium tracking-tight text-white">
          8. Timing &amp; Commitment
        </h3>

        <p className="max-w-2xl text-sm leading-6 text-white/50">
          Understand operational readiness, timing, and founder commitment.
        </p>
      </header>

      <Field
        variant="timing"
        label="Which Cirglob cycle are you applying for? *"
        description="Helps us understand the company’s expected timing and operational readiness."
      >
        <Radio
          options={APPLYING_OPTIONS.map((option) => ({
            label: option,
            value: option,
          }))}
          value={form.applyingFor || undefined}
          onChange={(option) => update("applyingFor", option)}
          optionsClassName="grid gap-3 sm:grid-cols-2"
          optionClassName="group w-full rounded-2xl border px-4 py-4 text-left text-sm transition-all duration-200 focus:outline-none border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-400/20 hover:bg-blue-500/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          activeOptionClassName="group w-full rounded-2xl border px-4 py-4 text-left text-sm transition-all duration-200 focus:outline-none border-blue-400/25 bg-blue-500/15 text-white shadow-[0_10px_30px_rgba(59,130,246,.12)] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </Field>

      {showFutureCycleFields ? (
        <div className="space-y-10">
          <Field
            variant="timing"
            label="Which future cycle are you targeting? *"
            description="Select the future cycle that best matches the company’s expected readiness and timing."
          >
            <Radio
              options={FUTURE_CYCLE_OPTIONS.map((option) => ({
                label: option,
                value: option,
              }))}
              value={form.futureCycle || undefined}
              onChange={(option) => update("futureCycle", option)}
              optionsClassName="grid gap-3 sm:grid-cols-2"
              optionClassName="group w-full rounded-2xl border px-4 py-4 text-left text-sm transition-all duration-200 focus:outline-none border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-400/20 hover:bg-blue-500/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              activeOptionClassName="group w-full rounded-2xl border px-4 py-4 text-left text-sm transition-all duration-200 focus:outline-none border-blue-400/25 bg-blue-500/15 text-white shadow-[0_10px_30px_rgba(59,130,246,.12)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>

          <Field
            variant="timing"
            label="What is driving the decision to apply for a future cycle instead of the upcoming one? *"
            description="Explain the operational, strategic, regulatory, product, or timing factors influencing the decision."
          >
            <Textarea
              value={form.futureCycleReason}
              onChange={(v) => update("futureCycleReason", v)}
              placeholder="Product readiness, infrastructure milestones, graduation timelines, regulatory approvals, fundraising sequencing, relocation timing, team formation, or other strategic constraints."
              className="min-h-[150px]"
            />
          </Field>
        </div>
      ) : null}
    </section>
  );
}