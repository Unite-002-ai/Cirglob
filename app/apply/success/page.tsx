"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ApplySuccessPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060A] text-white">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] h-[760px] w-[760px] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute bottom-[-25%] right-[-15%] h-[860px] w-[860px] rounded-full bg-purple-500/10 blur-[220px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
      </div>

      {/* Brand */}
      <div className="fixed left-6 top-6 z-50">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.35)] transition hover:border-white/20 hover:bg-white/10"
          aria-label="Cirglob Home"
        >
          <CirglobLogo />
          <span className="text-[20px] font-semibold tracking-[-0.03em] text-white transition group-hover:opacity-90">
            Cirglob
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-4xl">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8 md:p-10">
            {/* Top status row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <div className="h-3 w-3 rounded-full bg-[#6C8CFF] shadow-[0_0_24px_rgba(108,140,255,0.85)]" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                    Application Submitted
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Cirglob Founder Program
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
                Summer 2026 Batch
              </div>
            </div>

            {/* Main */}
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
              <div>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
                  Thank you for applying to Cirglob
                </h1>

                <p className="mt-5 max-w-2xl text-[16px] leading-[1.8] text-gray-400 md:text-[17px]">
                  We&apos;ve received your application and our team will review it
                  carefully. If there&apos;s a strong fit, you&apos;ll hear from us
                  about next steps.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                    Rolling review
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                    Founder-first evaluation
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                    Built for real-world problems
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-[0_0_40px_rgba(80,120,255,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(120,80,255,0.35)]"
                  >
                    Return Home
                  </Link>

                  <Link
                    href="/apply/dashboard"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                  >
                    Back to Applications
                  </Link>
                </div>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    What happens next
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    Applications are reviewed on a rolling basis. Priority candidates may receive a response within 5–10 days.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    Review focus
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    We evaluate clarity of the problem, founder quality, execution ability, and fit with the Cirglob batch.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    Program note
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">
                    Cirglob is designed for high-signal builders solving meaningful real-world problems across emerging markets and beyond.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom guidance */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-medium text-white">Timeline expectation</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                If you&apos;re selected, we&apos;ll contact you directly with follow-up details for the next stage. Keep an eye on your email, and feel free to return to your dashboard anytime.
              </p>
            </div>

            <p className="mt-8 text-center text-xs tracking-[0.24em] text-white/40 uppercase">
              Cirglob Founder Program · Built for serious builders
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function CirglobLogo() {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 5;

  return (
    <svg
      width="30"
      height="36"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="cg-main"
          x1="14"
          y1="12"
          x2="50"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4AA8FF" />
          <stop offset="55%" stopColor="#5B6CFF" />
          <stop offset="100%" stopColor="#7D3DFF" />
        </linearGradient>
      </defs>

      <path
        d="M46 20 A20 20 0 1 0 46 44"
        stroke="url(#cg-main)"
        strokeWidth="10"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        fill="none"
        strokeDasharray={`${circumference - gapSize} ${gapSize}`}
        strokeDashoffset={circumference * 0.35}
      />
    </svg>
  );
}