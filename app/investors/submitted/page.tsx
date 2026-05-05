"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function SubmittedPage() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[25%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* ================= CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[640px]"
      >

        {/* Subtle container (not heavy card) */}
        <div className="border border-white/10 rounded-2xl bg-[#0A0B10]/80 backdrop-blur-xl p-10">

          {/* Status Indicator */}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            Application received
          </div>

          {/* Title */}
          <h1 className="mt-4 text-[28px] md:text-[32px] font-semibold leading-tight">
            Thank you for your application
          </h1>

          {/* Body */}
          <p className="mt-5 text-gray-400 leading-[1.7] text-[15px]">
            We review every investor application carefully across capital quality,
            founder value-add, strategic fit, and long-term alignment with the
            Cirglob network.
          </p>

          <p className="mt-4 text-gray-400 leading-[1.7] text-[15px]">
            Qualified applicants may be invited to join shortly.
          </p>

          {/* Divider */}
          <div className="mt-8 h-px bg-white/10" />

          {/* Meta Info */}
          <div className="mt-6 space-y-2 text-sm text-gray-400">
            <p>
              Review timeline:{" "}
              <span className="text-white">3–10 business days</span>
            </p>

            <p>
              Status updates will be sent to your email.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">

            <Link href="/">
              <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90 transition">
                Return to Home
              </button>
            </Link>

            <Link href="/investors">
              <button className="w-full sm:w-auto px-6 py-3 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition">
                Investor Overview
              </button>
            </Link>

          </div>

        </div>

        {/* Subtle footer note */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Cirglob Investor Network — curated capital, long-term partnerships
        </p>

      </motion.div>
    </main>
  );
}