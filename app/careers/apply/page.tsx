"use client";

import { useState } from "react";
import Link from "next/link";

export default function CareersApplyPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    linkedin: "",
    location: "",
    portfolio: "",
    role: "",
    motivation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // later connect to API / DB
    console.log("Applicant Submitted:", form);

    window.location.href = "/careers/thank-you";
  };

  return (
    <main className="min-h-screen bg-[#05060A] text-white relative overflow-hidden">

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[180px] rounded-full" />
      </div>

      {/* Container */}
      <div className="relative max-w-[760px] mx-auto px-6 py-20">

        {/* BACK */}
        <Link
          href="/careers/jobs"
          className="text-sm text-white/50 hover:text-white transition"
        >
          ← Back to roles
        </Link>

        {/* HEADER */}
        <div className="mt-6">
          <h1 className="text-[42px] md:text-[52px] font-semibold tracking-tight">
            Apply to Cirglob
          </h1>

          <p className="mt-4 text-white/50 leading-relaxed max-w-xl">
            Join a small elite team building the infrastructure for the AI-first global economy.
            We review every application personally.
          </p>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-5"
        >

          {/* NAME */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
            />

            <input
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
            />
          </div>

          {/* EMAIL */}
          <input
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
          />

          {/* LINKEDIN */}
          <input
            name="linkedin"
            placeholder="LinkedIn URL"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
          />

          {/* LOCATION */}
          <input
            name="location"
            placeholder="Location (City / Country)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
          />

          {/* PORTFOLIO */}
          <input
            name="portfolio"
            placeholder="Portfolio / GitHub (optional)"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
          />

          {/* ROLE */}
          <input
            name="role"
            placeholder="Role you are applying for"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-blue-400/40 outline-none"
          />

          {/* MOTIVATION */}
          <textarea
            name="motivation"
            placeholder="Why Cirglob?"
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm min-h-[140px] focus:border-blue-400/40 outline-none"
          />

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-white text-black font-medium hover:opacity-90 transition"
          >
            Submit Application →
          </button>

        </form>

        {/* TRUST FOOTER */}
        <p className="mt-6 text-xs text-white/40 leading-relaxed">
          By applying, you agree that Cirglob may review your information for hiring, matching,
          and ecosystem opportunities.
        </p>

      </div>
    </main>
  );
}