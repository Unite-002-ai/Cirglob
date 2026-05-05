"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Application",
    description:
      "Founders submit their startup application during open batches. Includes idea, problem, team, and current stage.",
  },
  {
    title: "Review",
    description:
      "Applications are reviewed to understand problem clarity, execution approach, and potential real-world impact.",
  },
  {
    title: "Batch Selection",
    description:
      "Selected startups are grouped into structured evaluation batches for consistency and fair assessment.",
  },
  {
    title: "Showcase",
    description:
      "Startups are optionally showcased on the Cirglob platform to improve visibility and discovery.",
  },
  {
    title: "Investor Access",
    description:
      "Investors are introduced to curated startup batches after evaluation and validation phases.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-28 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-[40px] font-semibold tracking-tight md:text-[48px]">
            How Cirglob Works
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.7] text-white/55 md:text-[18px]">
            A structured system designed to discover and support founders solving real-world problems.
            Built for transparency, fairness, and long-term scale.
          </p>
        </motion.div>

        <div className="relative mt-20 space-y-6">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10 md:left-6" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              className="relative pl-12 md:pl-16"
            >
              <div className="absolute left-2 top-6 h-3 w-3 rounded-full bg-blue-400/70 shadow-[0_0_20px_rgba(77,124,255,0.35)] md:left-4" />

              <div className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/15">
                <div className="absolute -inset-1 rounded-2xl bg-blue-500/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <h3 className="text-[18px] font-medium md:text-[20px]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-[1.7] text-white/55 md:text-[15px]">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mt-20 max-w-2xl text-center text-sm leading-[1.6] text-white/35"
        >
          Cirglob is currently in development. Application cycles, selection systems, and investor access
          will be activated after official launch.
        </motion.p>
      </div>
    </section>
  );
}