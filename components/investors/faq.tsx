"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "What is the Cirglob Investor Network?",
      answer:
        "A curated capital ecosystem where only high-quality investors are accepted based on capital strength, strategic value, reputation, and long-term alignment with founders. This is not an open signup system — it is a selective network.",
    },
    {
      question: "How is investor selection evaluated?",
      answer:
        "Every applicant is scored across six dimensions: Capital Strength, Network Strength, Sector Relevance, Reputation, Founder Value-Add, and Long-Term Alignment. Each dimension is independently reviewed before approval decisions are made.",
    },
    {
      question: "What does Tier A investor mean?",
      answer:
        "Tier A investors are those who bring both capital and meaningful strategic value — including strong networks, founder support, operational experience, and a long-term partnership mindset.",
    },
    {
      question: "How long does the application review take?",
      answer:
        "Typical review time is 3–10 business days depending on application volume and the depth of verification required for your profile and network.",
    },
    {
      question: "Can I be rejected or placed on waitlist?",
      answer:
        "Yes. Cirglob actively filters for quality. Applicants who do not meet capital, reputation, or alignment standards may be rejected or placed on a waitlist for future reconsideration.",
    },
    {
      question: "What makes Cirglob different from other investor networks?",
      answer:
        "Cirglob is not a directory or marketplace. It is a curated capital infrastructure designed to protect founder quality by ensuring only credible, value-adding investors are introduced into the ecosystem.",
    },
    {
      question: "Is there a minimum capital requirement?",
      answer:
        "There is no fixed minimum, but capital capacity is evaluated relative to stage focus and strategic value. Higher tiers of investment capacity significantly improve approval probability.",
    },
  ];

  return (
    <section className="w-full bg-[#05060A] text-white py-[120px] relative overflow-hidden">
      
      {/* Ambient Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-purple-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto px-6">

        {/* Header */}
        <div className="mb-14">
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-gray-400 text-[16px] md:text-[18px] leading-[1.7] max-w-2xl">
            Clear answers about the Cirglob Investor Network, selection process,
            and what it means to be part of a curated capital ecosystem.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Glow border */}
                <div className="absolute -inset-0.5 rounded-2xl bg-blue-500/10 blur opacity-0 hover:opacity-100 transition" />

                <div className="relative border border-white/10 rounded-2xl bg-[#18181B]/60 backdrop-blur-xl overflow-hidden">

                  {/* Question */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[15px] md:text-[16px] font-medium text-white">
                      {item.question}
                    </span>

                    <span
                      className={`text-sm transition-transform duration-300 text-gray-400 ${
                        isOpen ? "rotate-45 text-blue-400" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {/* Answer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-[14px] md:text-[15px] text-gray-400 leading-[1.7]">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Trust Note */}
        <div className="mt-14 text-center text-gray-500 text-sm">
          Cirglob applies institutional-grade review standards to every investor application.
        </div>
      </div>
    </section>
  );
}