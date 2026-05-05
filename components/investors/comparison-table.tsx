"use client";

import { motion } from "framer-motion";

const rows = [
  {
    feature: "Capital Capacity",
    tierA: "High / scalable deployment",
    tierB: "Moderate capacity",
    reject: "Unverified or inconsistent",
  },
  {
    feature: "Founder Alignment",
    tierA: "Founder-first mindset",
    tierB: "Neutral alignment",
    reject: "Misaligned incentives",
  },
  {
    feature: "Strategic Value",
    tierA: "Strong operator & network value",
    tierB: "Limited contribution",
    reject: "No meaningful value-add",
  },
  {
    feature: "Reputation",
    tierA: "Established & trusted",
    tierB: "Neutral track record",
    reject: "Questionable or unknown",
  },
  {
    feature: "Time Horizon",
    tierA: "Long-term partnership focus",
    tierB: "Mixed horizon",
    reject: "Short-term / speculative",
  },
  {
    feature: "Access Level",
    tierA: "Priority onboarding",
    tierB: "Standard review queue",
    reject: "Waitlist / decline",
  },
];

export default function ComparisonTable() {
  return (
    <section className="relative w-full bg-[#05060A] py-24 text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-[36px] md:text-[44px] font-semibold tracking-tight">
            Investor Quality Framework
          </h2>

          <p className="mt-4 text-gray-400 text-[16px] md:text-[18px] max-w-2xl mx-auto leading-relaxed">
            Cirglob evaluates investors not just on capital, but on strategic value,
            long-term alignment, and contribution to founders.
          </p>
        </div>

        {/* Table Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/10 bg-[#18181B]/60 backdrop-blur-xl overflow-hidden"
        >
          {/* Header Row */}
          <div className="grid grid-cols-4 text-left text-xs uppercase tracking-wider text-gray-400 border-b border-white/10">
            <div className="p-5">Criteria</div>
            <div className="p-5 text-blue-400">Tier A</div>
            <div className="p-5 text-gray-300">Tier B</div>
            <div className="p-5 text-red-400">Reject / Waitlist</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {rows.map((row, index) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
                className="grid grid-cols-4"
              >
                {/* Feature */}
                <div className="p-5 text-sm text-white font-medium">
                  {row.feature}
                </div>

                {/* Tier A */}
                <div className="p-5 text-sm text-blue-300">
                  {row.tierA}
                </div>

                {/* Tier B */}
                <div className="p-5 text-sm text-gray-300">
                  {row.tierB}
                </div>

                {/* Reject */}
                <div className="p-5 text-sm text-red-300">
                  {row.reject}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-[14px] max-w-2xl mx-auto leading-relaxed">
            This framework ensures Cirglob maintains a high-signal investor ecosystem
            where capital quality is evaluated with the same rigor as strategic value.
          </p>
        </div>
      </div>
    </section>
  );
}