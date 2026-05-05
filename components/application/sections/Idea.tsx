"use client";

import { useState } from "react";

type IdeaForm = {
  whyIdea: string;
  whyNow: string;
  positioning: string;
  competitorsMiss: string;
  competitors: string;
  monetization: string;
  marketSize: string;
  category: string;
  moat: string;
  failureReason: string;
  otherIdeas: string;
};

const STORAGE_KEY = "cirglob-application-draft";

export default function Idea() {
  const [form, setForm] = useState<IdeaForm>({
    whyIdea: "",
    whyNow: "",
    positioning: "",
    competitorsMiss: "",
    competitors: "",
    monetization: "",
    marketSize: "",
    category: "",
    moat: "",
    failureReason: "",
    otherIdeas: "",
  });

  const update = (key: keyof IdeaForm, value: string) => {
    const updated = { ...form, [key]: value };
    setForm(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        idea: updated,
      })
    );
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          5. Idea
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Goal: conviction + market understanding.
        </p>
      </div>

      <div className="space-y-8">

        <Textarea
          label="1. Why this idea? *"
          value={form.whyIdea}
          onChange={(v) => update("whyIdea", v)}
          placeholder="What led you to this problem specifically?"
        />

        <Textarea
          label="2. Why now? *"
          value={form.whyNow}
          onChange={(v) => update("whyNow", v)}
          placeholder="Why is this possible today and not before?"
        />

        <Textarea
          label="3. Why are you uniquely positioned?"
          value={form.positioning}
          onChange={(v) => update("positioning", v)}
          placeholder="Your unfair advantage"
        />

        <Textarea
          label="4. What do competitors miss?"
          value={form.competitorsMiss}
          onChange={(v) => update("competitorsMiss", v)}
          placeholder="Gaps in existing solutions"
        />

        <Textarea
          label="5. Who are competitors?"
          value={form.competitors}
          onChange={(v) => update("competitors", v)}
          placeholder="Direct + indirect competitors"
        />

        <Textarea
          label="6. How do / will you make money?"
          value={form.monetization}
          onChange={(v) => update("monetization", v)}
          placeholder="Pricing model, revenue logic"
        />

        <Input
          label="7. How large can this become? (best estimate)"
          value={form.marketSize}
          onChange={(v) => update("marketSize", v)}
          placeholder="e.g. $5B+ market"
        />

        <Select
          label="8. Which category fits best?"
          value={form.category}
          onChange={(v) => update("category", v)}
          options={[
            "AI",
            "SaaS",
            "Fintech",
            "Cybersecurity",
            "Healthcare",
            "Climate",
            "Consumer",
            "Marketplace",
            "Deep Tech",
            "Robotics",
            "Infrastructure",
            "Other",
          ]}
        />

        <Textarea
          label="9. What moat can you build over time?"
          value={form.moat}
          onChange={(v) => update("moat", v)}
          placeholder="Data, distribution, network effects, switching costs..."
        />

        <Textarea
          label="10. If this fails, why would it fail? *"
          value={form.failureReason}
          onChange={(v) => update("failureReason", v)}
          placeholder="Most important signal question"
        />

        <Textarea
          label="11. Other startup ideas you considered (optional)"
          value={form.otherIdeas}
          onChange={(v) => update("otherIdeas", v)}
          placeholder="Shows depth of thinking"
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
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}