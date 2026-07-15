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
      {/* TOP BAR */}
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <CirglobTopBar />
      </div>

      {/* BACKGROUND SYSTEM */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[750px] h-[750px] bg-blue-500/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[850px] h-[850px] bg-purple-500/10 blur-[220px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      <div className="relative z-10 flex-1">
        {/* ================= HERO ================= */}
        <section className="min-h-screen flex items-center justify-center text-center px-6 pt-[70px]">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.35em] text-white/50 uppercase">
              Cirglob Founder Network
            </p>

            <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight">
              Apply to Cirglob
            </h1>

            <p className="mt-6 text-gray-400 text-[16px] md:text-[17px] leading-relaxed">
            Cirglob backs founders building technically ambitious companies with exceptional execution ability and the potential to create enduring impact at global scale.            </p>

            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              The application process is designed to surface exceptional founders, operational clarity, technical depth, and long-term company potential.            </p>
            <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
              Summer 2027 Founder Cycle · Accepting Applications
            </div>

            {/* CTA */}
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
                  hover:translate-y-[-1px]
                  transition-all duration-300
                "
              >
                Begin Application
              </Link>
            </div>
          </div>
        </section>

        {/* ================= EVALUATION GRID ================= */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="mb-7">
            <h2 className="text-sm md:text-base font-medium text-white/90">
              What Cirglob Evaluates
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {[
              {
                title: "Founder Quality",
                text: "We prioritize founders with exceptional execution ability, clarity of thought, resilience, technical depth, and strong operational judgment.",
              },
              {
                title: "Company Readiness",
                text: "We evaluate how clearly the company understands its product, market, timing, technical direction, and long-term strategy.",
              },
              {
                title: "Scale Potential",
                text: "We prioritize companies capable of becoming durable, category-defining businesses with meaningful long-term leverage.",
              },
              {
                title: "Selection Philosophy",
                text: "We look for founders with unusual conviction, deep understanding of their domain, and the ability to execute through uncertainty and constraints.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="
                  rounded-2xl border border-white/10
                  bg-white/[0.03] backdrop-blur-xl
                  p-8 min-h-[210px]
                  hover:border-blue-500/20 hover:bg-white/[0.05]
                  transition-all duration-300
                "
              >
                <h3 className="text-[16px] font-medium">{card.title}</h3>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= REVIEW STRIP ================= */}
        <section className="max-w-5xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-6 py-5">
            <p className="text-sm text-gray-300 leading-relaxed">
              Applications are reviewed selectively and on a rolling basis. Founders accepted into Cirglob will be contacted directly by the team. Applications for future founder cycles are also supported through the application process.

            </p>
          </div>
        </section>

        {/* ================= FINAL SPACING ================= */}
        <section className="h-24" />
      </div>

      <CirglobBottomBar />
    </main>
  );
}