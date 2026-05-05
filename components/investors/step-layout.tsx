"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import ProgressBar from "./progress-bar";

interface StepLayoutProps {
  step: number;
  children: ReactNode;
  title: string;
  description?: string;
  subtitle?: string;
}

export default function StepLayout({
  step,
  children,
  title,
  description,
  subtitle,
}: StepLayoutProps) {
  return (
    <div className="min-h-screen bg-[#05060A] text-white flex flex-col">

      {/* 🔵 GLOBAL PROGRESS HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#05060A]/80 border-b border-white/5">
        <ProgressBar step={step} />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex items-start justify-center px-6 py-14">

        <div className="w-full max-w-4xl">

          {/* 🔷 HEADER SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >

            {/* Subtitle / Micro label */}
            {subtitle && (
              <p className="text-[12px] uppercase tracking-[0.25em] text-blue-400 mb-3">
                {subtitle}
              </p>
            )}

            {/* Title */}
            <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="mt-4 text-[15px] md:text-[16px] text-gray-400 leading-[1.7] max-w-2xl">
                {description}
              </p>
            )}

          </motion.div>

          {/* 🧊 FORM CONTAINER CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative"
          >

            {/* Glow background */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-2xl opacity-60" />

            {/* Main Card */}
            <div className="relative rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-2xl">

              <div className="p-8 md:p-10">
                {children}
              </div>

            </div>
          </motion.div>

          {/* 🧠 FOOTER TRUST NOTE */}
          <div className="mt-10 text-center text-[12px] text-gray-500 leading-[1.6]">

            <p>
              All applications are reviewed under Cirglob’s institutional capital standards.
            </p>

            <p className="mt-1 text-gray-600">
              Tier-based evaluation • Confidential review process • Founder-aligned filtering
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}