"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FormData = {
  fullName: string;
  email: string;
  country: string;
  investorType: string;
  checkSize: string;
  sectors: string[];
  valueAdd: string[];
  bio: string;
  why: string;
  alignment: boolean;
};

const steps = [
  "Identity",
  "Type",
  "Capital",
  "Sector",
  "Network",
  "Track",
  "Alignment",
  "Review",
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    country: "",
    investorType: "",
    checkSize: "",
    sectors: [],
    valueAdd: [],
    bio: "",
    why: "",
    alignment: false,
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleArray = (field: "sectors" | "valueAdd", value: string) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      };
    });
  };

  return (
    <main className="min-h-screen bg-[#05060A] text-white flex flex-col">

      {/* ================= TOP ================= */}
      <div className="max-w-[900px] mx-auto w-full px-6 pt-16">

        <h1 className="text-[28px] font-semibold">
          Cirglob Investor Application
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Private access for qualified investors. Estimated time: 4–6 minutes.
        </p>

        {/* Progress */}
        <div className="mt-8">
          <div className="h-[2px] bg-white/10">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Step {step + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[700px] border border-white/10 rounded-2xl p-8 bg-[#0A0B10]"
        >
          {/* STEP SWITCH */}
          {step === 0 && (
            <>
              <h2 className="text-xl mb-6">Identity & Contact</h2>

              <input
                placeholder="Full Legal Name"
                className="input"
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="input mt-4"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <input
                placeholder="Country"
                className="input mt-4"
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
              />
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-xl mb-6">Investor Type</h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Angel",
                  "VC Fund",
                  "Family Office",
                  "Corporate",
                ].map((type) => (
                  <div
                    key={type}
                    onClick={() =>
                      setForm({ ...form, investorType: type })
                    }
                    className={`p-4 border rounded-lg cursor-pointer ${
                      form.investorType === type
                        ? "border-white"
                        : "border-white/10"
                    }`}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl mb-6">Capital</h2>

              {["$10k–25k", "$25k–100k", "$100k+"].map((size) => (
                <div
                  key={size}
                  onClick={() => setForm({ ...form, checkSize: size })}
                  className={`p-3 border rounded-lg mb-3 cursor-pointer ${
                    form.checkSize === size
                      ? "border-white"
                      : "border-white/10"
                  }`}
                >
                  {size}
                </div>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl mb-6">Sector Focus</h2>

              <div className="flex flex-wrap gap-2">
                {["AI", "Fintech", "SaaS", "Climate"].map((s) => (
                  <div
                    key={s}
                    onClick={() => toggleArray("sectors", s)}
                    className={`px-3 py-2 rounded-full text-sm cursor-pointer ${
                      form.sectors.includes(s)
                        ? "bg-white text-black"
                        : "bg-white/10"
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl mb-6">Value Add</h2>

              {[
                "Introductions",
                "Hiring",
                "Fundraising",
                "Strategy",
              ].map((v) => (
                <div
                  key={v}
                  onClick={() => toggleArray("valueAdd", v)}
                  className={`p-3 border rounded-lg mb-3 cursor-pointer ${
                    form.valueAdd.includes(v)
                      ? "border-white"
                      : "border-white/10"
                  }`}
                >
                  {v}
                </div>
              ))}
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl mb-6">Track Record</h2>

              <textarea
                placeholder="Short professional bio"
                className="input h-[120px]"
                onChange={(e) =>
                  setForm({ ...form, bio: e.target.value })
                }
              />
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-xl mb-6">Alignment</h2>

              <textarea
                placeholder="Why Cirglob?"
                className="input h-[120px]"
                onChange={(e) =>
                  setForm({ ...form, why: e.target.value })
                }
              />

              <div
                onClick={() =>
                  setForm({ ...form, alignment: !form.alignment })
                }
                className={`mt-4 p-3 border rounded-lg cursor-pointer ${
                  form.alignment ? "border-white" : "border-white/10"
                }`}
              >
                Agree to Cirglob standards
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <h2 className="text-xl mb-6">Review</h2>

              <div className="text-sm text-gray-400 space-y-2">
                <p>{form.fullName}</p>
                <p>{form.email}</p>
                <p>{form.investorType}</p>
                <p>{form.checkSize}</p>
                <p>{form.sectors.join(", ")}</p>
              </div>

              <button className="mt-6 w-full py-3 bg-white text-black rounded-lg">
                Submit Application
              </button>
            </>
          )}

          {/* NAV */}
          <div className="flex justify-between mt-10">
            <button
              onClick={back}
              className="text-sm text-gray-400 hover:text-white"
            >
              Back
            </button>

            {step < 7 && (
              <button
                onClick={next}
                className="text-sm bg-white text-black px-5 py-2 rounded-lg"
              >
                Continue
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* ================= STYLE ================= */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          outline: none;
        }
      `}</style>
    </main>
  );
}