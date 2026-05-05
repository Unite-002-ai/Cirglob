"use client";

import { motion, AnimatePresence } from "framer-motion";

type FAQ = {
  category: string;
  question: string;
  answer: string;
};

type Props = {
  item: FAQ;
  isOpen: boolean;
  onToggle: () => void;
};

export default function FAQItem({ item, isOpen, onToggle }: Props) {
  return (
    <div className="relative border border-white/10 rounded-xl bg-white/5 backdrop-blur-xl overflow-hidden">

      {/* Glow (active) */}
      {isOpen && (
        <div className="absolute -inset-1 bg-blue-500/10 blur-xl rounded-xl pointer-events-none" />
      )}

      {/* Question */}
      <button
        onClick={onToggle}
        className="relative z-10 w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-[15px] md:text-[16px] font-medium text-white">
          {item.question}
        </span>

        <span className="text-gray-400 text-lg">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* Answer (animated) */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 overflow-hidden"
          >
            <div className="pb-6 text-sm text-gray-400 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}