"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const signals = [
  "Global founder network",
  "High-signal deal selection",
  "Long-term alignment focus",
  "Structured investor access",
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden px-6 py-12 md:py-16"
    >
      <div className="relative z-10 mx-auto max-w-5xl translate-y-[-10px] text-center md:translate-y-[-16px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5"
        >
          <span className="text-xs tracking-[0.25em] uppercase text-white/40">
            Cirglob Investor Network
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl font-semibold tracking-tight text-white leading-[1.08] md:text-6xl"
        >
          Access curated startup opportunities
          <span className="mt-2 block text-white/70">through Cirglob</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/55 md:mt-6 md:text-lg"
        >
          Cirglob maintains a private investor network connecting qualified
          investors with high-signal startups across global markets and emerging
          technologies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/investors/apply"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            Request Access
          </Link>

          <Link
            href="#benefits"
            className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/5 px-6 py-3 text-sm text-white/85 transition-all hover:border-white/24 hover:bg-white/8 hover:text-white"
          >
            Learn More
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-10 md:mt-12"
        >
          <p className="text-xs tracking-wide text-white/30">
            Private access • Reviewed applications • Selective admission
          </p>

          <div className="mt-5 md:mt-6">
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/25">
              Network Principles
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {signals.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
