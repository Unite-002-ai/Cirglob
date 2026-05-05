"use client";

import { motion } from "framer-motion";

export default function ApplyCTA() {
  return (
    <section className="relative py-28 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-[34px] font-semibold leading-[1.2] tracking-tight md:text-[46px]"
        >
          Join as a founder building real-world solutions
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-6 text-sm leading-relaxed tracking-wide text-white/55 md:text-base"
        >
          Applications will open in structured batches after launch
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <button className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] px-8 py-4 text-lg font-medium text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.08]">
            <div className="absolute -inset-1 rounded-xl bg-blue-500/10 opacity-0 blur-2xl transition duration-500 hover:opacity-100" />
            <span className="relative">Apply</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}