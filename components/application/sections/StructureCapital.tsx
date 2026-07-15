"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Radio from "../ui/Radio";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Field from "../ui/Field";
import Question from "../ui/Question";

type FormationStatus = "" | "Yes" | "No";
type YesNo = "" | "Yes" | "No";

type FinancingPosture =
  | ""
  | "Currently raising capital"
  | "Planning to raise later"
  | "Operating without outside fundraising"
  | "Undecided";

type CapitalSourceType =
  | ""
  | "SAFE"
  | "Equity"
  | "Convertible note"
  | "Grant"
  | "Accelerator"
  | "Revenue financing"
  | "Other";

type FundingStatus = "" | "Closed" | "Committed" | "Pending";

type FundingEntry = {
  sourceName: string;
  sourceType: CapitalSourceType;
  amount: string;
  date: string;
  status: FundingStatus;
};

type CompensationEntry = {
  founder: string;
  compensationType: string;
  monthlyAmount: string;
};

type StructureCapitalData = {
  companyFormed: FormationStatus;
  legalStructure: string;
  ownershipPlan: string;
  decisionControl: string;

  outsideCapital: YesNo;
  fundingEntries: FundingEntry[];

  founderCompensationStatus: YesNo;
  compensationEntries: CompensationEntry[];

  financingPosture: FinancingPosture;
  financingContext: string;

  obligations: string;
};

type StructureCapitalSectionRuntimeProps = {
  value: unknown;
  onChange: (value: unknown) => void;
  errors: string[];
  locked: boolean;
  disabled: boolean;
  dirty: boolean;
  readonlyReason: string | null;
  applicationId: string | null;
  status: unknown;
  section: string;
};

const CAPITAL_SOURCE_OPTIONS: CapitalSourceType[] = [
  "",
  "SAFE",
  "Equity",
  "Convertible note",
  "Grant",
  "Accelerator",
  "Revenue financing",
  "Other",
];

