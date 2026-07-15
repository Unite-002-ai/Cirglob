'use client';

import { motion } from 'framer-motion';

export default function TrustStrip() {
  const signals = [
    'Global founder network',
    'High-signal deal selection',
    'Long-term alignment focus',
    'Structured investor access',
  ];

  return (
    <section className="relative w-full flex items-center justify-center">
      <div className="relative z-10 max-w-5xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <span className="text-[11px] tracking-[0.3em] uppercase text-white/30">
            Network Principles
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          {signals.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-white/60 text-sm tracking-wide"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
