"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Limited access to investors",
    description:
      "Founders in many regions struggle to reach investors, even when they are building strong solutions. Access is often based on geography and networks rather than quality of ideas.",
    glow: "rgba(77,124,255,0.14)",
  },
  {
    title: "Hidden startup talent",
    description:
      "Many strong founders are not visible to global accelerators or investors due to lack of exposure, networks, or structured platforms.",
    glow: "rgba(124,58,237,0.14)",
  },
  {
    title: "Lack of structured guidance",
    description:
      "Early-stage founders often build without access to experienced mentors who can help them avoid critical mistakes in product, scaling, and fundraising.",
    glow: "rgba(99,102,241,0.12)",
  },
  {
    title: "Misalignment with real-world needs",
    description:
      "Many startups focus on trends rather than real infrastructure, economic, or social problems that affect everyday systems.",
    glow: "rgba(255,255,255,0.05)",
  },
];

export default function ProblemsSection() {
  return (
    <section className="relative py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <h2 className="text-[44px] font-semibold leading-[1.1] tracking-tight md:text-[52px]">
            The structural problems in global startup access
          </h2>

          <p className="mt-6 max-w-[700px] text-[16px] leading-[1.7] text-white/55 md:text-[18px]">
            Cirglob is being built to reduce the gap between founders with strong ideas
            and access to capital, mentorship, and global visibility — especially in emerging markets.
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 auto-rows-fr gap-6 md:grid-cols-2">
          {problems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group relative h-full"
            >
              <div
                className="absolute -inset-1 rounded-3xl blur-2xl opacity-0 transition duration-500 group-hover:opacity-100"
                style={{ background: item.glow }}
              />

              <div className="relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 group-hover:border-white/15">
                <h3 className="text-[18px] font-medium text-white md:text-[20px]">
                  {item.title}
                </h3>

                <p className="mt-4 text-[14px] leading-[1.7] text-white/55 md:text-[15px]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}