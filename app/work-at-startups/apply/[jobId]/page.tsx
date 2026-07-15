"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCompanyBySlug, getJobById } from "@/lib/work-at-startups-data";

export default function ApplyJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();

  const jobId = Array.isArray(params?.jobId) ? params.jobId[0] : params?.jobId;
  const job = jobId ? getJobById(jobId) : undefined;
  const company = job ? getCompanyBySlug(job.companySlug) : undefined;

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",

    yearsExperience: "",
    currentRole: "",
    pastCompanies: "",
    resume: "",
    portfolio: "",

    whyRole: "",
    whyStartup: "",
    whatBuilt: "",

    visa: "",
    workAuth: "",
    startDate: "",
    salary: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = () => {
    console.log("Submitting application:", { jobId, form });
    router.push("/work-at-startups/success");
  };

  if (!job) {
    return (
      <main className="min-h-screen bg-[#05060A] text-white flex items-center justify-center">
        Job not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#7C8CFF]/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#D4AF37]/10 blur-[180px] rounded-full" />
      </div>

      <div className="relative max-w-[900px] mx-auto px-6 pt-10">
        <Link
          href={`/work-at-startups/jobs/${job.id}`}
          className="text-sm text-white/45 hover:text-white transition"
        >
          ← Back to Job
        </Link>

        <h1 className="text-3xl md:text-5xl font-semibold mt-6">
          Apply to {job.title}
        </h1>

        <p className="text-white/45 text-sm mt-2">
          {company?.name || job.companyName} • Step {step} of 5
        </p>

        <div className="w-full h-[6px] bg-white/10 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7C8CFF] to-[#D4AF37] transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-12">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="First Name" className="input" onChange={(e) => update("firstName", e.target.value)} />
              <input placeholder="Last Name" className="input" onChange={(e) => update("lastName", e.target.value)} />
              <input placeholder="Email" className="input md:col-span-2" onChange={(e) => update("email", e.target.value)} />
              <input placeholder="Phone" className="input" onChange={(e) => update("phone", e.target.value)} />
              <input placeholder="Location" className="input" onChange={(e) => update("location", e.target.value)} />
              <input placeholder="LinkedIn URL" className="input" onChange={(e) => update("linkedin", e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Experience</h2>

            <input placeholder="Years of Experience" className="input" onChange={(e) => update("yearsExperience", e.target.value)} />
            <input placeholder="Current Role" className="input" onChange={(e) => update("currentRole", e.target.value)} />
            <textarea placeholder="Past Companies" className="input h-24" onChange={(e) => update("pastCompanies", e.target.value)} />
            <input placeholder="Portfolio / GitHub" className="input" onChange={(e) => update("portfolio", e.target.value)} />
            <input placeholder="Resume URL" className="input" onChange={(e) => update("resume", e.target.value)} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Fit Questions</h2>

            <textarea placeholder="Why do you want this role?" className="input h-24" onChange={(e) => update("whyRole", e.target.value)} />
            <textarea placeholder="Why this startup?" className="input h-24" onChange={(e) => update("whyStartup", e.target.value)} />
            <textarea placeholder="What have you built?" className="input h-24" onChange={(e) => update("whatBuilt", e.target.value)} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Work Eligibility</h2>

            <input placeholder="Need visa sponsorship?" className="input" onChange={(e) => update("visa", e.target.value)} />
            <input placeholder="Work authorization status" className="input" onChange={(e) => update("workAuth", e.target.value)} />
            <input placeholder="Preferred start date" className="input" onChange={(e) => update("startDate", e.target.value)} />
            <input placeholder="Salary expectations" className="input" onChange={(e) => update("salary", e.target.value)} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review Application</h2>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-sm text-white/65 space-y-2">
              <p><b>Name:</b> {form.firstName} {form.lastName}</p>
              <p><b>Email:</b> {form.email}</p>
              <p><b>Experience:</b> {form.yearsExperience} years</p>
              <p><b>Current Role:</b> {form.currentRole}</p>
              <p><b>Portfolio:</b> {form.portfolio}</p>
            </div>

            <button
              onClick={submit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C8CFF] to-[#D4AF37] text-black font-medium hover:opacity-90"
            >
              Submit Application
            </button>
          </div>
        )}

        <div className="flex justify-between mt-10">
          {step > 1 ? (
            <button onClick={back} className="text-white/45 hover:text-white">
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 && (
            <button
              onClick={next}
              className="px-6 py-2 rounded-full bg-white text-black text-sm font-medium hover:opacity-90"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          outline: none;
          color: white;
          font-size: 14px;
        }
        .input:focus {
          border-color: rgba(124,140,255,0.6);
          box-shadow: 0 0 0 2px rgba(124,140,255,0.15);
        }
      `}</style>
    </main>
  );
}