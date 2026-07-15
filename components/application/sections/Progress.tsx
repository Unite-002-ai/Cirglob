"use client";

import { useEffect, useState } from "react";
import Radio from "../ui/Radio";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

type ProgressForm = {
  stage: string;
  timeWorked: string;
  stack: string;

  hasUsers: "" | "Yes" | "No";
  activeUsers: string;
  payingCustomers: string;
  monthlyRevenue: string;
  fastestChange: string;
  usageBlockers: string;
  expectedLaunchTimeline: string;

  mostImportantBuild: string;
  userLearnings: string;

  pivoted: "" | "Yes" | "No";
  pivotExplanation: string;
};

type ProgressSectionProps = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  errors?: string[];
  locked?: boolean;
  disabled?: boolean;
  dirty?: boolean;
  readonlyReason?: string | null;
  applicationId?: string | null;
  status?: string | null;
  section?: string;
};

const STORAGE_KEY = "cirglob-application-draft";
const STORAGE_SECTION_KEY = "progress";

const STAGE_OPTIONS = [
  "Research / exploration",
  "Building initial product",
  "Private testing",
  "Publicly available",
  "Active usage",
  "Revenue generating",
  "Scaling",
] as const;

function createEmptyProgressForm(): ProgressForm {
  return {
    stage: "",
    timeWorked: "",
    stack: "",

    hasUsers: "",
    activeUsers: "",
    payingCustomers: "",
    monthlyRevenue: "",
    fastestChange: "",
    usageBlockers: "",
    expectedLaunchTimeline: "",

    mostImportantBuild: "",
    userLearnings: "",

    pivoted: "",
    pivotExplanation: "",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readChoice(value: unknown): "" | "Yes" | "No" {
  return value === "Yes" || value === "No" ? value : "";
}

function normalizeProgressForm(input: unknown): ProgressForm {
  const source = isRecord(input) ? input : {};

  return {
    stage: readString(source.stage),
    timeWorked: readString(source.timeWorked),
    stack: readString(source.stack),

    hasUsers: readChoice(source.hasUsers),
    activeUsers: readString(source.activeUsers),
    payingCustomers: readString(source.payingCustomers),
    monthlyRevenue: readString(source.monthlyRevenue),
    fastestChange: readString(source.fastestChange),
    usageBlockers: readString(source.usageBlockers),
    expectedLaunchTimeline: readString(source.expectedLaunchTimeline),

    mostImportantBuild: readString(source.mostImportantBuild),
    userLearnings: readString(source.userLearnings),

    pivoted: readChoice(source.pivoted),
    pivotExplanation: readString(source.pivotExplanation),
  };
}

function readStoredProgress(): ProgressForm {
  if (typeof window === "undefined") {
    return createEmptyProgressForm();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgressForm();

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return createEmptyProgressForm();

    return normalizeProgressForm(parsed[STORAGE_SECTION_KEY]);
  } catch {
    return createEmptyProgressForm();
  }
}

function writeStoredProgress(next: ProgressForm): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const base = isRecord(parsed) ? parsed : {};

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...base,
        [STORAGE_SECTION_KEY]: next,
      }),
    );
  } catch {
    // Ignore storage failures.
  }
}

