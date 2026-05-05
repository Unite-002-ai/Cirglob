"use client";

import React, { useState } from "react";

type Founder = {
  id: number;
  fullName: string;
  role: string;
  country: string;
  linkedin: string;
  extraLink: string;
};

type YesNo = "" | "Yes" | "No";

export default function Founders() {
  const [founders, setFounders] = useState<Founder[]>([
    {
      id: 1,
      fullName: "",
      role: "",
      country: "",
      linkedin: "",
      extraLink: "",
    },
  ]);

  const [whoBuildsToday, setWhoBuildsToday] = useState("");
  const [criticalWorkByNonFounders, setCriticalWorkByNonFounders] =
    useState<YesNo>("");
  const [criticalWorkDetails, setCriticalWorkDetails] = useState({
    who: "",
    what: "",
    why: "",
  });

  const [knownEachOther, setKnownEachOther] = useState("");
  const [workedTogetherBefore, setWorkedTogetherBefore] = useState<YesNo>("");
  const [workedTogetherExplain, setWorkedTogetherExplain] = useState("");

  const [allFullTime, setAllFullTime] = useState<YesNo>("");
  const [fullTimeExplain, setFullTimeExplain] = useState("");

  const [whyTeam, setWhyTeam] = useState("");
  const [lookingForCoFounder, setLookingForCoFounder] = useState<YesNo>("");
  const [coFounderNeedExplain, setCoFounderNeedExplain] = useState("");

  const addFounder = () => {
    setFounders((prev) => [
      ...prev,
      {
        id: Date.now(),
        fullName: "",
        role: "",
        country: "",
        linkedin: "",
        extraLink: "",
      },
    ]);
  };

  const updateFounder = (
    id: number,
    field: keyof Omit<Founder, "id">,
    value: string
  ) => {
    setFounders((prev) =>
      prev.map((founder) =>
        founder.id === id ? { ...founder, [field]: value } : founder
      )
    );
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          Founders
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Goal: judge team strength, ownership, trust, skill, and hunger.
        </p>
      </div>

      {/* FOUNDERS BLOCK */}
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/80">Founder Profiles</p>
          <p className="text-sm text-white/40">
            Add one founder block for each co-founder.
          </p>
        </div>

        {founders.map((founder, index) => (
          <div
            key={founder.id}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5"
          >
            <p className="text-sm text-white/40">Founder {index + 1}</p>

            <Grid>
              <Input
                placeholder="Founder full name"
                value={founder.fullName}
                onChange={(v) => updateFounder(founder.id, "fullName", v)}
              />
              <Input
                placeholder="Role (CEO / CTO / COO / etc)"
                value={founder.role}
                onChange={(v) => updateFounder(founder.id, "role", v)}
              />
              <Input
                placeholder="Country"
                value={founder.country}
                onChange={(v) => updateFounder(founder.id, "country", v)}
              />
              <Input
                placeholder="LinkedIn"
                value={founder.linkedin}
                onChange={(v) => updateFounder(founder.id, "linkedin", v)}
              />
              <Input
                placeholder="X / GitHub / Website (optional)"
                value={founder.extraLink}
                onChange={(v) => updateFounder(founder.id, "extraLink", v)}
              />
            </Grid>
          </div>
        ))}

        <button
          type="button"
          onClick={addFounder}
          className="text-sm text-white/60 transition hover:text-white"
        >
          + Add Co-Founder
        </button>
      </div>

      {/* MAIN QUESTIONS */}
      <div className="space-y-8">
        <Question label="1. Who builds the product today?">
          <Textarea
            value={whoBuildsToday}
            onChange={setWhoBuildsToday}
            placeholder="Who writes code, builds product, runs ops, sells?"
          />
        </Question>

        <Question label="2. Was any critical work done by non-founders?">
          <RadioGroup
            name="critical-work"
            value={criticalWorkByNonFounders}
            onChange={setCriticalWorkByNonFounders}
            options={["Yes", "No"]}
          />

          {criticalWorkByNonFounders === "Yes" && (
            <div className="space-y-4">
              <Input
                placeholder="Who?"
                value={criticalWorkDetails.who}
                onChange={(v) =>
                  setCriticalWorkDetails((prev) => ({ ...prev, who: v }))
                }
              />
              <Input
                placeholder="What did they build?"
                value={criticalWorkDetails.what}
                onChange={(v) =>
                  setCriticalWorkDetails((prev) => ({ ...prev, what: v }))
                }
              />
              <Textarea
                value={criticalWorkDetails.why}
                onChange={(v) =>
                  setCriticalWorkDetails((prev) => ({ ...prev, why: v }))
                }
                placeholder="Why?"
              />
            </div>
          )}
        </Question>

        <Question label="3. How long have founders known each other?">
          <Select
            value={knownEachOther}
            onChange={setKnownEachOther}
            options={["< 6 months", "6–12 months", "1–3 years", "3+ years"]}
          />
        </Question>

        <Question label="4. Have any founders worked together before?">
          <RadioGroup
            name="worked-before"
            value={workedTogetherBefore}
            onChange={setWorkedTogetherBefore}
            options={["Yes", "No"]}
          />

          {workedTogetherBefore === "Yes" && (
            <Textarea
              value={workedTogetherExplain}
              onChange={setWorkedTogetherExplain}
              placeholder="Explain."
            />
          )}
        </Question>

        <Question label="5. Are all founders full-time?">
          <RadioGroup
            name="full-time"
            value={allFullTime}
            onChange={setAllFullTime}
            options={["Yes", "No"]}
          />

          {allFullTime === "No" && (
            <Textarea
              value={fullTimeExplain}
              onChange={setFullTimeExplain}
              placeholder="If no, explain who is part-time and why."
            />
          )}
        </Question>

        <Question label="6. Why are you the team to solve this?">
          <Textarea
            value={whyTeam}
            onChange={setWhyTeam}
            placeholder="Short answer"
          />
        </Question>

        <Question label="7. Are you looking for another cofounder?">
          <RadioGroup
            name="looking-for-cofounder"
            value={lookingForCoFounder}
            onChange={setLookingForCoFounder}
            options={["Yes", "No"]}
          />

          {lookingForCoFounder === "Yes" && (
            <Textarea
              value={coFounderNeedExplain}
              onChange={setCoFounderNeedExplain}
              placeholder="Explain what kind of cofounder you are looking for."
            />
          )}
        </Question>
      </div>
    </div>
  );
}

/* SHARED UI */

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="input"
    />
  );
}

function Textarea({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="input min-h-[140px]"
    />
  );
}

function Select({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="input"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value?: string;
  onChange?: (v: any) => void;
}) {
  return (
    <div className="flex flex-wrap gap-6">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2 text-sm text-white/60"
        >
          <input
            type="radio"
            name={name}
            checked={value === opt}
            onChange={() => onChange?.(opt)}
            className="accent-white"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function Question({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/70">{label}</p>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}