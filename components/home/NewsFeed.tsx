"use client";

import { motion } from "framer-motion";

export default function NewsFeed() {
  const news = [
    { id: "1", title: "Announcing the Cirglob AI Stack", link: "#" },
    { id: "2", title: "Emergent raises $70M Series B at $300M valuation", link: "#" },
    { id: "3", title: "Govdash raises $30M Series B", link: "#" },
    { id: "4", title: "Fleetzero raises $43M for battery-powered cargo ships", link: "#" },
    { id: "5", title: "Deepgram raises $130M Series C", link: "#" },
    { id: "6", title: "Default Alive or Default Dead", link: "#" },
    { id: "7", title: "Do Things That Don’t Scale", link: "#" },
    { id: "8", title: "Startup = Growth", link: "#" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
      <h4 className="text-[13px] uppercase tracking-[0.25em] text-white/35">
        Latest
      </h4>

      {news.map((item, index) => (
        <motion.a
          key={item.id}
          href={item.link}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          viewport={{ once: true }}
          className="group flex items-center justify-between text-white/60 transition hover:text-white"
        >
          <span className="text-[14px] leading-snug">
            {item.title}
          </span>

          <span className="text-white/25 transition group-hover:text-blue-300">
            ›
          </span>
        </motion.a>
      ))}
    </div>
  );
}