export default function Progress(props: ProgressSectionProps = {}) {
  const isControlled = typeof props.onChange === "function";
  const [localForm, setLocalForm] = useState<ProgressForm>(() =>
    createEmptyProgressForm(),
  );

  useEffect(() => {
    if (isControlled) return;
    setLocalForm(readStoredProgress());
  }, [isControlled]);

  const form = isControlled
    ? normalizeProgressForm(props.value)
    : localForm;

  const update = (key: keyof ProgressForm, value: string) => {
    if (isControlled) {
      const next = {
        ...normalizeProgressForm(props.value),
        [key]: value,
      };

      props.onChange?.(next);
      return;
    }

    setLocalForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      writeStoredProgress(next);
      return next;
    });
  };

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          4. Progress
        </h3>

        <p className="mt-1 max-w-xl text-sm text-white/50">
          Show us what has been built, tested, learned, or validated so far.
        </p>
      </div>

      <div className="space-y-8">
        <Select
          label="What best describes the current state of the company? *"
          value={form.stage}
          onChange={(v) => update("stage", v)}
          options={[...STAGE_OPTIONS]}
        />

        <Input
          label="How long has the founding team been working on this, and how much of that time has been full-time? *"
          value={form.timeWorked}
          onChange={(v) => update("timeWorked", v)}
          placeholder="Timeline, commitment level, and how the work has evolved over time."
        />

        <Textarea
          label="What core technologies, infrastructure, or technical systems power the company? *"
          value={form.stack}
          onChange={(v) => update("stack", v)}
          placeholder="Frameworks, AI systems, models, cloud infrastructure, tooling, internal systems, or proprietary technology."
        />

        <Radio
          label="Are people actively using the product today?"
          value={form.hasUsers}
          onChange={(v) => update("hasUsers", v)}
          options={[
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ]}
        />

        {form.hasUsers === "Yes" && (
          <div className="space-y-6">
            <Input
              label="Active users, organizations, or deployments *"
              value={form.activeUsers}
              onChange={(v) => update("activeUsers", v)}
              placeholder="e.g. 4,200 monthly active users, 18 active companies, or 12 enterprise deployments"
            />

            <Input
              label="Paying customers (if any)"
              value={form.payingCustomers}
              onChange={(v) => update("payingCustomers", v)}
              placeholder="e.g. 37 paying teams or 0"
            />

            <Input
              label="Current monthly recurring revenue (MRR), if any"
              value={form.monthlyRevenue}
              onChange={(v) => update("monthlyRevenue", v)}
              placeholder="e.g. $2,300 MRR or 0"
            />

            <Textarea
              label="What is improving, compounding, or accelerating most noticeably right now? *"
              value={form.fastestChange}
              onChange={(v) => update("fastestChange", v)}
              placeholder="Usage growth, retention improvements, revenue growth, customer expansion, engagement patterns, infrastructure scaling, or other meaningful operational momentum."
            />
          </div>
        )}

        {form.hasUsers === "No" && (
          <div className="space-y-6">
            <Textarea
              label="What still needs to happen before people can actively use the product? *"
              value={form.usageBlockers}
              onChange={(v) => update("usageBlockers", v)}
              placeholder="Technical blockers, product milestones, regulatory steps, infrastructure work, or launch timeline."
            />

            <Input
              label="When do you expect people to begin actively using the product? *"
              value={form.expectedLaunchTimeline}
              onChange={(v) => update("expectedLaunchTimeline", v)}
              placeholder="e.g. Private beta in 6 weeks, enterprise pilot in Q3, public launch this summer."
            />
          </div>
        )}

        <Textarea
          label="What is the most difficult, impressive, or important thing your team has built so far? *"
          value={form.mostImportantBuild}
          onChange={(v) => update("mostImportantBuild", v)}
          className="min-h-[180px]"
          placeholder="Technical systems, infrastructure, research breakthroughs, product design, operational execution, or anything else that materially moved the company forward."
        />

        <Textarea
          label="What have you learned from real users, customers, or testing so far? *"
          value={form.userLearnings}
          onChange={(v) => update("userLearnings", v)}
          className="min-h-[180px]"
          placeholder="Product behavior, adoption patterns, customer objections, failed assumptions, retention insights, operational discoveries, or anything that changed your understanding of the problem."
        />

        <Radio
          label="Has the company’s direction changed materially since inception?"
          value={form.pivoted}
          onChange={(v) => update("pivoted", v)}
          options={[
            { label: "Yes", value: "Yes" },
            { label: "No", value: "No" },
          ]}
        />

        {form.pivoted === "Yes" && (
          <Textarea
            label="What changed, and what caused the change in direction? *"
            value={form.pivotExplanation}
            onChange={(v) => update("pivotExplanation", v)}
            placeholder="What you learned, what proved incorrect, and why the new direction is stronger."
          />
        )}
      </div>
    </div>
  );
}