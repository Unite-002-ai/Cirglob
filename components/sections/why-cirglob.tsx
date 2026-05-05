"use client";

import { motion } from "framer-motion";

const cards = [
  {
    title: "Built for emerging markets",
    body:
      "Many founders outside major tech hubs face limited access to investors, networks, and global visibility. Cirglob exists to reduce that gap.",
  },
  {
    title: "Focused on real problems",
    body:
      "Cirglob prioritizes startups solving real-world challenges such as infrastructure, healthcare, education, finance, logistics, and security. Not trends. Not hype. Real impact.",
  },
  {
    title: "Structured access, not randomness",
    body:
      "Applications are reviewed in batches to create a fair and structured selection process. Founders are evaluated based on problem clarity, execution ability, and potential impact.",
  },
];

export default function WhyCirglob() {
  return (
    <section className="relative py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <h2 className="text-[40px] font-semibold tracking-tight md:text-[48px]">
            Why Cirglob
          </h2>

          <p className="mt-6 max-w-[720px] text-[18px] leading-[1.7] text-white/55 md:text-[20px]">
            Built to support founders in places where opportunity is limited — and real-world problems are everywhere.
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute -inset-1 rounded-3xl bg-blue-500/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />

              <div className="relative h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 group-hover:-translate-y-1 group-hover:border-white/15">
                <h3 className="text-[20px] font-medium text-white">
                  {card.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-white/55">
                  {card.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center text-sm text-white/35"
        >
          Cirglob is currently in development. Applications will open after launch in structured batches.
        </motion.p>
      </div>
    </section>
  );
}