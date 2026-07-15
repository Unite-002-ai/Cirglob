"use client";

import { motion } from "framer-motion";

type Benefit = {
  title: string;
  description: string;
};

const benefits: Benefit[] = [
  {
    title: "Curated Deal Flow",
    description:
      "Access filtered opportunities selected through structured signals, not open-market noise.",
  },
  {
    title: "Intelligent Matching",
    description:
      "Opportunities aligned to investor profile, stage preference, and strategic focus.",
  },
  {
    title: "Founder Access",
    description:
      "Direct exposure to vetted founders building across emerging global markets.",
  },
  {
    title: "Global Reach",
    description:
      "Cross-border opportunities spanning key innovation hubs and emerging ecosystems.",
  },
  {
    title: "Structured Experience",
    description:
      "A controlled investment flow designed to eliminate fragmentation and noise.",
  },
  {
    title: "Strategic Alignment",
    description:
      "Focus on long-term capital relationships, not transactional deal exposure.",
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="relative w-full py-24 flex justify-center">
      <div className="relative z-10 w-full max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-white/30">
            Why Cirglob Investor Network
          </span>

          <h2 className="mt-4 text-3xl font-medium tracking-tight text-white md:text-4xl">
            A structured capital access layer
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/45 md:text-base">
            Designed to remove noise, improve signal quality, and streamline
            investor exposure to relevant opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/16 hover:bg-white/[0.05]"
            >
              <h3 className="text-sm font-medium tracking-wide text-white/90">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-white/45">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
