"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section id="cta" className="relative w-full py-28">
      <div className="relative mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl border border-white/10 bg-white/[0.03] px-10 py-14 text-center backdrop-blur-xl"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Request access to the Cirglob Investor Network
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Applications are reviewed individually. Qualified investors are
            granted access to curated, high-signal startup opportunities across
            global markets.
          </p>

          <div className="mx-auto my-8 h-px w-24 bg-white/10" />

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/investors/apply"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-white/90"
            >
              Request Access
              <span className="ml-2 opacity-70">→</span>
            </Link>

            <Link
              href="#hero"
              className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/5 px-6 py-3 text-sm text-white/85 transition-all hover:border-white/24 hover:bg-white/8 hover:text-white"
            >
              Back to top
            </Link>
          </div>

          <p className="mt-8 text-xs text-white/40">
            No guarantees. Selective review process. Designed for qualified
            investors only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
