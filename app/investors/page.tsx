"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-[#05060A] text-white">

      {/* ================= HERO ================= */}
      <section className="relative py-[140px] px-6 text-center overflow-hidden">
        
        {/* subtle glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
          <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-[900px] mx-auto">
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[42px] md:text-[56px] font-semibold tracking-tight leading-[1.1]"
          >
            Cirglob Investor Network
          </motion.h1>

          <p className="mt-6 text-gray-400 text-[18px] leading-[1.7]">
            Private access for investors who bring capital, strategic value,
            and long-term partnership to founders building real-world solutions.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Not everyone gets in.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/investors/apply">
              <button className="px-6 py-3 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90 transition">
                Apply as Investor
              </button>
            </Link>

            <Link href="#criteria">
              <button className="px-6 py-3 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition">
                View Criteria
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PHILOSOPHY ================= */}
      <section id="criteria" className="py-[100px] px-6">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-10">

          {/* Tier A */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">
              Tier A Investors
            </h3>
            <ul className="text-gray-400 text-sm space-y-2 leading-relaxed">
              <li>Strong capital capacity</li>
              <li>Founder-friendly mindset</li>
              <li>Respected reputation</li>
              <li>Can open strategic doors</li>
              <li>Long-term orientation</li>
              <li>Deep industry expertise</li>
              <li>Powerful network</li>
            </ul>
          </div>

          {/* Tier B */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">
              Tier B Investors
            </h3>
            <ul className="text-gray-400 text-sm space-y-2 leading-relaxed">
              <li>Capital available</li>
              <li>Limited value-add</li>
              <li>Selective participation</li>
              <li>Lower priority access</li>
            </ul>
          </div>

          {/* Rejected */}
          <div>
            <h3 className="text-white text-lg font-medium mb-4">
              Not Accepted
            </h3>
            <ul className="text-gray-400 text-sm space-y-2 leading-relaxed">
              <li>Poor reputation</li>
              <li>Short-term speculation</li>
              <li>No founder relevance</li>
              <li>Unprofessional behavior</li>
              <li>Weak verification</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= VALUE ================= */}
      <section className="py-[100px] px-6 border-t border-white/5">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-16">

          <div>
            <h2 className="text-[28px] md:text-[34px] font-semibold leading-tight">
              Curated Capital Infrastructure
            </h2>

            <p className="mt-6 text-gray-400 leading-[1.7]">
              Cirglob is not an open marketplace. Every investor is vetted for
              capital strength, strategic value, and alignment with founders.
            </p>

            <p className="mt-4 text-gray-400 leading-[1.7]">
              This ensures that when founders engage through Cirglob, they are
              interacting with investors who can genuinely move their company forward.
            </p>
          </div>

          <div className="space-y-6 text-sm text-gray-400">
            <div>
              <p className="text-white mb-1">For Founders</p>
              <p>Access to high-quality, aligned investors.</p>
            </div>

            <div>
              <p className="text-white mb-1">For Investors</p>
              <p>Access to vetted, high-potential startups.</p>
            </div>

            <div>
              <p className="text-white mb-1">For Cirglob</p>
              <p>Trust-driven ecosystem with compounding network value.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STANDARDS ================= */}
      <section className="py-[100px] px-6 border-t border-white/5">
        <div className="max-w-[900px] mx-auto text-center">

          <h2 className="text-[28px] md:text-[34px] font-semibold">
            Investor Standards
          </h2>

          <p className="mt-4 text-gray-400">
            All accepted investors are expected to operate under the following principles.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {[
              "Respectful to founders",
              "No time wasting",
              "No predatory terms",
              "Confidentiality",
              "Timely decisions",
              "Constructive communication",
              "Long-term support",
            ].map((item, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-xl p-4 text-sm text-gray-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-[120px] px-6 border-t border-white/5 text-center">
        <div className="max-w-[700px] mx-auto">

          <h2 className="text-[32px] md:text-[40px] font-semibold">
            Apply to Join
          </h2>

          <p className="mt-4 text-gray-400">
            We review every application carefully to ensure alignment,
            quality, and long-term value for the network.
          </p>

          <div className="mt-10">
            <Link href="/investors/apply">
              <button className="px-8 py-4 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90 transition">
                Start Application
              </button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Estimated time: 4–6 minutes
          </p>
        </div>
      </section>

    </main>
  );
}