const FUNDING_STATUS_OPTIONS: FundingStatus[] = ["", "Closed", "Committed", "Pending"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function emptyFundingEntry(): FundingEntry {
  return {
    sourceName: "",
    sourceType: "",
    amount: "",
    date: "",
    status: "",
  };
}

function emptyCompensationEntry(): CompensationEntry {
  return {
    founder: "",
    compensationType: "",
    monthlyAmount: "",
  };
}

function normalizeFundingEntry(value: unknown): FundingEntry {
  if (!isRecord(value)) return emptyFundingEntry();

  const rawSourceType = asString(value.sourceType ?? value.type);
  const sourceType: CapitalSourceType = CAPITAL_SOURCE_OPTIONS.includes(
    rawSourceType as CapitalSourceType,
  )
    ? (rawSourceType as CapitalSourceType)
    : "";

  const rawStatus = asString(value.status ?? value.stage);
  const status: FundingStatus = FUNDING_STATUS_OPTIONS.includes(
    rawStatus as FundingStatus,
  )
    ? (rawStatus as FundingStatus)
    : "";

  return {
    sourceName: asString(value.sourceName ?? value.source ?? value.investor),
    sourceType,
    amount: asString(value.amount ?? value.value),
    date: asString(value.date ?? value.receivedDate),
    status,
  };
}

function normalizeCompensationEntry(value: unknown): CompensationEntry {
  if (!isRecord(value)) return emptyCompensationEntry();

  return {
    founder: asString(value.founder ?? value.name),
    compensationType: asString(value.compensationType ?? value.type),
    monthlyAmount: asString(value.monthlyAmount ?? value.amount),
  };
}

function normalizeStructureCapitalData(value: unknown): StructureCapitalData {
  const source = isRecord(value) ? value : {};

  const legacyFundingEntries = asArray<unknown>(source.fundingEntries).map(
    normalizeFundingEntry,
  );

  const legacyCompensationEntries = asArray<unknown>(source.compensationEntries).map(
    normalizeCompensationEntry,
  );

  return {
    companyFormed:
      asString(source.companyFormed) === "Yes" || asString(source.companyFormed) === "No"
        ? (asString(source.companyFormed) as FormationStatus)
        : "",
    legalStructure: asString(source.legalStructure),
    ownershipPlan: asString(source.ownershipPlan),
    decisionControl: asString(source.decisionControl),

    outsideCapital:
      asString(source.outsideCapital) === "Yes" || asString(source.outsideCapital) === "No"
        ? (asString(source.outsideCapital) as YesNo)
        : "",
    fundingEntries:
      legacyFundingEntries.length > 0 ? legacyFundingEntries : [],

    founderCompensationStatus:
      asString(source.founderCompensationStatus) === "Yes" ||
      asString(source.founderCompensationStatus) === "No"
        ? (asString(source.founderCompensationStatus) as YesNo)
        : "",
    compensationEntries:
      legacyCompensationEntries.length > 0 ? legacyCompensationEntries : [],

    financingPosture: [
      "",
      "Currently raising capital",
      "Planning to raise later",
      "Operating without outside fundraising",
      "Undecided",
    ].includes(asString(source.financingPosture))
      ? (asString(source.financingPosture) as FinancingPosture)
      : "",
    financingContext: asString(source.financingContext),

    obligations: asString(source.obligations),
  };
}

export default function StructureCapital(
  props: StructureCapitalSectionRuntimeProps,
) {
  const data = useMemo(
    () => normalizeStructureCapitalData(props.value),
    [props.value],
  );

  const update = <K extends keyof StructureCapitalData>(
    key: K,
    value: StructureCapitalData[K],
  ) => {
    props.onChange({
      ...data,
      [key]: value,
    });
  };

  const updateFundingEntry = <K extends keyof FundingEntry>(
    index: number,
    key: K,
    value: FundingEntry[K],
  ) => {
    const fundingEntries = data.fundingEntries.map((entry, i) =>
      i === index ? { ...entry, [key]: value } : entry,
    );

    update("fundingEntries", fundingEntries);
  };

  const addFundingEntry = () => {
    update("fundingEntries", [...data.fundingEntries, emptyFundingEntry()]);
  };

  const removeFundingEntry = (index: number) => {
    update(
      "fundingEntries",
      data.fundingEntries.filter((_, i) => i !== index),
    );
  };

  const updateCompensationEntry = <K extends keyof CompensationEntry>(
    index: number,
    key: K,
    value: CompensationEntry[K],
  ) => {
    const compensationEntries = data.compensationEntries.map((entry, i) =>
      i === index ? { ...entry, [key]: value } : entry,
    );

    update("compensationEntries", compensationEntries);
  };

  const addCompensationEntry = () => {
    update("compensationEntries", [
      ...data.compensationEntries,
      emptyCompensationEntry(),
    ]);
  };

  const removeCompensationEntry = (index: number) => {
    update(
      "compensationEntries",
      data.compensationEntries.filter((_, i) => i !== index),
    );
  };

  const needsOwnershipPlan = data.companyFormed === "No";
  const hasCompanyStructure = data.companyFormed === "Yes";
  const hasOutsideCapital = data.outsideCapital === "Yes";
  const hasFounderCompensation = data.founderCompensationStatus === "Yes";

  const financingContextRequired =
    data.financingPosture === "Currently raising capital" ||
    data.financingPosture === "Planning to raise later";

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          6. Structure &amp; Capital
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-white/50">
          Understand how the company is structured, financed, and strategically
          governed.
        </p>
      </div>

      <div className="space-y-8">
        <Question
          label="Has the company been legally formed? *"
          description="Helps us understand the company’s current legal and operational status."
        >
          <Radio<FormationStatus>
            name="company-formed"
            value={data.companyFormed}
            onChange={(v) => {
              update("companyFormed", v);
            }}
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
          />
        </Question>

        <AnimatePresence initial={false}>
          {hasCompanyStructure && (
            <motion.div
              key="company-structure"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <Question
                label="Legal structure and jurisdiction *"
                description="Use the entity type and jurisdiction that best reflect the operating structure."
              >
                <Textarea
                  value={data.legalStructure}
                  onChange={(v) => update("legalStructure", v)}
                  placeholder="Delaware C-Corp (USA), UK Ltd, Singapore Pvt Ltd, Egyptian LLC, holding structure, subsidiary structure, etc."
                />
              </Question>
            </motion.div>
          )}

          {needsOwnershipPlan && (
            <motion.div
              key="ownership-plan"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <Question
                label="Planned ownership structure *"
                description="Include founder ownership, future allocation plans, employee incentives, or reserved equity."
              >
                <Textarea
                  value={data.ownershipPlan}
                  onChange={(v) => update("ownershipPlan", v)}
                  placeholder="Founder ownership, employee option pool, advisor allocation, and future hiring reserve."
                />
              </Question>
            </motion.div>
          )}
        </AnimatePresence>

        <Question
          label="Who currently controls major company decisions? *"
          description="Explain how strategic, financial, product, and operational decisions are currently made."
        >
          <Textarea
            value={data.decisionControl}
            onChange={(v) => update("decisionControl", v)}
            placeholder="Single founder control, shared founder voting, board oversight, investor approval structure, operational delegation, or informal founder alignment."
          />
        </Question>

        <Question
          label="Has the company received external capital? *"
          description="This includes grants, angel investors, accelerators, family offices, strategic funding, venture capital, research funding, or other external financing sources."
        >
          <Radio<YesNo>
            name="outside-capital"
            value={data.outsideCapital}
            onChange={(v) => {
              update("outsideCapital", v);
            }}
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
          />
        </Question>

        <AnimatePresence initial={false}>
          {hasOutsideCapital && (
            <motion.div
              key="outside-capital-details"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-visible space-y-6"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-white/70">Capital sources</p>
                  <p className="text-sm leading-6 text-white/40">
                    Use one row per source so the data stays analyzable.
                  </p>
                </div>

                <div className="space-y-4">
                  {data.fundingEntries.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                      No capital sources added yet.
                    </div>
                  ) : null}

                  {data.fundingEntries.map((entry, index) => (
                    <div
                      key={`funding-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white/70">
                          Capital source {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeFundingEntry(index)}
                          className="text-xs text-white/45 transition hover:text-white/75"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Source / investor name">
                          <Input
                            value={entry.sourceName}
                            onChange={(v) => updateFundingEntry(index, "sourceName", v)}
                            placeholder="Investor name, grant source, accelerator, or funding entity"
                          />
                        </Field>

                        <Field label="Type">
                          <Select<CapitalSourceType>
                            value={entry.sourceType}
                            onChange={(v) => updateFundingEntry(index, "sourceType", v)}
                            options={CAPITAL_SOURCE_OPTIONS}
                          />
                        </Field>

                        <Field label="Amount">
                          <Input
                            value={entry.amount}
                            onChange={(v) => updateFundingEntry(index, "amount", v)}
                            placeholder="e.g. USD 250,000"
                          />
                        </Field>

                        <Field label="Date">
                          <Input
                            value={entry.date}
                            onChange={(v) => updateFundingEntry(index, "date", v)}
                            placeholder="e.g. 2025-04-12"
                          />
                        </Field>

                        <Field label="Status">
                          <Select<FundingStatus>
                            value={entry.status}
                            onChange={(v) => updateFundingEntry(index, "status", v)}
                            options={FUNDING_STATUS_OPTIONS}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addFundingEntry}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Add capital source
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Question
          label="What best describes the company’s current financing posture? *"
          description="Helps us understand how the company plans to finance growth and manage strategic timing."
        >
          <Radio<FinancingPosture>
            name="financing-posture"
            value={data.financingPosture}
            onChange={(v) => {
              update("financingPosture", v);
            }}
            options={[
              {
                label: "Currently raising capital",
                value: "Currently raising capital",
              },
              {
                label: "Planning to raise later",
                value: "Planning to raise later",
              },
              {
                label: "Operating without outside fundraising",
                value: "Operating without outside fundraising",
              },
              {
                label: "Undecided",
                value: "Undecided",
              },
            ]}
          />
        </Question>

        <Question
          label={`Financing strategy and context${
            financingContextRequired ? " *" : ""
          }`}
          description="Include target capital, financing structure, investor discussions, long-term financing plans, strategic capital philosophy, or reasons for remaining independent."
        >
          <Textarea
            value={data.financingContext}
            onChange={(v) => update("financingContext", v)}
            placeholder="Target capital, financing structure, investor conversations, strategic financing philosophy, long-term capital plans, or rationale for remaining independent."
          />
        </Question>

        <Question
          label="Are founders currently receiving compensation from the company? *"
          description="Include salary, consulting payments, contractor compensation, or other founder-linked compensation."
        >
          <Radio<YesNo>
            name="founder-compensation"
            value={data.founderCompensationStatus}
            onChange={(v) => {
              update("founderCompensationStatus", v);
            }}
            options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
          />
        </Question>

        <AnimatePresence initial={false}>
          {hasFounderCompensation && (
            <motion.div
              key="founder-compensation-details"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-visible space-y-6"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-white/70">Founder compensation entries</p>
                  <p className="text-sm leading-6 text-white/40">
                    Use one row per founder so the data stays comparable.
                  </p>
                </div>

                <div className="space-y-4">
                  {data.compensationEntries.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                      No founder compensation entries added yet.
                    </div>
                  ) : null}

                  {data.compensationEntries.map((entry, index) => (
                    <div
                      key={`comp-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white/70">
                          Compensation entry {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeCompensationEntry(index)}
                          className="text-xs text-white/45 transition hover:text-white/75"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label="Founder">
                          <Input
                            value={entry.founder}
                            onChange={(v) => updateCompensationEntry(index, "founder", v)}
                            placeholder="Founder name"
                          />
                        </Field>

                        <Field label="Compensation type">
                          <Input
                            value={entry.compensationType}
                            onChange={(v) =>
                              updateCompensationEntry(index, "compensationType", v)
                            }
                            placeholder="Salary, consulting, contractor, bonus, etc."
                          />
                        </Field>

                        <Field label="Approx. monthly amount">
                          <Input
                            value={entry.monthlyAmount}
                            onChange={(v) =>
                              updateCompensationEntry(index, "monthlyAmount", v)
                            }
                            placeholder="e.g. USD 4,000/month"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addCompensationEntry}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Add founder compensation entry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Question
          label="Are there any outstanding financial obligations or convertible instruments tied to the company? *"
          description="Include SAFEs, convertible notes, debt, revenue-share agreements, liabilities, or any similar obligations. If none exist, explicitly state 'None'."
        >
          <Textarea
            value={data.obligations}
            onChange={(v) => update("obligations", v)}
            placeholder="SAFEs, convertible notes, debt, revenue-share agreements, liabilities, or write 'None'."
          />
        </Question>
      </div>
    </div>
  );
}