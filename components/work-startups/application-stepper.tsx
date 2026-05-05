"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
  jobTitle?: string;
  companyName?: string;
};

export default function ApplicationStepper({
  jobId,
  jobTitle = "Role",
  companyName = "Startup",
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",

    experienceYears: "",
    currentRole: "",
    pastCompanies: "",
    resume: "",
    portfolio: "",

    motivation1: "",
    motivation2: "",
    motivation3: "",

    visa: "",
    workAuth: "",
    startDate: "",
    salary: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = () => {
    // In real system: POST to /api/applications
    console.log("SUBMIT APPLICATION", { jobId, form });

    router.push("/work-at-startups/success");
  };

  return (
    <div
      className="
        w-full max-w-3xl mx-auto
        rounded-2xl
        border border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
        p-6 md:p-8
        shadow-[0_0_50px_rgba(108,140,255,0.08)]
      "
    >
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-white text-xl font-semibold">
          Apply to {jobTitle}
        </h2>
        <p className="text-white/50 text-sm">
          {companyName} • Step {step} of {totalSteps}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6C8CFF] transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="space-y-4">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={(v) => update("firstName", v)} />
            <Input label="Last Name" value={form.lastName} onChange={(v) => update("lastName", v)} />
            <Input label="Email" value={form.email} onChange={(v) => update("email", v)} />
            <Input label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
            <Input label="Location" value={form.location} onChange={(v) => update("location", v)} />
            <Input label="LinkedIn" value={form.linkedin} onChange={(v) => update("linkedin", v)} />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-3">
            <Input label="Years of Experience" value={form.experienceYears} onChange={(v) => update("experienceYears", v)} />
            <Input label="Current Role" value={form.currentRole} onChange={(v) => update("currentRole", v)} />
            <Input label="Past Companies" value={form.pastCompanies} onChange={(v) => update("pastCompanies", v)} />
            <Input label="Portfolio / GitHub" value={form.portfolio} onChange={(v) => update("portfolio", v)} />
            <Input label="Resume URL" value={form.resume} onChange={(v) => update("resume", v)} />
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-3">
            <TextArea
              label="Why do you want this role?"
              value={form.motivation1}
              onChange={(v) => update("motivation1", v)}
            />
            <TextArea
              label="Why this startup?"
              value={form.motivation2}
              onChange={(v) => update("motivation2", v)}
            />
            <TextArea
              label="What have you built?"
              value={form.motivation3}
              onChange={(v) => update("motivation3", v)}
            />
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-3">
            <Input label="Work Authorization" value={form.workAuth} onChange={(v) => update("workAuth", v)} />
            <Input label="Need Visa Sponsorship?" value={form.visa} onChange={(v) => update("visa", v)} />
            <Input label="Preferred Start Date" value={form.startDate} onChange={(v) => update("startDate", v)} />
            <Input label="Salary Expectations" value={form.salary} onChange={(v) => update("salary", v)} />
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="text-white/80 space-y-2 text-sm">
            <p className="text-white text-base font-medium mb-2">
              Review Application
            </p>

            <div className="space-y-1 text-white/60">
              <p><span className="text-white">Name:</span> {form.firstName} {form.lastName}</p>
              <p><span className="text-white">Email:</span> {form.email}</p>
              <p><span className="text-white">Role:</span> {jobTitle}</p>
              <p><span className="text-white">Experience:</span> {form.experienceYears} years</p>
              <p><span className="text-white">Location:</span> {form.location}</p>
            </div>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
        <button
          onClick={back}
          disabled={step === 1}
          className="text-white/60 text-sm disabled:opacity-30"
        >
          Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={next}
            className="
              px-4 py-2 rounded-lg
              bg-[#6C8CFF]
              text-black font-medium
              hover:opacity-90
              transition
            "
          >
            Continue
          </button>
        ) : (
          <button
            onClick={submit}
            className="
              px-4 py-2 rounded-lg
              bg-[#D4AF37]
              text-black font-semibold
              hover:opacity-90
              transition
            "
          >
            Submit Application
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- INPUT COMPONENTS ---------------- */

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full mt-1 px-3 py-2
          rounded-lg
          bg-black/40
          border border-white/10
          text-white text-sm
          outline-none
          focus:border-[#6C8CFF]/50
        "
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-white/50">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="
          w-full mt-1 px-3 py-2
          rounded-lg
          bg-black/40
          border border-white/10
          text-white text-sm
          outline-none
          focus:border-[#6C8CFF]/50
        "
      />
    </div>
  );
}