"use client";

import { motion } from "framer-motion";

const tiers = [
  {
    title: "Tier A Investors",
    subtitle: "Preferred access",
    description:
      "High-capacity, founder-friendly investors who bring strategic value beyond capital.",
    points: [
      "Strong capital deployment capability",
      "Founder-aligned mindset",
      "Respected market reputation",
      "Ability to open strategic doors",
      "Long-term partnership orientation",
      "Deep operational or sector expertise",
    ],
    accent: "blue",
  },
  {
    title: "Tier B Investors",
    subtitle: "Standard access",
    description:
      "Capital-backed investors with moderate strategic contribution potential.",
    points: [
      "Capital availability verified",
      "Neutral or limited network leverage",
      "Standard investment behavior",
      "Selective strategic involvement",
      "Evaluated on case-by-case basis",
    ],
    accent: "gray",
  },
  {
    title: "Waitlist / Reject",
    subtitle: "Restricted access",
    description:
      "Applicants who do not meet Cirglob’s long-term ecosystem standards.",
    points: [
      "Short-term or speculative behavior",
      "Weak founder alignment",
      "Low strategic relevance",
      "Unverified or unclear background",
      "Not suitable for curated ecosystem",
    ],
    accent: "red",
  },
];

export default function BenefitsGrid() {
  return (
    <section className="relative w-full bg-[#05060A] py-24 text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-[36px] md:text-[44px] font-semibold tracking-tight">
            Investor Access Philosophy
          </h2>

          <p className="mt-4 text-gray-400 text-[16px] md:text-[18px] max-w-2xl mx-auto leading-relaxed">
            Cirglob is not an open network. It is a curated capital system designed
            to ensure only high-quality, long-term aligned investors participate.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Glow */}
              <div
                className={`absolute -inset-1 rounded-2xl blur-2xl opacity-20 transition ${
                  tier.accent === "blue"
                    ? "bg-blue-500/20"
                    : tier.accent === "red"
                    ? "bg-red-500/10"
                    : "bg-white/5"
                }`}
              />

              {/* Card */}
              <div className="relative rounded-2xl border border-white/10 bg-[#18181B] p-6 backdrop-blur-xl hover:-translate-y-1 transition duration-300">

                {/* Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-medium">{tier.title}</h3>
                  <span className="text-xs text-gray-400">{tier.subtitle}</span>
                </div>

                {/* Description */}
                <p className="mt-3 text-[14px] text-gray-400 leading-relaxed">
                  {tier.description}
                </p>

                {/* Points */}
                <ul className="mt-5 space-y-2">
                  {tier.points.map((point, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-gray-300 flex items-start gap-2"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/40" />
                      {point}
                    </li>
                  ))}
                </ul>

                {/* Bottom Accent Line */}
                <div
                  className={`mt-6 h-[1px] w-full opacity-30 ${
                    tier.accent === "blue"
                      ? "bg-blue-500"
                      : tier.accent === "red"
                      ? "bg-red-500"
                      : "bg-white"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 text-[14px] max-w-2xl mx-auto leading-relaxed">
            This classification system ensures Cirglob maintains a high-signal,
            founder-first investor ecosystem where capital quality is as important
            as capital quantity.
          </p>
        </div>
      </div>
    </section>
  );
}