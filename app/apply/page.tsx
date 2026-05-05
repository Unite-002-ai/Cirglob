"use client";

import Link from "next/link";
import { useEffect } from "react";

import CirglobTopBar from "@/components/cirglob-top-bar";
import CirglobBottomBar from "@/components/cirglob-bottom-bar";

export default function ApplyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="relative min-h-screen bg-[#05060A] text-white overflow-hidden flex flex-col">

      {/* FIXED TOP BAR (ALWAYS VISIBLE) */}
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <CirglobTopBar />
      </div>

      {/* IMPORTANT: TOP PADDING TO PREVENT OVERLAP */}
      <div className="pt-[70px] flex-1">

        {/* BACKGROUND GLOW SYSTEM */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[750px] h-[750px] bg-blue-500/10 blur-[180px] rounded-full" />
          <div className="absolute bottom-[-25%] right-[-15%] w-[850px] h-[850px] bg-purple-500/10 blur-[220px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-28">

          {/* HERO */}
          <div className="text-center">

            <p className="text-xs tracking-[0.35em] text-white/50 uppercase">
              Cirglob Founder Program
            </p>

            <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
              Apply to Cirglob
            </h1>

            <p className="mt-6 text-gray-400 text-[16px] md:text-[17px] leading-relaxed max-w-2xl mx-auto">
              Cirglob supports founders building high-impact companies across AI,
              fintech, infrastructure, healthcare, cybersecurity, logistics, education,
              and frontier technologies.
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Summer 2026 Founder Batch — applications are now open.
            </p>

            {/* PRIMARY CTA */}
            <div className="mt-10">
              <Link
                href="/apply/dashboard"
                className="
                  inline-flex items-center justify-center
                  px-7 py-3.5 rounded-full
                  bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600
                  text-white text-sm font-medium
                  shadow-[0_0_40px_rgba(80,120,255,0.25)]
                  hover:shadow-[0_0_60px_rgba(120,80,255,0.35)]
                  hover:scale-[1.02]
                  transition-all duration-300
                "
              >
                Start Application
              </Link>
            </div>

          </div>

          {/* INFO GRID */}
          <div className="mt-28 grid md:grid-cols-2 gap-7">

            {[
              {
                title: "What we look for",
                text: "Founders with strong execution ability, product intuition, and deep understanding of real-world problems. We prioritize builders over ideas.",
              },
              {
                title: "Program structure",
                text: "10–12 week founder batch with mentorship, investor access, and Cirglob system support across product, growth, and fundraising.",
              },
              {
                title: "Global mindset",
                text: "We are global-first. Founders from any country are welcome. Remote participation is fully supported.",
              },
              {
                title: "Why Cirglob",
                text: "We operate like a venture system — combining capital, infrastructure, and execution support into one unified ecosystem.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="
                  group relative rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-8
                  min-h-[210px]
                  hover:border-blue-500/20
                  hover:bg-white/[0.05]
                  transition-all duration-300
                "
              >
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl transition" />

                <h3 className="relative text-[16px] font-medium text-white">
                  {card.title}
                </h3>

                <p className="relative mt-4 text-sm text-gray-400 leading-relaxed">
                  {card.text}
                </p>
              </div>
            ))}

          </div>

          {/* APPLICATION INFO SECTION */}
          <div className="mt-28 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10">

            <h2 className="text-xl font-medium">
              About the Application Process
            </h2>

            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              The Cirglob application is designed to evaluate founders beyond ideas —
              focusing on execution ability, clarity of thinking, and real problem understanding.
            </p>

            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Selected founders join structured batches where they receive ecosystem access,
              investor exposure, and long-term support.
            </p>

            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Cirglob evolves with its founders — early applicants actively shape the platform itself.
            </p>

          </div>

          {/* HELP SECTION (ONLY FAQ + CONTACT) */}
          <div className="mt-24 text-center">

            <h2 className="text-lg font-medium">
              Need help?
            </h2>

            <p className="mt-3 text-sm text-gray-400 max-w-xl mx-auto">
              Questions about eligibility or the application process? Reach out anytime.
            </p>

            <div className="mt-6 flex items-center justify-center gap-5 text-sm">
              <Link href="/faq" className="text-white/60 hover:text-white transition">
                FAQ
              </Link>
              <span className="text-white/20">•</span>
              <Link href="/contact" className="text-white/60 hover:text-white transition">
                Contact
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* FOOTER */}
      <CirglobBottomBar />

    </main>
  );
}