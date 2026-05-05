"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ThankYouPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="relative min-h-screen bg-[#05060A] text-white overflow-hidden flex items-center justify-center">

      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500/10 blur-[200px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="h-2 w-2 rounded-full bg-[#6C8CFF] shadow-[0_0_20px_rgba(108,140,255,0.8)]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Application received
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-gray-400 text-[15px] leading-relaxed">
          We’ve received your application and it is now under review by the Cirglob team.
          If there’s a strong fit, we’ll reach out directly.
        </p>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-white/10" />

        {/* Info Cards */}
        <div className="grid gap-3 text-left">

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-sm text-white/80 font-medium">What happens next</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Our team reviews applications weekly. Strong candidates are contacted within 5–10 days.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-sm text-white/80 font-medium">Selection process</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              We evaluate based on execution ability, systems thinking, and founder-level mindset.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-sm text-white/80 font-medium">Stay connected</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Follow Cirglob updates while we review your application.
            </p>
          </div>

        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">

          <Link
            href="/careers/jobs"
            className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:opacity-90 transition"
          >
            Explore more roles
          </Link>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-full border border-white/15 bg-white/5 text-white text-sm hover:bg-white/10 transition"
          >
            Back to home
          </Link>

        </div>

        {/* Footer Note */}
        <p className="mt-10 text-xs text-gray-500">
          Cirglob Talent System · Built for high-signal builders
        </p>

      </div>
    </main>
  );
}