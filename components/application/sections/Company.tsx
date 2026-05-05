"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Company() {
  const [form, setForm] = useState({
    companyName: "",
    tagline: "",
    website: "",
    productUrl: "",
    login: "",
    whatBuilding: "",
    problem: "",
    customer: "",
    location: "",
    locationReason: "",
  });

  const [fileName, setFileName] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    const saved = localStorage.getItem("cirglob-application-draft");

    let base = {};
    try {
      base = saved ? JSON.parse(saved) : {};
    } catch {
      base = {};
    }

    localStorage.setItem(
      "cirglob-application-draft",
      JSON.stringify({
        ...base,
        company: {
          ...form,
          [field]: value,
        },
      })
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  };

  return (
    <motion.section
      id="company"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10"
    >
      {/* HEADER */}
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          3. Company
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Goal: understand startup clearly in 2 minutes.
        </p>
      </div>

      {/* QUESTIONS */}
      <div className="space-y-8">

        <Input
          label="1. Company name *"
          placeholder="Your company name"
          value={form.companyName}
          onChange={(v) => handleChange("companyName", v)}
        />

        <Input
          label="2. Describe what your company does in 60 characters or less *"
          placeholder="Short one-line description"
          value={form.tagline}
          maxLength={60}
          onChange={(v) => handleChange("tagline", v)}
        />

        <Input
          label="3. Website URL"
          placeholder="https://yourcompany.com"
          value={form.website}
          onChange={(v) => handleChange("website", v)}
        />

        <Input
          label="4. Product URL"
          placeholder="https://app.yourcompany.com"
          value={form.productUrl}
          onChange={(v) => handleChange("productUrl", v)}
        />

        <Field label="5. Login credentials (optional)">
          <textarea
            className="input min-h-[110px]"
            placeholder="Email / password / access notes"
            value={form.login}
            onChange={(e) => handleChange("login", e.target.value)}
          />
        </Field>

        <Field label="6. What are you building? *">
          <textarea
            className="input min-h-[150px]"
            placeholder="Describe product clearly"
            value={form.whatBuilding}
            onChange={(e) => handleChange("whatBuilding", e.target.value)}
          />
        </Field>

        <Field label="7. What painful problem does this solve? *">
          <textarea
            className="input min-h-[150px]"
            placeholder="Explain the core pain point"
            value={form.problem}
            onChange={(e) => handleChange("problem", e.target.value)}
          />
        </Field>

        <Field label="8. Who is the customer? *">
          <textarea
            className="input min-h-[150px]"
            placeholder="Be specific about user"
            value={form.customer}
            onChange={(e) => handleChange("customer", e.target.value)}
          />
        </Field>

        <Input
          label="9. Where do you live now, and where will company be based after Cirglob? *"
          placeholder="City A / City B"
          value={form.location}
          onChange={(v) => handleChange("location", v)}
        />

        <Field label="10. Why this location?">
          <textarea
            className="input min-h-[130px]"
            placeholder="Explain reasoning"
            value={form.locationReason}
            onChange={(e) => handleChange("locationReason", e.target.value)}
          />
        </Field>

        {/* FILE UPLOAD */}
        <Field label="11. Upload demo / screenshots / pitch deck (optional)">
          <div className="relative">
            <input
              type="file"
              onChange={handleFile}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            <div className="input flex items-center justify-between">
              <span className="text-white/60">
                {fileName || "Upload file"}
              </span>
              <span className="text-xs text-white/40">
                Optional
              </span>
            </div>
          </div>
        </Field>

      </div>
    </motion.section>
  );
}

/* ================= UI ================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/60">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-white/60">
        {label}
      </label>

      <input
        className="input"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />

      {maxLength && (
        <p className="mt-1 text-right text-xs text-white/30">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}