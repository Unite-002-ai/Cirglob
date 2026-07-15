"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Field from "@/components/investors/ui/Field";
import Select from "@/components/investors/ui/Select";

type Props = {
  data?: Record<string, any>;
  allData: Record<string, any>;
  onNext: (value?: Record<string, any>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
};

export default function IdentityStep({ data, onNext }: Props) {
  const [local, setLocal] = useState({
    fullName: data?.fullName || "",
    email: data?.email || "",
    phone: data?.phone || "",
    country: data?.country || "",
    linkedin: data?.linkedin || "",
    entityType: data?.entityType || "",
  });

  useEffect(() => {
    setLocal({
      fullName: data?.fullName || "",
      email: data?.email || "",
      phone: data?.phone || "",
      country: data?.country || "",
      linkedin: data?.linkedin || "",
      entityType: data?.entityType || "",
    });
  }, [data]);

  function update(field: string, value: string) {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onNext(updated);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Identity
        </h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          Provide verified identity details for Cirglob’s investor review process.
        </p>
      </div>

      {/* Fields container */}
      <div className="space-y-5">
        <Field
          label="Full Name"
          placeholder="Enter your full legal name"
          value={local.fullName}
          onChange={(v) => update("fullName", v)}
        />

        <Field
          label="Email"
          placeholder="name@domain.com"
          type="email"
          value={local.email}
          onChange={(v) => update("email", v)}
        />

        <Field
          label="Phone"
          placeholder="+1 (555) 000-0000"
          value={local.phone}
          onChange={(v) => update("phone", v)}
        />

        <Field
          label="LinkedIn"
          placeholder="https://linkedin.com/in/..."
          value={local.linkedin}
          onChange={(v) => update("linkedin", v)}
        />

        <Field
          label="Country"
          placeholder="Country of residence"
          value={local.country}
          onChange={(v) => update("country", v)}
        />

        <Select
          label="Entity Type"
          value={local.entityType}
          onChange={(v) => update("entityType", v)}
          options={[
            { label: "Individual Investor", value: "individual" },
            { label: "Angel Investor", value: "angel" },
            { label: "VC / Fund", value: "vc" },
            { label: "Family Office", value: "family_office" },
            { label: "Corporate / Strategic", value: "corporate" },
            { label: "Operator / Advisor", value: "operator" },
          ]}
        />
      </div>

      {/* Subtle compliance note */}
      <div className="mt-10 border-t border-white/10 pt-6">
        <p className="text-xs text-white/40 leading-relaxed">
          All information is used solely for qualification and review within the
          Cirglob Investor Network. Submissions are reviewed individually.
        </p>
      </div>
    </motion.div>
  );
}
