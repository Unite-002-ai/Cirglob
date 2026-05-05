"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function InvestorsHero() {
  return (
    <section className="relative w-full bg-[#05060A] text-white pt-[140px] pb-[120px] overflow-hidden">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-purple-500/10 blur-[160px] rounded-full" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[720px]"
        >

          {/* Label */}
          <div className="text-xs tracking-[0.2em] uppercase text-gray-500">
            Cirglob Investor Network
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-[40px] md:text-[56px] font-semibold leading-[1.1] tracking-tight">
            Curated capital for
            <br />
            long-term builders
          </h1>

          {/* Description */}
          <p className="mt-6 text-gray-400 text-[17px] md:text-[19px] leading-[1.7] max-w-[600px]">
            Cirglob is a private network of investors selected not only for
            capital, but for the strategic value, relationships, and long-term
            partnership they bring to founders.
          </p>

          {/* Secondary Copy */}
          <p className="mt-4 text-gray-500 text-[15px] max-w-[520px] leading-[1.6]">
            Not every investor is admitted. Each application is evaluated across
            capital strength, network quality, reputation, and alignment with
            founder-first principles.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">

            <Link href="/investors/apply">
              <button className="px-7 py-3 rounded-lg bg-white text-black text-sm font-medium hover:opacity-90 transition">
                Apply for Access
              </button>
            </Link>

            <Link href="#criteria">
              <button className="px-7 py-3 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition">
                View Criteria
              </button>
            </Link>

          </div>

          {/* Trust Signal */}
          <div className="mt-12 flex items-center gap-6 text-xs text-gray-600">
            <span>Private access</span>
            <span>•</span>
            <span>Selective admission</span>
            <span>•</span>
            <span>Founder-first standards</span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}