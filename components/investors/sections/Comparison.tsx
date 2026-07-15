"use client";

import { motion } from "framer-motion";

export default function Comparison() {
  return (
    <section
      id="comparison"
      className="relative w-full py-28 flex justify-center"
    >
      <div className="relative z-10 w-full max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-white/30">
            Investment Access Model
          </span>

          <h2 className="mt-4 text-3xl font-medium text-white md:text-4xl">
            Traditional vs Cirglob
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/45 md:text-base">
            Two fundamentally different approaches to sourcing, filtering, and
            accessing private market opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8"
          >
            <h3 className="mb-6 text-sm font-medium tracking-wide text-white/80">
              Traditional Startup Investing
            </h3>

            <ul className="space-y-4 text-sm text-white/45">
              <li>• Fragmented deal sourcing across multiple channels</li>
              <li>• Reactive discovery with inconsistent filtering</li>
              <li>• High volume, low signal exposure</li>
              <li>• Limited context around founder quality</li>
              <li>• Unstructured investor experience</li>
              <li>• Broad, unfocused opportunity flow</li>
            </ul>

            <div className="mt-8 text-xs text-white/25">
              Outcome: inefficiency + signal dilution
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/[0.04] p-8"
          >
            <h3 className="mb-6 text-sm font-medium tracking-wide text-white">
              Cirglob Investor Network
            </h3>

            <ul className="space-y-4 text-sm text-white/60">
              <li>• Curated deal flow based on structured signals</li>
              <li>• Pre-qualified opportunities aligned to investor profile</li>
              <li>• High-signal, low-noise selection model</li>
              <li>• Direct exposure to vetted founders globally</li>
              <li>• Controlled, intentional investor journey</li>
              <li>• Precision-matched opportunity delivery</li>
            </ul>

            <div className="mt-8 text-xs text-white/40">
              Outcome: clarity + signal concentration
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-40" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
